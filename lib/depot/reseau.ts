import 'server-only';

import { interroger, uneLigne } from '@/lib/bd/client';
import type { Creneau as Intervalle } from '@/lib/regles/capacite';
import {
  dansLesHoraires,
  dureeDansLaJournee,
  heureDe,
  horairesDuJour,
  minutesDe,
  nombreDeJours,
  A_CONVENIR,
  type Creneau,
  type Horaires,
} from '@/lib/regles/creneau';
import {
  occupeAilleurs,
  placesRestantes,
  prochaineHeureLibre,
} from '@/lib/regles/demande';
import {
  distanceEnMetres,
  distanceArrondie,
  RAYON_DE_RECHERCHE_METRES,
  type Point,
} from '@/lib/regles/distance';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import { instantABruxelles } from '@/lib/temps';
import { ETATS_QUI_OCCUPENT_UNE_PLACE } from '@/lib/regles/capacite';

/**
 * Les emplacements du réseau, tels qu'un membre les cherche et les consulte.
 *
 * Règle 4 : tout est lu dans `emplacement_visible`. La distance se calcule
 * depuis le centre de la zone et s'arrondit ; l'adresse n'apparaît nulle part
 * dans ce fichier.
 */

const ETATS_QUI_RETIENNENT = ETATS_QUI_OCCUPENT_UNE_PLACE;

/** Un avis publié : les deux avis déposés, ou un seul depuis sept jours. */
export const AVIS_PUBLIE = `a.masque_le is null
  and (a.publie_le is not null or a.ecrit_le <= now() - interval '7 days')`;

type LigneVisible = {
  reference: string;
  bikeSitterId: string;
  prenom: string;
  initialeDuNom: string;
  type: string;
  quartier: string;
  capacite: number;
  verrouillage: string;
  intemperie: string;
  acces: string;
  ancrage: string | null;
  services: string[];
  velosAcceptes: string[];
  description: string | null;
  chaqueVeloAttache: boolean;
  securiteEnPlus: string[];
  accesDifficile: boolean;
  precisionDAcces: string | null;
  priseElectrique: boolean;
  delaiDeReponse: string;
  rythme: string;
  dureeMaxHeures: number;
  dureeMaxJours: number;
  latitude: number;
  longitude: number;
  jours: number[];
  ouverture: string | null;
  fermeture: string | null;
  parJour: Record<string, { de: string; a: string }>;
  fermetures: string[];
  vuLe: Date | null;
  membreDepuis: number;
  derniereGarde: Date | null;
  noteMoyenne: number | null;
  nombreDAvis: number;
  gardesMenees: number;
  nombreDePhotos: number;
  identiteVerifiee: boolean;
  telephoneVerifie: boolean;
  emailVerifie: boolean;
};

const COLONNES = `
  v.reference,
  v.bike_sitter_id                             as "bikeSitterId",
  v.prenom_du_bike_sitter                      as prenom,
  upper(left(m.nom, 1))                        as "initialeDuNom",
  v.type, v.quartier, v.capacite, v.verrouillage, v.intemperie, v.acces,
  v.ancrage, v.services,
  v.velos_acceptes                             as "velosAcceptes",
  v.description,
  v.chaque_velo_attache                        as "chaqueVeloAttache",
  v.securite_en_plus                           as "securiteEnPlus",
  v.acces_difficile                            as "accesDifficile",
  v.precision_d_acces                          as "precisionDAcces",
  v.prise_electrique                           as "priseElectrique",
  v.delai_de_reponse                           as "delaiDeReponse",
  v.rythme,
  v.duree_max_heures                           as "dureeMaxHeures",
  v.duree_max_jours                            as "dureeMaxJours",
  v.latitude_de_zone::float8                   as latitude,
  v.longitude_de_zone::float8                  as longitude,
  v.jours_d_accueil::int[]                     as jours,
  to_char(v.heure_d_ouverture, 'HH24:MI')      as ouverture,
  to_char(v.heure_de_fermeture, 'HH24:MI')     as fermeture,
  v.horaires_par_jour                          as "parJour",
  array(select to_char(d, 'YYYY-MM-DD') from unnest(v.fermetures) d) as fermetures,
  m.vu_le                                      as "vuLe",
  extract(year from m.cree_le)::int            as "membreDepuis",
  m.verification = 'verifiee'                  as "identiteVerifiee",
  m.telephone_verifie_le is not null           as "telephoneVerifie",
  m.email_verifie_le is not null               as "emailVerifie",
  (select max(s.repris_le)
     from stationnement s join emplacement e2 on e2.id = s.emplacement_id
    where e2.membre_id = v.bike_sitter_id and s.etat = 'termine') as "derniereGarde",
  (select count(*)::int
     from stationnement s join emplacement e2 on e2.id = s.emplacement_id
    where e2.membre_id = v.bike_sitter_id and s.etat = 'termine') as "gardesMenees",
  (select avg(a.note)::float8 from avis_sur_une_garde a
    where a.cible_id = v.bike_sitter_id and a.sens = 'cycliste_vers_bike_sitter'
      and ${AVIS_PUBLIE}) as "noteMoyenne",
  (select count(*)::int from avis_sur_une_garde a
    where a.cible_id = v.bike_sitter_id and a.sens = 'cycliste_vers_bike_sitter'
      and ${AVIS_PUBLIE}) as "nombreDAvis",
  (select count(*)::int from photo_emplacement ph
     join emplacement e4 on e4.id = ph.emplacement_id
    where e4.reference = v.reference) as "nombreDePhotos"`;

