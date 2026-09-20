import 'server-only';

import type { PoolClient } from 'pg';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import {
  demandeAcceptee,
  demandeRecue,
  demandeRefusee,
  desistement,
} from '@/lib/courriel/modeles';
import { crediterLaGarde } from '@/lib/depot/maillons';
import { notifier } from '@/lib/depot/notifications';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { mettreEnFile } from '@/lib/envois/file';
import { ETATS_QUI_OCCUPENT_UNE_PLACE, seChevauchent } from '@/lib/regles/capacite';
import {
  AUTEUR_DU_CONSTAT,
  codeEmissible,
  constatPossible,
  ETAT_DE_LA_REMISE,
  ETATS_CLOS,
  ETATS_DU_VELO,
  LONGUEUR_D_UNE_RESERVE,
  leRetourEstMoinsBon,
  photosDuConstatVisibles,
  refusDeLaSaisie,
  refusPourLaBatteriePossible,
  retirerLesCaracteresDeControle,
  type EtatDuVelo,
} from '@/lib/regles/constat';
import type { Creneau } from '@/lib/regles/creneau';
import {
  motifsDeRefusDeLaDemande,
  occupeAilleurs,
  placesRestantes,
  type Motif,
} from '@/lib/regles/demande';
import {
  adresseVisible,
  demandeExpiree,
  demandeUnMotif,
  DETENTEUR_DU_CODE,
  estUnDesistementTardif,
  EXPIRATION_D_UNE_DEMANDE_HEURES,
  peutDeclarerLAbsence,
  peutRepartirSansDeposer,
  peutSignalerSonArrivee,
  REFUS_D_UN_GESTE,
  telephoneVisible,
  transitionPermise,
  type Acteur,
  type EtatDeGarde,
  type Geste,
  type Phase,
} from '@/lib/regles/garde';
import {
  DEMANDES_PAR_JOUR,
  MODIFICATIONS_DE_DEMANDE_PAR_JOUR,
  REMISES_REFUSEES_PAR_JOUR,
} from '@/lib/regles/limites';
import { codeEncoreValide, saisirLeCode, type Code } from '@/lib/regles/remise';
import type { TypeVelo } from '@/lib/regles/velos';
import { nouveauCodeDeRemise } from '@/lib/securite/jeton';
import {
  creneauEnFrancais,
  instantABruxelles,
  jourABruxelles,
} from '@/lib/temps';

import { disponibiliteDe, horairesDe } from './reseau';

/**
 * Les gardes, de la demande à la clôture.
 *
 * Toute écriture passe par une transaction qui verrouille la garde, relit son
 * état et demande à `lib/regles/garde.ts` si le geste est permis. Deux clics
 * simultanés, deux onglets ouverts, une page restée ouverte la veille : aucun
 * ne peut faire avancer une garde d'un état qu'elle n'a plus.
 */

const ETATS_QUI_RETIENNENT = ETATS_QUI_OCCUPENT_UNE_PLACE;

export const lienDeLaGarde = (id: string) => `/gardes/${id}`;

/** Un identifiant mal formé ne doit pas remonter en erreur de la base. */
const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Un identifiant mal formé s'arrête ici, avant d'atteindre la base. */
export function estUnIdentifiantDeGarde(id: string): boolean {
  return IDENTIFIANT.test(id);
}

export type ResultatDEcriture =
  { ok: true; id?: string } | { ok: false; motifs: Motif[] };

export const refus = (
  texte: string,
  valeurs?: Motif['valeurs'],
): ResultatDEcriture => ({
  ok: false,
  motifs: [{ texte, valeurs }],
});

// --- Les demandes qui expirent ---------------------------------------------------

/**
 * Une demande sans réponse expire au bout de vingt-quatre heures, ou quand
 * l'heure du dépôt est passée. Rien ne tourne en tâche de fond : l'expiration
 * s'applique quand quelqu'un regarde, ce qui suffit pour ce qu'on affiche.
 */
export async function expirerLesDemandes(): Promise<void> {
  await dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      id: string;
      cycliste_id: string;
      prenom: string;
    }>(
      `update stationnement s
          set etat = 'expire'
         from emplacement e, membre m
        where e.id = s.emplacement_id and m.id = e.membre_id
          and s.etat = 'demande'
          and (s.demande_le < now() - ($1 || ' hours')::interval or s.debut < now())
        returning s.id, s.cycliste_id, m.prenom`,
      [String(EXPIRATION_D_UNE_DEMANDE_HEURES)],
    );
    for (const garde of rows) {
      await client.query(
        `insert into evenement_de_garde (stationnement_id, etape, acteur) values ($1, 'expire', 'systeme')`,
        [garde.id],
      );
      await notifier(client, garde.cycliste_id, {
        texte:
          "Votre demande chez {prenom} n'a pas reçu de réponse à temps : elle a expiré.",
        valeurs: { prenom: garde.prenom },
        lien: lienDeLaGarde(garde.id),
      });
    }
  });
}

// --- La demande ----------------------------------------------------------------------

export type NouvelleDemande = {
  membreId: string;
  reference: string;
  veloId: string;
  creneau: Creneau;
  message: string;
};

type MembreDemandeur = {
  id: string;
  prenom: string;
  verifie: boolean;
  suspendu: boolean;
};

/**
 * Les motifs qui empêchent une demande, calculés comme à l'envoi.
 *
 * `remplace` désigne la demande en cours de modification : elle ne compte ni
 * comme une demande déjà en attente, ni comme une demande de plus dans la
 * journée.
 */
export async function motifsPourUneDemande(
  demande: Omit<NouvelleDemande, 'message'>,
  remplace: string | null = null,
): Promise<{ motifs: Motif[]; placesLibres: number } | null> {
  const [membre, emplacement, velo] = await Promise.all([
    uneLigne<MembreDemandeur>(
      `select id, prenom, verification = 'verifiee' as verifie, suspendu
         from membre where id = $1`,
      [demande.membreId],
    ),
    disponibiliteDe(demande.reference, demande.creneau),
    IDENTIFIANT.test(demande.veloId)
      ? uneLigne<{ type: string }>(
          'select type from velo where id = $1 and membre_id = $2',
          [demande.veloId, demande.membreId],
        )
      : Promise.resolve(null),
  ]);
  if (!membre || !emplacement) return null;

  const debut = instantABruxelles(
    demande.creneau.jourDepot,
    demande.creneau.heureDepot,
  );
  const fin = instantABruxelles(
    demande.creneau.jourReprise,
    demande.creneau.heureReprise,
  );

  const [bloque, enAttente, tropDeDemandes, dejaConfie] = await Promise.all([
    uneLigne<{ oui: boolean }>(
      `select true as oui from blocage
        where (membre_id = $1 and bloque_id = $2) or (membre_id = $2 and bloque_id = $1)`,
      [membre.id, emplacement.bikeSitterId],
    ),
    uneLigne<{ oui: boolean }>(
      `select true as oui from stationnement s
         join emplacement e on e.id = s.emplacement_id
        where s.cycliste_id = $1 and e.reference = $2 and s.etat = 'demande'
          and ($3::uuid is null or s.id <> $3::uuid)
        limit 1`,
      [membre.id, demande.reference, remplace],
    ),
    remplace ? Promise.resolve(false) : limiteDejaAtteinte(DEMANDES_PAR_JOUR, membre.id),
    debut && fin && velo
      ? uneLigne<{ prenom: string }>(
          `select m.prenom from stationnement s
             join emplacement e on e.id = s.emplacement_id
             join membre m on m.id = e.membre_id
            where s.velo_id = $1 and s.etat = any($2::text[])
              and s.debut < $4 and s.fin > $3
            limit 1`,
          [demande.veloId, ETATS_QUI_RETIENNENT, debut, fin],
        )
      : Promise.resolve(null),
  ]);

  const motifs = motifsDeRefusDeLaDemande({
    maintenant: new Date(),
    aujourdhui: jourABruxelles(),
    membre,
    emplacement: {
      bikeSitterId: emplacement.bikeSitterId,
      prenomDuBikeSitter: emplacement.prenom,
      horaires: horairesDe(emplacement),
      dureeMaxHeures: emplacement.dureeMaxHeures,
      dureeMaxJours: emplacement.dureeMaxJours,
      velosAcceptes: emplacement.velosAcceptes,
    },
    bloque: Boolean(bloque),
    demandeEnAttente: Boolean(enAttente),
    tropDeDemandes,
    velo,
    veloDejaConfieChez: dejaConfie?.prenom ?? null,
    creneau: demande.creneau,
    debut,
    placesRestantes: emplacement.disponibilite.placesLibres,
    bikeSitterOccupeAilleurs: emplacement.disponibilite.occupeAilleurs,
  });

  return { motifs, placesLibres: emplacement.disponibilite.placesLibres };
}