export function horairesDe(ligne: {
  jours: readonly number[];
  ouverture: string | null;
  fermeture: string | null;
  parJour: Record<string, { de: string; a: string }>;
  fermetures: readonly string[];
}): Horaires {
  return {
    jours: ligne.jours,
    ouverture: ligne.ouverture,
    fermeture: ligne.fermeture,
    parJour: ligne.parJour ?? {},
    fermetures: ligne.fermetures,
  };
}

export type Disponibilite = {
  dansLesHoraires: boolean;
  dureeAcceptee: boolean;
  placesLibres: number;
  occupeAilleurs: boolean;
  prochaineHeureLibre: string | null;
};

type GardeRetenue = Intervalle & { reference: string; bikeSitterId: string };

async function gardesRetenues(
  bikeSitters: readonly string[],
  creneau: Creneau,
): Promise<GardeRetenue[]> {
  if (bikeSitters.length === 0) return [];
  const debut = instantABruxelles(creneau.jourDepot, '00:00');
  const fin = instantABruxelles(creneau.jourReprise, '23:59');
  const lignes = await interroger<{
    reference: string;
    bikeSitterId: string;
    debut: Date;
    fin: Date;
  }>(
    `select e.reference, e.membre_id as "bikeSitterId", s.debut, s.fin
       from stationnement s join emplacement e on e.id = s.emplacement_id
      where e.membre_id = any($1::uuid[])
        and s.etat = any($2::text[])
        and s.fin > $3::timestamptz - interval '1 day'
        and s.debut < $4::timestamptz + interval '1 day'`,
    [bikeSitters, ETATS_QUI_RETIENNENT, debut, fin],
  );
  return lignes.map((l) => ({
    ...l,
    debut: new Date(l.debut),
    fin: new Date(l.fin),
  }));
}

function evaluer(
  ligne: LigneVisible,
  creneau: Creneau,
  retenues: readonly GardeRetenue[],
  sauf: string | null = null,
): Disponibilite {
  const horaires = horairesDe(ligne);
  const jours = nombreDeJours(creneau);
  const dureeAcceptee =
    jours === 1
      ? dureeDansLaJournee(creneau) <= ligne.dureeMaxHeures * 60
      : ligne.dureeMaxJours === A_CONVENIR || jours <= ligne.dureeMaxJours;

  const surCetEmplacement = retenues.filter(
    (g) => g.reference === ligne.reference,
  );
  const ailleurs = retenues.filter(
    (g) =>
      g.bikeSitterId === ligne.bikeSitterId && g.reference !== ligne.reference,
  );

  const libre = (c: Creneau) => {
    const debut = instantABruxelles(c.jourDepot, c.heureDepot);
    const fin = instantABruxelles(c.jourReprise, c.heureReprise);
    if (!debut || !fin) return { places: 0, ailleurs: false };
    const demande = { debut, fin };
    return {
      places: placesRestantes(ligne.capacite, surCetEmplacement, demande),
      ailleurs: occupeAilleurs(ailleurs, demande),
    };
  };

  const maintenant = libre(creneau);
  let suivante: string | null = null;
  const jourDuDepot = horairesDuJour(horaires, creneau.jourDepot);
  if (
    (maintenant.places <= 0 || maintenant.ailleurs) &&
    jours === 1 &&
    jourDuDepot
  ) {
    const duree = dureeDansLaJournee(creneau);
    const trouvee = prochaineHeureLibre(
      minutesDe(creneau.heureDepot),
      duree,
      minutesDe(jourDuDepot.a),
      (debut) => {
        const essai = {
          ...creneau,
          heureDepot: heureDe(debut),
          heureReprise: heureDe(debut + duree),
        };
        if (!dansLesHoraires(horaires, essai)) return false;
        const resultat = libre(essai);
        return resultat.places > 0 && !resultat.ailleurs;
      },
    );
    suivante = trouvee === null ? null : heureDe(trouvee);
  }
  void sauf;

  return {
    dansLesHoraires: dansLesHoraires(horaires, creneau),
    dureeAcceptee,
    placesLibres: maintenant.places,
    occupeAilleurs: maintenant.ailleurs,
    prochaineHeureLibre: suivante,
  };
}