export async function envoyerUneDemande(
  demande: NouvelleDemande,
): Promise<ResultatDEcriture> {
  const verification = await motifsPourUneDemande(demande);
  if (!verification) {
    return refus("Cet emplacement n'est plus disponible.");
  }
  if (verification.motifs.length > 0) {
    return { ok: false, motifs: verification.motifs };
  }

  const debut = instantABruxelles(
    demande.creneau.jourDepot,
    demande.creneau.heureDepot,
  )!;
  const fin = instantABruxelles(
    demande.creneau.jourReprise,
    demande.creneau.heureReprise,
  )!;

  return dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      id: string;
      bikeSitterId: string;
      prenomDuBikeSitter: string;
      emailDuBikeSitter: string;
      typeVelo: string;
      prenomDuCycliste: string;
    }>(
      `select e.id, e.membre_id as "bikeSitterId", b.prenom as "prenomDuBikeSitter",
              b.email as "emailDuBikeSitter", v.type as "typeVelo",
              c.prenom as "prenomDuCycliste"
         from emplacement e
         join membre b on b.id = e.membre_id
         join velo v on v.id = $2 and v.membre_id = $3
         join membre c on c.id = $3
        where e.reference = $1 and e.publie
        for update of e`,
      [demande.reference, demande.veloId, demande.membreId],
    );
    const ligne = rows[0];
    if (!ligne) {
      return refus("Cet emplacement n'est plus disponible.");
    }

    const message = demande.message.trim().slice(0, 1000) || null;
    const cree = await client.query<{ id: string }>(
      `insert into stationnement
         (emplacement_id, cycliste_id, debut, fin, type_velo, velo_id, message)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [
        ligne.id,
        demande.membreId,
        debut,
        fin,
        ligne.typeVelo,
        demande.veloId,
        message,
      ],
    );
    const id = cree.rows[0]!.id;
    await noterUneTentative('demande_envoyee', demande.membreId, client);

    await client.query(
      `insert into evenement_de_garde (stationnement_id, etape, acteur) values ($1, 'demande', 'cycliste')`,
      [id],
    );
    if (message) {
      await client.query(
        'insert into message (stationnement_id, auteur_id, corps) values ($1, $2, $3)',
        [id, demande.membreId, message],
      );
    }
    await notifier(client, ligne.bikeSitterId, {
      texte: 'Nouvelle demande de garde de {prenom}.',
      valeurs: { prenom: ligne.prenomDuCycliste },
      lien: lienDeLaGarde(id),
    });
    await mettreEnFile(
      ligne.emailDuBikeSitter,
      demandeRecue({
        prenomDuBikeSitter: ligne.prenomDuBikeSitter,
        prenomDuCycliste: ligne.prenomDuCycliste,
        creneau: creneauEnFrancais(debut, fin),
        typeVelo: ligne.typeVelo,
        message,
      }),
      { client, aPropos: `stationnement ${id}` },
    );
    return { ok: true, id };
  });
}

// --- La modification d'une demande ------------------------------------------------------

export type DemandeAModifier = {
  id: string;
  reference: string;
  debut: Date;
  fin: Date;
  veloId: string | null;
  message: string | null;
};

/** Une demande se modifie tant que le bike sitter n'y a pas répondu. */
export async function demandeAModifier(
  membreId: string,
  id: string,
): Promise<DemandeAModifier | null> {
  if (!IDENTIFIANT.test(id)) return null;
  await expirerLesDemandes();
  return uneLigne<DemandeAModifier>(
    `select s.id, e.reference, s.debut, s.fin, s.velo_id as "veloId", s.message
       from stationnement s join emplacement e on e.id = s.emplacement_id
      where s.id = $1 and s.cycliste_id = $2 and s.etat = 'demande'`,
    [id, membreId],
  );
}

export async function modifierUneDemande(
  membreId: string,
  id: string,
  changement: { veloId: string; creneau: Creneau; message: string },
): Promise<ResultatDEcriture> {
  if (await limiteDejaAtteinte(MODIFICATIONS_DE_DEMANDE_PAR_JOUR, membreId)) {
    return refus(
      'Vous avez déjà modifié plusieurs demandes aujourd’hui. Écrivez plutôt un message au Bike Sitter.',
    );
  }
  const actuelle = await demandeAModifier(membreId, id);
  if (!actuelle) {
    return refus('Cette demande ne peut plus être modifiée : le Bike Sitter y a peut-être déjà répondu.');
  }
  const verification = await motifsPourUneDemande(
    {
      membreId,
      reference: actuelle.reference,
      veloId: changement.veloId,
      creneau: changement.creneau,
    },
    id,
  );
  if (!verification) return refus("Cet emplacement n'est plus disponible.");
  if (verification.motifs.length > 0) return { ok: false, motifs: verification.motifs };

  const debut = instantABruxelles(changement.creneau.jourDepot, changement.creneau.heureDepot)!;
  const fin = instantABruxelles(changement.creneau.jourReprise, changement.creneau.heureReprise)!;

  return dansUneTransaction(async (client) => {
    const g = await verrouiller(client, id, membreId);
    if (!g || g.cycliste_id !== membreId || g.etat !== 'demande') {
      return refus('Cette demande ne peut plus être modifiée : le Bike Sitter y a peut-être déjà répondu.');
    }
    const velo = await client.query<{ type: TypeVelo }>(
      'select type from velo where id = $1 and membre_id = $2',
      [changement.veloId, membreId],
    );
    if (!velo.rows[0]) return refus('Choisissez l’un de vos vélos.');

    const message = changement.message.trim().slice(0, 1000) || null;
    await client.query(
      `update stationnement
          set debut = $2, fin = $3, velo_id = $4, type_velo = $5, message = $6
        where id = $1`,
      [id, debut, fin, changement.veloId, velo.rows[0].type, message],
    );
    await noterUneTentative('demande_modifiee', membreId, client);
    // Le message d'origine reste dans la conversation ; un nouveau message y
    // ajoute la version modifiée, pour que les deux personnes lisent la même.
    if (message && message !== actuelle.message) {
      await client.query(
        'insert into message (stationnement_id, auteur_id, corps) values ($1, $2, $3)',
        [id, membreId, message],
      );
    }
    await evenement(client, id, 'demande', 'cycliste', 'Demande modifiée');
    await notifier(client, g.bike_sitter_id, {
      texte: '{prenom} a modifié sa demande de garde : {creneau}.',
      valeurs: { prenom: g.prenom_cycliste, creneau: creneauEnFrancais(debut, fin) },
      lien: lienDeLaGarde(id),
    });
    return { ok: true, id };
  });
}

// --- L'activité --------------------------------------------------------------------

export type ResumeDeGarde = {
  id: string;
  etat: EtatDeGarde;
  debut: Date;
  fin: Date;
  demandeLe: Date;
  role: Acteur;
  autreId: string;
  autrePrenom: string;
  autreInitiale: string;
  typeDEmplacement: string;
};

export async function activiteDuMembre(
  membreId: string,
): Promise<ResumeDeGarde[]> {
  await expirerLesDemandes();
  return interroger<ResumeDeGarde>(
    `select s.id, s.etat, s.debut, s.fin, s.demande_le as "demandeLe",
            case when s.cycliste_id = $1 then 'cycliste' else 'bike_sitter' end as role,
            autre.id as "autreId", autre.prenom as "autrePrenom",
            upper(left(autre.nom, 1)) as "autreInitiale",
            e.type as "typeDEmplacement"
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre autre on autre.id = case when s.cycliste_id = $1 then e.membre_id else s.cycliste_id end
      where s.cycliste_id = $1 or e.membre_id = $1
      order by s.debut desc
      limit 200`,
    [membreId],
  );
}

/** La garde qui compte maintenant : celle où quelqu'un attend quelque chose. */
export async function gardeEnCours(
  membreId: string,
): Promise<ResumeDeGarde | null> {
  const liste = await interroger<ResumeDeGarde>(
    `select s.id, s.etat, s.debut, s.fin, s.demande_le as "demandeLe",
            case when s.cycliste_id = $1 then 'cycliste' else 'bike_sitter' end as role,
            autre.id as "autreId", autre.prenom as "autrePrenom",
            upper(left(autre.nom, 1)) as "autreInitiale",
            e.type as "typeDEmplacement"
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre autre on autre.id = case when s.cycliste_id = $1 then e.membre_id else s.cycliste_id end
      where (s.cycliste_id = $1 or e.membre_id = $1)
        and s.etat = any($2::text[])
      order by s.debut
      limit 1`,
    [membreId, ETATS_QUI_RETIENNENT],
  );
  return liste[0] ?? null;
}

export async function demandesEnAttenteDeReponse(
  membreId: string,
): Promise<number> {
  const ligne = await uneLigne<{ combien: number }>(
    `select count(*)::int as combien
       from stationnement s join emplacement e on e.id = s.emplacement_id
      where e.membre_id = $1 and s.etat = 'demande'`,
    [membreId],
  );
  return ligne?.combien ?? 0;
}

// --- Le détail d'une garde -------------------------------------------------------

export type EvenementDeGarde = {
  etape: string;
  acteur: string;
  note: string | null;
  faitLe: Date;
};

export type ConstatAffiche = {
  etat: EtatDuVelo;
  note: string | null;
  etabliLe: Date;
  etabliPar: string | null;
  /** Les rangs des photos jointes : ce que chacune montre (côté gauche…). */
  rangs: number[];
  batterieVerifiee: boolean | null;
  reserve: string | null;
};

export type DetailDeGarde = {
  id: string;
  etat: EtatDeGarde;
  debut: Date;
  fin: Date;
  demandeLe: Date;
  arriveLe: Date | null;
  deposeLe: Date | null;
  reprisLe: Date | null;
  retardAnnonceLe: Date | null;
  motif: string | null;
  desistementTardif: boolean;
  role: Acteur;
  message: string | null;
  typeVelo: string;
  velo: { nom: string; type: string; couleur: string | null } | null;
  autre: {
    id: string;
    prenom: string;
    initiale: string;
    gardes: number;
    telephone: string | null;
  };
  emplacement: {
    reference: string;
    type: string;
    quartier: string;
    capacite: number;
    adresse: string | null;
    precisions: string | null;
  };
  evenements: EvenementDeGarde[];
  constats: Partial<Record<Phase, ConstatAffiche>>;
  /** Faux quatorze jours après la clôture : les photos ne s'affichent plus. */
  photosVisibles: boolean;
  avis: { deposeParMoi: boolean; deposeParLAutre: boolean };
};

export async function detailDeLaGarde(
  membreId: string,
  id: string,
): Promise<DetailDeGarde | null> {
  if (!IDENTIFIANT.test(id)) return null;
  await expirerLesDemandes();

  const ligne = await uneLigne<
    Omit<
      DetailDeGarde,
      'autre' | 'emplacement' | 'velo' | 'evenements' | 'constats' | 'avis'
    > & {
      cyclisteId: string;
      bikeSitterId: string;
      reference: string;
      typeDEmplacement: string;
      quartier: string;
      capacite: number;
      precisions: string | null;
      adresseDuBikeSitter: string;
      veloNom: string | null;
      veloType: string | null;
      veloCouleur: string | null;
      autrePrenom: string;
      autreInitiale: string;
      autreTelephone: string | null;
      autreGardes: number;
    }
  >(
    `select s.id, s.etat, s.debut, s.fin, s.demande_le as "demandeLe",
            s.arrive_le as "arriveLe", s.retard_annonce_le as "retardAnnonceLe",
            s.depose_le as "deposeLe", s.repris_le as "reprisLe",
            s.motif, s.desistement_tardif as "desistementTardif",
            s.message, s.type_velo as "typeVelo",
            s.cycliste_id as "cyclisteId", e.membre_id as "bikeSitterId",
            case when s.cycliste_id = $2 then 'cycliste' else 'bike_sitter' end as role,
            e.reference, e.type as "typeDEmplacement", e.quartier, e.capacite,
            e.precisions, e.adresse_exacte as "adresseDuBikeSitter",
            v.nom as "veloNom", v.type as "veloType", v.couleur as "veloCouleur",
            autre.prenom as "autrePrenom", upper(left(autre.nom, 1)) as "autreInitiale",
            case when autre.telephone_verifie_le is not null then autre.telephone end as "autreTelephone",
            (select count(*)::int from stationnement s2 join emplacement e2 on e2.id = s2.emplacement_id
              where s2.etat = 'termine' and (s2.cycliste_id = autre.id or e2.membre_id = autre.id)) as "autreGardes"
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       left join velo v on v.id = s.velo_id
       join membre autre on autre.id = case when s.cycliste_id = $2 then e.membre_id else s.cycliste_id end
      where s.id = $1 and (s.cycliste_id = $2 or e.membre_id = $2)`,
    [id, membreId],
  );
  if (!ligne) return null;

  const [evenements, constats, avis] = await Promise.all([
    interroger<EvenementDeGarde>(
      `select etape, acteur, note, fait_le as "faitLe"
         from evenement_de_garde where stationnement_id = $1 order by fait_le`,
      [id],
    ),
    interroger<ConstatAffiche & { phase: Phase }>(
      `select c.phase, c.etat_du_velo as etat, c.note, c.etabli_le as "etabliLe",
              m.prenom as "etabliPar",
              c.batterie_verifiee as "batterieVerifiee", c.reserve,
              array(select p.rang from photo_de_constat p where p.constat_id = c.id order by p.rang)::int[] as rangs
         from constat c left join membre m on m.id = c.etabli_par
        where c.stationnement_id = $1`,
      [id],
    ),
    interroger<{ auteur_id: string }>(
      'select auteur_id from avis_sur_une_garde where stationnement_id = $1',
      [id],
    ),
  ]);

  // Règle 4 : l'adresse exacte n'existe pour le cycliste qu'après acceptation,
  // et c'est la fonction en base qui en décide.
  let adresse: string | null = null;
  if (ligne.role === 'bike_sitter') {
    adresse = ligne.adresseDuBikeSitter;
  } else if (
    adresseVisible(ligne.etat, {
      reprisLe: ligne.reprisLe ? new Date(ligne.reprisLe) : null,
      maintenant: new Date(),
    })
  ) {
    const trouvee = await uneLigne<{ adresse: string | null }>(
      'select adresse_de_la_garde($1, $2) as adresse',
      [ligne.id, membreId],
    );
    adresse = trouvee?.adresse ?? null;
  }

  return {
    id: ligne.id,
    etat: ligne.etat,
    debut: new Date(ligne.debut),
    fin: new Date(ligne.fin),
    demandeLe: new Date(ligne.demandeLe),
    arriveLe: ligne.arriveLe ? new Date(ligne.arriveLe) : null,
    deposeLe: ligne.deposeLe ? new Date(ligne.deposeLe) : null,
    reprisLe: ligne.reprisLe ? new Date(ligne.reprisLe) : null,
    retardAnnonceLe: ligne.retardAnnonceLe,
    motif: ligne.motif,
    desistementTardif: ligne.desistementTardif,
    role: ligne.role,
    message: ligne.message,
    typeVelo: ligne.typeVelo,
    velo: ligne.veloNom
      ? {
          nom: ligne.veloNom,
          type: ligne.veloType ?? ligne.typeVelo,
          couleur: ligne.veloCouleur,
        }
      : null,
    autre: {
      id: ligne.role === 'cycliste' ? ligne.bikeSitterId : ligne.cyclisteId,
      prenom: ligne.autrePrenom,
      initiale: ligne.autreInitiale,
      gardes: ligne.autreGardes,
      telephone: telephoneVisible(ligne.etat) ? ligne.autreTelephone : null,
    },
    emplacement: {
      reference: ligne.reference,
      type: ligne.typeDEmplacement,
      quartier: ligne.quartier,
      capacite: ligne.capacite,
      adresse,
      precisions: adresse ? ligne.precisions : null,
    },
    evenements,
    constats: Object.fromEntries(constats.map((c) => [c.phase, c])),
    photosVisibles: photosDuConstatVisibles(
      {
        etat: ligne.etat,
        clotureLe: derniereCloture(evenements),
      },
      new Date(),
    ),
    avis: {
      deposeParMoi: avis.some((a) => a.auteur_id === membreId),
      deposeParLAutre: avis.some((a) => a.auteur_id !== membreId),
    },
  };
}

// --- Les gestes -----------------------------------------------------------------------

export type GardeVerrouillee = {
  id: string;
  etat: EtatDeGarde;
  debut: Date;
  fin: Date;
  type_velo: TypeVelo;
  demande_le: Date;
  arrive_le: Date | null;
  depose_le: Date | null;
  repris_le: Date | null;
  cycliste_id: string;
  velo_id: string | null;
  emplacement_id: string;
  bike_sitter_id: string;
  capacite: number;
  publie: boolean;
  prenom_cycliste: string;
  prenom_bike_sitter: string;
  email_cycliste: string;
  email_bike_sitter: string;
  adresse: string;
  suspendu: boolean;
  cycliste_suspendu: boolean;
};

export async function verrouiller(
  client: PoolClient,
  id: string,
  membreId: string,
): Promise<GardeVerrouillee | null> {
  if (!IDENTIFIANT.test(id)) return null;
  const { rows } = await client.query<GardeVerrouillee>(
    `select s.id, s.etat, s.debut, s.fin, s.type_velo, s.demande_le, s.arrive_le, s.depose_le, s.repris_le,
            s.cycliste_id, s.velo_id,
            e.id as emplacement_id, e.membre_id as bike_sitter_id, e.capacite, e.publie,
            c.prenom as prenom_cycliste, b.prenom as prenom_bike_sitter,
            c.email as email_cycliste, b.email as email_bike_sitter,
            e.adresse_exacte as adresse,
            (select suspendu from membre where id = $2) as suspendu,
            c.suspendu as cycliste_suspendu
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre c on c.id = s.cycliste_id
       join membre b on b.id = e.membre_id
      where s.id = $1 and (s.cycliste_id = $2 or e.membre_id = $2)
      for update of s`,
    [id, membreId],
  );
  return rows[0] ?? null;
}

export async function evenement(
  client: PoolClient,
  id: string,
  etape: string,
  acteur: Acteur | 'systeme',
  note: string | null = null,
  geste: Geste | null = null,
) {
  await client.query(
    'insert into evenement_de_garde (stationnement_id, etape, acteur, note, geste) values ($1, $2, $3, $4, $5)',
    [id, etape, acteur, note, geste],
  );
}

export async function effectuerUnGeste(
  membreId: string,
  id: string,
  geste: Geste,
  motifSaisi: string | null,
): Promise<ResultatDEcriture> {
  return dansUneTransaction(async (client) => {
    const g = await verrouiller(client, id, membreId);
    if (!g) return refus('Cette garde ne vous concerne pas.');
    if (g.suspendu) return refus('Compte suspendu : action impossible.');
    // Une demande d'un compte suspendu ne s'accepte plus : l'acceptation
    // enverrait l'adresse exacte (règle 4).
    if (geste === 'accepter' && g.cycliste_suspendu) {
      return refus("Cette demande n'est plus disponible.");
    }

    const acteur: Acteur =
      g.cycliste_id === membreId ? 'cycliste' : 'bike_sitter';
    const transition = transitionPermise(g.etat, geste, acteur);
    if (!transition) {
      return refus(
        "Cette action n'est plus possible : la garde a changé entre-temps.",
      );
    }
    if (geste === 'recevoir' || geste === 'restituer') {
      return refus('La remise se confirme avec le code à six chiffres.');
    }

    const motif = (motifSaisi ?? '').trim().slice(0, 600) || null;
    if (demandeUnMotif(geste) && !motif) return refus('Choisissez un motif.');

    const maintenant = new Date();
    const debut = new Date(g.debut);
    const fin = new Date(g.fin);

    // Une page restée ouverte ne ranime pas une demande que personne n'a encore
    // fait expirer en la regardant.
    if (
      g.etat === 'demande' &&
      demandeExpiree(new Date(g.demande_le), debut, maintenant)
    ) {
      await client.query(
        `update stationnement set etat = 'expire' where id = $1 and etat = 'demande'`,
        [g.id],
      );
      await evenement(client, g.id, 'expire', 'systeme');
      return refus(REFUS_D_UN_GESTE.expiree);
    }
    if (geste === 'arriver' && !peutSignalerSonArrivee(debut, fin, maintenant)) {
      return refus(REFUS_D_UN_GESTE.arrivee);
    }

    if (
      geste === 'absence' &&
      !peutDeclarerLAbsence(g.etat, debut, maintenant)
    ) {
      return refus("Attendez au moins trente minutes après l'heure convenue.");
    }
    if (
      geste === 'personne_n_ouvre' &&
      (!g.arrive_le ||
        !peutRepartirSansDeposer(new Date(g.arrive_le), maintenant))
    ) {
      return refus(
        "Attendez vingt minutes après votre arrivée, et appelez d'abord votre bike sitter.",
      );
    }

    if (geste === 'accepter') {
      // Deux acceptations au même moment chez le même bike sitter liraient
      // chacune une capacité encore libre : ses emplacements passent un par un.
      await client.query(
        'select id from emplacement where membre_id = $1 order by id for update',
        [g.bike_sitter_id],
      );
      if (!g.publie) {
        return refus(REFUS_D_UN_GESTE.pause);
      }
      const { rows: retenues } = await client.query<{
        emplacement_id: string;
        debut: Date;
        fin: Date;
      }>(
        `select s.emplacement_id, s.debut, s.fin
           from stationnement s join emplacement e on e.id = s.emplacement_id
          where e.membre_id = $1 and s.id <> $2 and s.etat = any($3::text[])
            and s.fin > $4::timestamptz - interval '1 day' and s.debut < $5::timestamptz + interval '1 day'`,
        [g.bike_sitter_id, g.id, ETATS_QUI_RETIENNENT, debut, fin],
      );
      const demande = { debut, fin };
      const ici = retenues
        .filter((r) => r.emplacement_id === g.emplacement_id)
        .map((r) => ({ debut: new Date(r.debut), fin: new Date(r.fin) }));
      const ailleurs = retenues
        .filter((r) => r.emplacement_id !== g.emplacement_id)
        .map((r) => ({ debut: new Date(r.debut), fin: new Date(r.fin) }));
      if (occupeAilleurs(ailleurs, demande)) {
        return refus(REFUS_D_UN_GESTE.ailleurs);
      }
      if (placesRestantes(g.capacite, ici, demande) <= 0) {
        return refus(REFUS_D_UN_GESTE.capacite);
      }
    }

    const tardif =
      geste === 'annuler' &&
      g.etat === 'accepte' &&
      estUnDesistementTardif(debut, maintenant);

    await client.query(
      `update stationnement
          set etat = $2,
              repondu_le = case when $3 in ('accepter', 'refuser') then now() else repondu_le end,
              arrive_le = case when $3 = 'arriver' then now() else arrive_le end,
              annule_le = case when $2 = 'annule' then now() else annule_le end,
              motif = coalesce($4, motif),
              conteste = conteste or $3 = 'signaler',
              desistement_tardif = desistement_tardif or $5
        where id = $1`,
      [g.id, transition.vers, geste, motif, tardif],
    );
    await evenement(client, g.id, transition.vers, acteur, motif, geste);

    const autreId = acteur === 'cycliste' ? g.bike_sitter_id : g.cycliste_id;
    const monPrenom =
      acteur === 'cycliste' ? g.prenom_cycliste : g.prenom_bike_sitter;
    const lien = lienDeLaGarde(g.id);
    const creneau = creneauEnFrancais(debut, fin);

    switch (geste) {
      case 'accepter': {
        await notifier(client, g.cycliste_id, {
          texte:
            "Votre demande a été acceptée. L'adresse exacte est maintenant visible.",
          lien,
        });
        await mettreEnFile(
          g.email_cycliste,
          demandeAcceptee({
            prenomDuCycliste: g.prenom_cycliste,
            prenomDuBikeSitter: g.prenom_bike_sitter,
            creneau,
            adresse: g.adresse,
          }),
          { client, aPropos: `stationnement ${g.id}` },
        );
        await annulerLesDemandesConcurrentes(client, g, debut, fin);
        await expirerLesDemandesDevenuesImpossibles(client, g, debut, fin);
        break;
      }
      case 'refuser':
        await notifier(client, g.cycliste_id, {
          texte: 'Votre demande a été refusée.',
          lien,
        });
        await mettreEnFile(
          g.email_cycliste,
          demandeRefusee({
            prenomDuCycliste: g.prenom_cycliste,
            prenomDuBikeSitter: g.prenom_bike_sitter,
            creneau,
          }),
          { client, aPropos: `stationnement ${g.id}` },
        );
        break;
      case 'annuler':
        if (g.etat === 'demande') {
          await notifier(client, autreId, {
            texte: '{prenom} a annulé sa demande.',
            valeurs: { prenom: monPrenom },
            lien,
          });
          break;
        }
        if (tardif && acteur === 'bike_sitter') {
          await notifier(client, g.cycliste_id, {
            texte:
              "{prenom} s'est désisté à moins de deux heures : {motif}. Voici les emplacements encore libres sur votre créneau.",
            valeurs: { prenom: monPrenom, motif: motif ?? '' },
            lien: `${lien}/solutions`,
            urgente: true,
          });
        } else if (tardif) {
          await notifier(client, g.bike_sitter_id, {
            texte:
              '{prenom} a annulé à moins de deux heures : {motif}. La place est de nouveau libre sur ce créneau.',
            valeurs: { prenom: monPrenom, motif: motif ?? '' },
            lien,
            urgente: true,
          });
        } else {
          await notifier(client, autreId, {
            texte: 'Garde annulée par {prenom} : {motif}',
            valeurs: { prenom: monPrenom, motif: motif ?? '' },
            lien,
          });
        }
        await mettreEnFile(
          acteur === 'cycliste' ? g.email_bike_sitter : g.email_cycliste,
          desistement({
            prenomDuDestinataire:
              acteur === 'cycliste' ? g.prenom_bike_sitter : g.prenom_cycliste,
            prenomDeCeluiQuiSeDesiste: monPrenom,
            creneau,
            tardif,
          }),
          { client, aPropos: `stationnement ${g.id}` },
        );
        break;
      case 'absence':
        await notifier(client, g.cycliste_id, {
          texte:
            "{prenom} a indiqué que le vélo n'a pas été déposé : {motif}. La garde est close.",
          valeurs: { prenom: monPrenom, motif: motif ?? '' },
          lien,
        });
        break;
      case 'personne_n_ouvre':
        await notifier(client, g.bike_sitter_id, {
          texte:
            "{prenom} s'est présenté et n'a pas pu vous joindre. Il est reparti avec son vélo, et la place est de nouveau libre.",
          valeurs: { prenom: monPrenom },
          lien,
          urgente: true,
        });
        break;
      case 'arriver':
        await notifier(client, g.bike_sitter_id, {
          texte: '{prenom} est arrivé devant chez vous avec son vélo.',
          valeurs: { prenom: monPrenom },
          lien,
          urgente: true,
        });
        break;
      case 'reprendre':
        await notifier(client, g.bike_sitter_id, {
          texte:
            '{prenom} vient récupérer son vélo. Votre code de restitution est prêt.',
          valeurs: { prenom: monPrenom },
          lien: `${lien}/remise/reprise`,
          urgente: true,
        });
        break;
      case 'signaler':
        await client.query(
          `insert into signalement (auteur_id, cible_type, cible, motif, details)
           values ($1, 'garde', $2, 'Litige sur une garde', $3)`,
          [membreId, g.id, motif],
        );
        await notifier(client, autreId, {
          texte:
            'Un litige a été ouvert sur votre garde. La modération reprend le dossier.',
          lien,
          urgente: true,
        });
        break;
      default:
        break;
    }

    return { ok: true };
  });
}

/**
 * Dès qu'une garde est confirmée, les autres demandes pour le même vélo au
 * même moment n'ont plus d'objet : un vélo ne se garde qu'à un endroit.
 */
async function annulerLesDemandesConcurrentes(
  client: PoolClient,
  g: GardeVerrouillee,
  debut: Date,
  fin: Date,
) {
  if (!g.velo_id) return;
  const { rows } = await client.query<{ id: string; bike_sitter_id: string }>(
    `update stationnement s
        set etat = 'annule', annule_le = now(),
            motif = 'Une autre garde a été confirmée pour ce vélo sur le même créneau.'
       from emplacement e
      where e.id = s.emplacement_id
        and s.velo_id = $1 and s.id <> $2 and s.etat = 'demande'
        and s.debut < $4 and s.fin > $3
      returning s.id, e.membre_id as bike_sitter_id`,
    [g.velo_id, g.id, debut, fin],
  );
  for (const autre of rows) {
    await evenement(
      client,
      autre.id,
      'annule',
      'systeme',
      'Garde confirmée ailleurs pour le même vélo',
    );
    await notifier(client, autre.bike_sitter_id, {
      texte:
        '{prenom} a confirmé une garde ailleurs sur ce créneau. Sa demande chez vous est annulée, et la place est de nouveau libre.',
      valeurs: { prenom: g.prenom_cycliste },
      lien: lienDeLaGarde(autre.id),
      urgente: true,
    });
  }
  if (rows.length > 0) {
    await notifier(client, g.cycliste_id, {
      texte:
        rows.length > 1
          ? "{nombre} autres demandes pour ce vélo ont été annulées : un vélo ne peut être gardé qu'à un endroit."
          : "Une autre demande pour ce vélo a été annulée : un vélo ne peut être gardé qu'à un endroit.",
      valeurs: { nombre: rows.length },
      lien: '/gardes',
    });
  }
}

/** L'acceptation de la dernière place fait expirer les demandes qui la visaient. */
export async function expirerLesDemandesDevenuesImpossibles(
  client: PoolClient,
  g: GardeVerrouillee,
  debut: Date,
  fin: Date,
) {
  const { rows: enAttente } = await client.query<{
    id: string;
    cycliste_id: string;
    debut: Date;
    fin: Date;
  }>(
    `select id, cycliste_id, debut, fin from stationnement
      where emplacement_id = $1 and etat = 'demande' and id <> $2
        and debut < $4::timestamptz + interval '30 minutes'
        and fin > $3::timestamptz - interval '30 minutes'`,
    [g.emplacement_id, g.id, debut, fin],
  );
  if (enAttente.length === 0) return;

  const { rows: retenues } = await client.query<{ debut: Date; fin: Date }>(
    `select debut, fin from stationnement where emplacement_id = $1 and etat = any($2::text[])`,
    [g.emplacement_id, ETATS_QUI_RETIENNENT],
  );
  for (const demande of enAttente) {
    const intervalle = {
      debut: new Date(demande.debut),
      fin: new Date(demande.fin),
    };
    const occupees = retenues.filter((r) =>
      seChevauchent(
        { debut: new Date(r.debut), fin: new Date(r.fin) },
        intervalle,
      ),
    ).length;
    if (occupees < g.capacite) continue;
    await client.query(
      `update stationnement set etat = 'expire' where id = $1 and etat = 'demande'`,
      [demande.id],
    );
    await evenement(
      client,
      demande.id,
      'expire',
      'systeme',
      'Plus de place sur ce créneau',
    );
    await notifier(client, demande.cycliste_id, {
      texte: "Le créneau demandé n'est plus disponible chez {prenom}.",
      valeurs: { prenom: g.prenom_bike_sitter },
      lien: lienDeLaGarde(demande.id),
    });
  }
}

// --- La remise par code (règle 5) --------------------------------------------------

export type VueDuCode =
  | { role: 'detenteur'; chiffres: string; emisLe: Date; expire: boolean }
  | { role: 'saisie'; essaisRestants: number }
  | null;

export async function codeDeLaRemise(
  membreId: string,
  id: string,
  phase: Phase,
): Promise<VueDuCode> {
  return dansUneTransaction(async (client) => {
    const g = await verrouiller(client, id, membreId);
    if (!g || g.etat !== ETAT_DE_LA_REMISE[phase]) return null;
    const acteur: Acteur =
      g.cycliste_id === membreId ? 'cycliste' : 'bike_sitter';
    const constatEtabli = await leConstatExiste(client, g.id, phase);

    const { rows } = await client.query<{
      chiffres: string;
      emis_le: Date;
      essais_utilises: number;
    }>(
      `select chiffres, emis_le, essais_utilises from code_de_remise
        where stationnement_id = $1 and sens = $2 and consomme_le is null`,
      [g.id, phase],
    );
    let code = rows[0];

    if (DETENTEUR_DU_CODE[phase] === acteur) {
      if (!codeEmissible({ phase, etat: g.etat, acteur, constatEtabli })) return null;
      if (!code) {
        const cree = await client.query<{
          chiffres: string;
          emis_le: Date;
          essais_utilises: number;
        }>(
          `insert into code_de_remise (stationnement_id, sens, chiffres)
           values ($1, $2, $3) returning chiffres, emis_le, essais_utilises`,
          [g.id, phase, nouveauCodeDeRemise()],
        );
        code = cree.rows[0]!;
      }
      const lu: Code = {
        chiffres: code.chiffres,
        emisLe: new Date(code.emis_le),
        essaisUtilises: code.essais_utilises,
      };
      return {
        role: 'detenteur',
        chiffres: code.chiffres,
        emisLe: lu.emisLe,
        expire: !codeEncoreValide(lu, new Date()),
      };
    }
    return {
      role: 'saisie',
      essaisRestants: code ? Math.max(0, 3 - code.essais_utilises) : 3,
    };
  });
}

/** Seul le détenteur régénère son code : sinon un tiers pourrait le rendre inutilisable. */
export async function regenererLeCode(
  membreId: string,
  id: string,
  phase: Phase,
): Promise<ResultatDEcriture> {
  return dansUneTransaction(async (client) => {
    const g = await verrouiller(client, id, membreId);
    if (!g || g.etat !== ETAT_DE_LA_REMISE[phase]) {
      return refus(
        "Cette action n'est plus possible : la garde a changé entre-temps.",
      );
    }
    const acteur: Acteur =
      g.cycliste_id === membreId ? 'cycliste' : 'bike_sitter';
    if (DETENTEUR_DU_CODE[phase] !== acteur)
      return refus("Ce code n'est pas le vôtre.");
    const constatEtabli = await leConstatExiste(client, g.id, phase);
    if (!codeEmissible({ phase, etat: g.etat, acteur, constatEtabli })) {
      return refus('Prenez d’abord les photos de votre vélo : le code s’affichera ensuite.');
    }
    await client.query(
      `update code_de_remise set consomme_le = now()
        where stationnement_id = $1 and sens = $2 and consomme_le is null`,
      [g.id, phase],
    );
    await client.query(
      'insert into code_de_remise (stationnement_id, sens, chiffres) values ($1, $2, $3)',
      [g.id, phase, nouveauCodeDeRemise()],
    );
    return { ok: true };
  });
}

export type ResultatDeLaSaisie =
  | { ok: true }
  | { ok: false; texte: string; valeurs?: Record<string, string | number> };

export async function saisirLeCodeDeLaRemise(
  membreId: string,
  id: string,
  phase: Phase,
  saisie: string,
  reserve: string | null = null,
): Promise<ResultatDeLaSaisie> {
  if (!/^[0-9]{6}$/.test(saisie)) {
    return { ok: false, texte: 'Saisissez les six chiffres.' };
  }
  const reserveEcrite =
    retirerLesCaracteresDeControle(reserve ?? '').trim().slice(0, LONGUEUR_D_UNE_RESERVE) || null;
  return dansUneTransaction(async (client): Promise<ResultatDeLaSaisie> => {
    const g = await verrouiller(client, id, membreId);
    if (!g) {
      return {
        ok: false,
        texte:
          "Cette action n'est plus possible : la garde a changé entre-temps.",
      };
    }
    const acteur: Acteur =
      g.cycliste_id === membreId ? 'cycliste' : 'bike_sitter';
    // Le vélo ne change de mains qu'une fois photographié (planche 15).
    const constat = await client.query<{ id: string }>(
      'select id from constat where stationnement_id = $1 and phase = $2',
      [g.id, phase],
    );
    const refusAvantLeCode = refusDeLaSaisie({
      phase,
      etat: g.etat,
      acteur,
      constatEtabli: Boolean(constat.rowCount),
    });
    if (refusAvantLeCode === 'garde_changee') {
      return {
        ok: false,
        texte:
          "Cette action n'est plus possible : la garde a changé entre-temps.",
      };
    }
    if (refusAvantLeCode === 'code_a_montrer') {
      return {
        ok: false,
        texte: "C'est à l'autre personne de saisir ce code.",
      };
    }
    if (refusAvantLeCode === 'photos_d_abord') {
      return {
        ok: false,
        texte:
          phase === 'depot'
            ? '{prenom} doit d’abord photographier le vélo. Les photos s’afficheront ici.'
            : 'Prenez d’abord les photos de votre vélo : elles protègent la fin de la garde.',
        valeurs: { prenom: g.prenom_cycliste },
      };
    }

    const { rows } = await client.query<{
      id: string;
      chiffres: string;
      emis_le: Date;
      essais_utilises: number;
    }>(
      `select id, chiffres, emis_le, essais_utilises from code_de_remise
        where stationnement_id = $1 and sens = $2 and consomme_le is null
        for update`,
      [g.id, phase],
    );
    const ligne = rows[0];
    if (!ligne) {
      return {
        ok: false,
        texte:
          "Aucun code n'est encore affiché : demandez à l'autre personne d'ouvrir l'écran de remise.",
      };
    }
    const cleDeLaRemise = `remise:${g.id}:${phase}`;
    if (await limiteDejaAtteinte(REMISES_REFUSEES_PAR_JOUR, cleDeLaRemise, client)) {
      return {
        ok: false,
        texte:
          'Plusieurs codes incorrects ont été saisis pour cette remise. Par sécurité, la saisie reprendra demain ; en attendant, vous pouvez signaler un problème depuis la garde.',
      };
    }
    const resultat = saisirLeCode(
      {
        chiffres: ligne.chiffres,
        emisLe: new Date(ligne.emis_le),
        essaisUtilises: ligne.essais_utilises,
      },
      saisie,
      new Date(),
    );

    if (!resultat.accepte) {
      if (resultat.motif === 'expire') {
        return {
          ok: false,
          texte: 'Ce code a expiré. Demandez-en un nouveau.',
        };
      }
      await noterUneTentative('remise_refusee', cleDeLaRemise, client);
      if (resultat.motif === 'epuise' || resultat.aRegenerer) {
        await client.query(
          'update code_de_remise set consomme_le = now() where id = $1',
          [ligne.id],
        );
        await client.query(
          'insert into code_de_remise (stationnement_id, sens, chiffres) values ($1, $2, $3)',
          [g.id, phase, nouveauCodeDeRemise()],
        );
        await notifier(
          client,
          DETENTEUR_DU_CODE[phase] === 'cycliste'
            ? g.cycliste_id
            : g.bike_sitter_id,
          {
            texte:
              'Trois saisies erronées : un nouveau code a été généré. Relisez-le à voix haute.',
            lien: `${lienDeLaGarde(g.id)}/remise/${phase}`,
            urgente: true,
          },
        );
        return {
          ok: false,
          texte:
            "Trois essais manqués. Un nouveau code vient d'être généré : demandez-le de nouveau.",
        };
      }
      await client.query(
        'update code_de_remise set essais_utilises = essais_utilises + 1 where id = $1',
        [ligne.id],
      );
      return resultat.essaisRestants > 1
        ? {
            ok: false,
            texte: 'Code incorrect. Il reste {n} essais.',
            valeurs: { n: resultat.essaisRestants },
          }
        : { ok: false, texte: 'Code incorrect. Il reste un essai.' };
    }

    await client.query(
      'update code_de_remise set consomme_le = now() where id = $1',
      [ligne.id],
    );

    if (phase === 'depot') {
      if (reserveEcrite) {
        await client.query(
          'update constat set reserve = $2, reserve_le = now() where id = $1 and reserve is null',
          [constat.rows[0]!.id, reserveEcrite],
        );
      }
      await client.query(
        `update stationnement set etat = 'en_cours', depose_le = now() where id = $1`,
        [g.id],
      );
      await evenement(client, g.id, 'velo_recu', 'bike_sitter');
      await evenement(client, g.id, 'en_cours', 'systeme');
      // Une remarque nuance ce que le cycliste a déclaré : il doit la voir.
      await notifier(client, g.cycliste_id, {
        texte: reserveEcrite
          ? 'Votre vélo est bien chez {prenom}, qui a ajouté une remarque sur son état.'
          : 'Votre vélo est bien chez {prenom}. Bonne journée !',
        valeurs: { prenom: g.prenom_bike_sitter },
        lien: lienDeLaGarde(g.id),
      });
    } else {
      await client.query(
        `update stationnement set etat = 'termine', repris_le = now() where id = $1`,
        [g.id],
      );
      await evenement(client, g.id, 'velo_restitue', 'cycliste');
      await evenement(client, g.id, 'termine', 'systeme');
      // Les maillons s'écrivent à la clôture, même tant que le module reste
      // fermé à l'affichage.
      await crediterLaGarde(client, g.id);
      for (const [membre, prenom] of [
        [g.bike_sitter_id, g.prenom_cycliste],
        [g.cycliste_id, g.prenom_bike_sitter],
      ] as const) {
        await notifier(client, membre, {
          texte: 'Garde terminée avec {prenom}. Vous pouvez laisser un avis.',
          valeurs: { prenom },
          lien: `${lienDeLaGarde(g.id)}/avis`,
        });
      }
    }
    return { ok: true };
  });
}

// --- Les constats ---------------------------------------------------------------------

export type PhotoPreparee = {
  contenu: Buffer;
  largeur: number;
  hauteur: number;
};

/**
 * Le constat attendu de ce membre, s'il y en a un, et s'il porte sur un vélo
 * électrique. Vérifié avant de décoder la moindre photo : un membre qui n'a
 * pas ce constat à faire n'a pas à faire travailler le serveur sur des images.
 */
export async function constatAttenduDe(
  membreId: string,
  id: string,
  phase: Phase,
): Promise<{ electrique: boolean } | null> {
  if (!IDENTIFIANT.test(id)) return null;
  const ligne = await uneLigne<{
    etat: EtatDeGarde;
    role: Acteur;
    deja: boolean;
    electrique: boolean;
  }>(
    `select s.etat, s.type_velo = 'Électrique' as electrique,
            case when s.cycliste_id = $2 then 'cycliste' else 'bike_sitter' end as role,
            exists (select 1 from constat c where c.stationnement_id = s.id and c.phase = $3) as deja
       from stationnement s join emplacement e on e.id = s.emplacement_id
      where s.id = $1 and (s.cycliste_id = $2 or e.membre_id = $2)`,
    [id, membreId, phase],
  );
  if (!ligne || ligne.deja) return null;
  if (ligne.role !== AUTEUR_DU_CONSTAT[phase]) return null;
  return constatPossible(phase, ligne) ? { electrique: ligne.electrique } : null;
}

export async function enregistrerUnConstat(
  membreId: string,
  id: string,
  phase: Phase,
  constat: {
    etat: EtatDuVelo;
    note: string | null;
    batterieVerifiee: boolean | null;
    photos: readonly (PhotoPreparee & { rang: number })[];
  },
): Promise<ResultatDEcriture> {
  return dansUneTransaction(async (client) => {
    const g = await verrouiller(client, id, membreId);
    if (!g) return refus('Cette garde ne vous concerne pas.');
    const acteur: Acteur =
      g.cycliste_id === membreId ? 'cycliste' : 'bike_sitter';

    if (acteur !== AUTEUR_DU_CONSTAT[phase]) {
      return refus('Ce constat revient à l’autre personne.');
    }
    if (!constatPossible(phase, g)) {
      return refus('Le constat se fait devant la porte, au moment de remettre ou de reprendre le vélo.');
    }

    const existe = await client.query(
      'select 1 from constat where stationnement_id = $1 and phase = $2',
      [g.id, phase],
    );
    if (existe.rowCount) {
      return refus(
        'Ce constat est déjà enregistré et ne peut plus être modifié.',
      );
    }

    const { rows } = await client.query<{ id: string }>(
      `insert into constat (stationnement_id, phase, etat_du_velo, note, etabli_par, batterie_verifiee)
       values ($1, $2, $3, $4, $5, $6) returning id`,
      [g.id, phase, constat.etat, constat.note, membreId, constat.batterieVerifiee],
    );
    const constatId = rows[0]!.id;
    for (const photo of constat.photos) {
      await client.query(
        `insert into photo_de_constat (constat_id, rang, contenu, type_mime, largeur, hauteur)
         values ($1, $2, $3, 'image/webp', $4, $5)`,
        [constatId, photo.rang, photo.contenu, photo.largeur, photo.hauteur],
      );
    }

    if (phase === 'depot') {
      // Le bike sitter attend ces photos pour saisir le code.
      await notifier(client, g.bike_sitter_id, {
        texte: 'Les photos du vélo de {prenom} sont prêtes : vérifiez-les, puis saisissez le code de dépôt.',
        valeurs: { prenom: g.prenom_cycliste },
        lien: `${lienDeLaGarde(g.id)}/remise/depot`,
        urgente: true,
      });
      return { ok: true };
    }

    const depot = await client.query<{ etat_du_velo: EtatDuVelo }>(
      `select etat_du_velo from constat where stationnement_id = $1 and phase = 'depot'`,
      [g.id],
    );
    if (
      leRetourEstMoinsBon(depot.rows[0]?.etat_du_velo ?? null, constat.etat)
    ) {
      for (const membre of [g.cycliste_id, g.bike_sitter_id]) {
        await notifier(client, membre, {
          texte: "L'état constaté au retour diffère de celui du dépôt.",
          lien: lienDeLaGarde(g.id),
        });
      }
    }
    return { ok: true };
  });
}

/**
 * Le bike sitter refuse un vélo dont la batterie l'inquiète, en le voyant
 * devant la porte : il serait rangé dans un local fermé, souvent sous une
 * habitation. Ce n'est pas un reproche, et ce n'est pas un litige.
 */
export async function refuserLeVeloPourLaBatterie(
  membreId: string,
  id: string,
): Promise<ResultatDEcriture> {
  return dansUneTransaction(async (client) => {
    const g = await verrouiller(client, id, membreId);
    if (!g) return refus('Cette garde ne vous concerne pas.');
    if (g.suspendu) return refus('Compte suspendu : action impossible.');
    const acteur: Acteur = g.cycliste_id === membreId ? 'cycliste' : 'bike_sitter';
    if (!refusPourLaBatteriePossible(acteur, { etat: g.etat, typeVelo: g.type_velo })) {
      return refus("Cette action n'est plus possible : la garde a changé entre-temps.");
    }
    await client.query(
      `update stationnement set etat = 'annule', annule_le = now(),
              motif = 'Batterie jugée dangereuse au moment du dépôt.'
        where id = $1`,
      [g.id],
    );
    // Sans geste : un refus de sécurité ne compte pas comme un désistement.
    await evenement(
      client,
      g.id,
      'annule',
      'bike_sitter',
      'Vélo refusé : batterie inquiétante',
    );
    await notifier(client, g.cycliste_id, {
      texte:
        "Votre vélo n'a pas été accueilli : la batterie a été jugée inquiétante — gonflée, chaude ou odorante. Faites-la vérifier avant de redemander une garde.",
      lien: lienDeLaGarde(g.id),
      urgente: true,
    });
    return { ok: true };
  });
}

async function leConstatExiste(
  client: PoolClient,
  gardeId: string,
  phase: Phase,
): Promise<boolean> {
  const { rowCount } = await client.query(
    'select 1 from constat where stationnement_id = $1 and phase = $2',
    [gardeId, phase],
  );
  return Boolean(rowCount);
}

function derniereCloture(evenements: readonly EvenementDeGarde[]): Date | null {
  const cloture = [...evenements]
    .reverse()
    .find((e) => (ETATS_CLOS as readonly string[]).includes(e.etape));
  return cloture ? new Date(cloture.faitLe) : null;
}

export async function photoDeConstat(
  membreId: string,
  id: string,
  phase: Phase,
  rang: number,
): Promise<Buffer | null> {
  const ligne = await uneLigne<{
    contenu: Buffer;
    etat: EtatDeGarde;
    clotureLe: Date | null;
  }>(
    `select p.contenu, s.etat,
            (select max(ev.fait_le) from evenement_de_garde ev
              where ev.stationnement_id = s.id and ev.etape = any($5::text[])) as "clotureLe"
       from photo_de_constat p
       join constat c on c.id = p.constat_id
       join stationnement s on s.id = c.stationnement_id
       join emplacement e on e.id = s.emplacement_id
      where s.id = $1 and c.phase = $2 and p.rang = $3
        and (s.cycliste_id = $4 or e.membre_id = $4)`,
    [id, phase, rang, membreId, ETATS_CLOS],
  );
  if (!ligne) return null;
  const visibles = photosDuConstatVisibles(
    {
      etat: ligne.etat,
      clotureLe: ligne.clotureLe ? new Date(ligne.clotureLe) : null,
    },
    new Date(),
  );
  return visibles ? ligne.contenu : null;
}

export const LIBELLES_DES_ETATS_DU_VELO = ETATS_DU_VELO;