export type EmplacementTrouve = {
  reference: string;
  bikeSitterId: string;
  prenom: string;
  initialeDuNom: string;
  type: string;
  quartier: string;
  capacite: number;
  distance: number;
  latitude: number;
  longitude: number;
  intemperie: string;
  verrouillage: string;
  ancrage: string | null;
  accesDifficile: boolean;
  velosAcceptes: string[];
  acces: string;
  noteMoyenne: number | null;
  nombreDAvis: number;
  gardesMenees: number;
  nombreDePhotos: number;
  identiteVerifiee: boolean;
  vuLe: Date | null;
  derniereGarde: Date | null;
  disponibilite: Disponibilite;
};

/**
 * Les emplacements publiés autour d'un lieu, évalués sur un créneau.
 *
 * Ceux qui ne tiennent pas le créneau (jour fermé, durée refusée) sont
 * écartés ; ceux qui le tiennent mais n'ont plus de place restent, marqués
 * complets : les cacher ferait croire que le quartier est vide.
 */
export async function emplacementsAutourDe(
  membreId: string,
  lieu: Point,
  creneau: Creneau,
): Promise<EmplacementTrouve[]> {
  // Une première sélection large, en degrés, avant le calcul exact.
  const lignes = await interroger<LigneVisible>(
    `select ${COLONNES}
       from emplacement_visible v
       join membre m on m.id = v.bike_sitter_id
      where m.verification = 'verifiee'
        and not m.suspendu
        and v.bike_sitter_id <> $1
        and cardinality(v.jours_d_accueil) > 0
        and not exists (select 1 from blocage b
                         where (b.membre_id = $1 and b.bloque_id = v.bike_sitter_id)
                            or (b.membre_id = v.bike_sitter_id and b.bloque_id = $1))
        and abs(v.latitude_de_zone - $2) < 0.05
        and abs(v.longitude_de_zone - $3) < 0.08`,
    [membreId, lieu.latitude, lieu.longitude],
  );

  const retenues = await gardesRetenues(
    [...new Set(lignes.map((l) => l.bikeSitterId))],
    creneau,
  );

  return lignes
    .map((ligne) => ({
      ligne,
      distance: distanceArrondie(distanceEnMetres(lieu, ligne)),
    }))
    .filter(({ distance }) => distance <= RAYON_DE_RECHERCHE_METRES)
    .map(({ ligne, distance }) => ({
      reference: ligne.reference,
      bikeSitterId: ligne.bikeSitterId,
      prenom: ligne.prenom,
      initialeDuNom: ligne.initialeDuNom,
      type: ligne.type,
      quartier: ligne.quartier,
      capacite: ligne.capacite,
      distance,
      latitude: ligne.latitude,
      longitude: ligne.longitude,
      intemperie: ligne.intemperie,
      verrouillage: ligne.verrouillage,
      ancrage: ligne.ancrage,
      accesDifficile: ligne.accesDifficile,
      velosAcceptes: ligne.velosAcceptes,
      acces: ligne.acces,
      nombreDAvis: ligne.nombreDAvis,
      gardesMenees: ligne.gardesMenees,
      nombreDePhotos: ligne.nombreDePhotos,
      identiteVerifiee: ligne.identiteVerifiee,
      noteMoyenne:
        ligne.nombreDAvis >= AVIS_POUR_AFFICHER_UNE_NOTE
          ? ligne.noteMoyenne
          : null,
      vuLe: ligne.vuLe,
      derniereGarde: ligne.derniereGarde,
      disponibilite: evaluer(ligne, creneau, retenues),
    }))
    .filter(
      (e) => e.disponibilite.dansLesHoraires && e.disponibilite.dureeAcceptee,
    )
    .sort((a, b) => a.distance - b.distance);
}

export type AvisAffiche = {
  id: string;
  auteurPrenom: string;
  auteurInitiale: string;
  note: number;
  criteres: Record<string, number>;
  texte: string | null;
  ecritLe: Date;
  reponse: string | null;
  cibleId: string;
  conteste: boolean;
};

export type FicheDuReseau = LigneVisible & {
  disponibilite: Disponibilite;
  avis: AvisAffiche[];
  estLeSien: boolean;
};

export async function ficheDuReseau(
  membreId: string,
  reference: string,
  creneau: Creneau,
): Promise<FicheDuReseau | null> {
  const ligne = await uneLigne<LigneVisible>(
    `select ${COLONNES}
       from emplacement_visible v
       join membre m on m.id = v.bike_sitter_id
      where v.reference = $1 and not m.suspendu
        -- Un blocage, dans un sens ou dans l'autre, efface la fiche : la
        -- personne bloquée ne l'apprend pas par un message.
        and not exists (select 1 from blocage b
                         where (b.membre_id = $2 and b.bloque_id = v.bike_sitter_id)
                            or (b.membre_id = v.bike_sitter_id and b.bloque_id = $2))`,
    [reference, membreId],
  );
  if (!ligne) return null;

  const estLeSien = ligne.bikeSitterId === membreId;
  const [retenues, avis] = await Promise.all([
    gardesRetenues([ligne.bikeSitterId], creneau),
    avisRecus(ligne.bikeSitterId, 'cycliste_vers_bike_sitter'),
  ]);

  if (!estLeSien) {
    await interroger(
      'update emplacement set vues = vues + 1 where reference = $1',
      [reference],
    );
  }

  return {
    ...ligne,
    noteMoyenne:
      ligne.nombreDAvis >= AVIS_POUR_AFFICHER_UNE_NOTE
        ? ligne.noteMoyenne
        : null,
    disponibilite: evaluer(ligne, creneau, retenues),
    avis,
    estLeSien,
  };
}

export async function avisRecus(
  cibleId: string,
  sens: 'cycliste_vers_bike_sitter' | 'bike_sitter_vers_cycliste' | null,
): Promise<AvisAffiche[]> {
  return interroger<AvisAffiche>(
    `select a.id, m.prenom as "auteurPrenom", upper(left(m.nom, 1)) as "auteurInitiale",
            a.note, a.criteres, a.texte, a.ecrit_le as "ecritLe", a.reponse,
            a.cible_id as "cibleId", a.conteste_le is not null as conteste
       from avis_sur_une_garde a
       join membre m on m.id = a.auteur_id
      where a.cible_id = $1
        and ($2::text is null or a.sens = $2)
        and ${AVIS_PUBLIE}
      order by a.ecrit_le desc
      limit 30`,
    [cibleId, sens],
  );
}

/** Un emplacement évalué sur un créneau, sans en compter une vue. */
export async function disponibiliteDe(
  reference: string,
  creneau: Creneau,
): Promise<(LigneVisible & { disponibilite: Disponibilite }) | null> {
  const ligne = await uneLigne<LigneVisible>(
    `select ${COLONNES}
       from emplacement_visible v
       join membre m on m.id = v.bike_sitter_id
      where v.reference = $1 and not m.suspendu`,
    [reference],
  );
  if (!ligne) return null;
  const retenues = await gardesRetenues([ligne.bikeSitterId], creneau);
  return { ...ligne, disponibilite: evaluer(ligne, creneau, retenues) };
}

export type EmplacementRecent = {
  reference: string;
  bikeSitterId: string;
  prenom: string;
  initialeDuNom: string;
  type: string;
  quartier: string;
  capacite: number;
  velosAcceptes: string[];
  vuLe: Date | null;
};

/** Les derniers emplacements publiés, hors les siens et ceux des membres bloqués. */
export async function emplacementsRecents(
  membreId: string,
  nombre: number,
): Promise<EmplacementRecent[]> {
  return interroger<EmplacementRecent>(
    `select v.reference, v.bike_sitter_id as "bikeSitterId",
            v.prenom_du_bike_sitter as prenom, upper(left(m.nom, 1)) as "initialeDuNom",
            v.type, v.quartier, v.capacite, v.velos_acceptes as "velosAcceptes",
            m.vu_le as "vuLe"
       from emplacement_visible v
       join membre m on m.id = v.bike_sitter_id
      where v.bike_sitter_id <> $1 and not m.suspendu
        and m.verification = 'verifiee'
        and cardinality(v.jours_d_accueil) > 0
        and not exists (select 1 from blocage b
                         where (b.membre_id = $1 and b.bloque_id = v.bike_sitter_id)
                            or (b.membre_id = v.bike_sitter_id and b.bloque_id = $1))
      order by v.cree_le desc
      limit $2`,
    [membreId, nombre],
  );
}

/** Ce que le réseau a mis à l'abri ce mois-ci : un chiffre collectif, jamais un classement. */
export async function velosALAbriCeMois(): Promise<number> {
  const ligne = await uneLigne<{ combien: number }>(
    `select count(*)::int as combien from stationnement
      where etat = 'termine' and repris_le >= date_trunc('month', now())`,
  );
  return ligne?.combien ?? 0;
}

export type MonEmplacement = {
  reference: string;
  type: string;
  quartier: string;
  capacite: number;
  publie: boolean;
  enPause: boolean;
  velosAcceptes: string[];
};

export async function emplacementsDuMembre(
  membreId: string,
): Promise<MonEmplacement[]> {
  return interroger<MonEmplacement>(
    `select reference, type, quartier, capacite, publie, en_pause as "enPause",
            velos_acceptes as "velosAcceptes"
       from emplacement where membre_id = $1 order by cree_le`,
    [membreId],
  );
}
