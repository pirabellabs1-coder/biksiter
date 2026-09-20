import 'server-only';

import { randomBytes } from 'node:crypto';

import { interroger, uneLigne } from '@/lib/bd/client';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import {
  motifsDesDisponibilites,
  type DisponibilitesDuLieu,
} from '@/lib/regles/disponibilites-du-lieu';

import { prevenirLesAlertesPour } from './alertes';
import { AVIS_PUBLIE } from './reseau';

/**
 * Le côté bike sitter d'un membre : ce que ses lieux accueillent, et la
 * possibilité de suspendre les nouvelles demandes d'un geste.
 */

export type StatistiquesDuBikeSitter = {
  noteMoyenne: number | null;
  nombreDAvis: number;
  gardesMenees: number;
  /** En pour cent, sur les demandes auxquelles une réponse était attendue. */
  tauxDeReponse: number | null;
  accepteLesDemandes: boolean;
  lieux: number;
};

export async function statistiquesDuBikeSitter(
  membreId: string,
): Promise<StatistiquesDuBikeSitter> {
  const ligne = await uneLigne<{
    note: number | null;
    avis: number;
    gardes: number;
    repondues: number;
    recues: number;
    publies: number;
    lieux: number;
  }>(
    `select (select avg(a.note)::float8 from avis_sur_une_garde a
              where a.cible_id = $1 and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}) as note,
            (select count(*)::int from avis_sur_une_garde a
              where a.cible_id = $1 and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}) as avis,
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where e.membre_id = $1 and s.etat = 'termine') as gardes,
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where e.membre_id = $1 and s.repondu_le is not null) as repondues,
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where e.membre_id = $1 and s.etat <> 'demande'
                and not (s.etat = 'annule' and s.repondu_le is null)) as recues,
            (select count(*)::int from emplacement where membre_id = $1 and publie) as publies,
            (select count(*)::int from emplacement where membre_id = $1) as lieux`,
    [membreId],
  );
  const recues = ligne?.recues ?? 0;
  return {
    noteMoyenne:
      (ligne?.avis ?? 0) >= AVIS_POUR_AFFICHER_UNE_NOTE ? (ligne?.note ?? null) : null,
    nombreDAvis: ligne?.avis ?? 0,
    gardesMenees: ligne?.gardes ?? 0,
    tauxDeReponse:
      recues > 0 ? Math.round(((ligne?.repondues ?? 0) / recues) * 100) : null,
    accepteLesDemandes: (ligne?.publies ?? 0) > 0,
    lieux: ligne?.lieux ?? 0,
  };
}

/**
 * Suspendre les nouvelles demandes met chaque lieu publié en pause ; reprendre
 * republie ceux qu'on avait suspendus, et eux seuls. La règle 2 reste portée
 * par la base : un membre dont la vérification a été retirée ne republie rien.
 */
export async function suspendreLesDemandes(
  membreId: string,
  suspendre: boolean,
): Promise<boolean> {
  let republies: { reference: string }[];
  try {
    republies = await interroger<{ reference: string }>(
      suspendre
        ? 'update emplacement set en_pause = true where membre_id = $1 and publie returning reference'
        : 'update emplacement set en_pause = false, publie = true where membre_id = $1 and en_pause returning reference',
      [membreId],
    );
  } catch {
    return false;
  }
  if (!suspendre) {
    await prevenirLesAlertesPour(republies.map((lieu) => lieu.reference));
  }
  return true;
}

// --- Mes lieux ---------------------------------------------------------------------

export type LieuDeLaListe = {
  reference: string;
  type: string;
  quartier: string;
  capacite: number;
  publie: boolean;
  enPause: boolean;
  joursDAccueil: number;
  nombreDePhotos: number;
  vues: number;
  gardes: number;
  demandesEnAttente: number;
};

export async function mesLieux(membreId: string): Promise<LieuDeLaListe[]> {
  return interroger<LieuDeLaListe>(
    `select e.reference, e.type, e.quartier, e.capacite, e.publie, e.en_pause as "enPause",
            cardinality(e.jours_d_accueil) as "joursDAccueil",
            (select count(*)::int from photo_emplacement ph where ph.emplacement_id = e.id) as "nombreDePhotos",
            e.vues,
            (select count(*)::int from stationnement s where s.emplacement_id = e.id and s.etat = 'termine') as gardes,
            (select count(*)::int from stationnement s where s.emplacement_id = e.id and s.etat = 'demande') as "demandesEnAttente"
       from emplacement e
      where e.membre_id = $1
      order by e.cree_le`,
    [membreId],
  );
}

export type LieuDuMembre = LieuDeLaListe & {
  /** Son propre lieu : la règle 4 protège l'adresse des autres, pas de soi. */
  adresseExacte: string;
  verrouillage: string;
  intemperie: string;
  acces: string;
  ancrage: string | null;
  services: string[];
  velosAcceptes: string[];
  precisions: string | null;
  description: string | null;
  jours: number[];
  ouverture: string | null;
  fermeture: string | null;
  dureeMaxHeures: number;
  dureeMaxJours: number;
  delaiDeReponse: string;
  fermetures: string[];
  identiteVerifiee: boolean;
};

export async function lieuDuMembre(
  membreId: string,
  reference: string,
): Promise<LieuDuMembre | null> {
  if (!/^[a-z0-9-]{3,60}$/.test(reference)) return null;
  return uneLigne<LieuDuMembre>(
    `select e.reference, e.type, e.quartier, e.capacite, e.publie, e.en_pause as "enPause",
            cardinality(e.jours_d_accueil) as "joursDAccueil",
            (select count(*)::int from photo_emplacement ph where ph.emplacement_id = e.id) as "nombreDePhotos",
            e.vues,
            (select count(*)::int from stationnement s where s.emplacement_id = e.id and s.etat = 'termine') as gardes,
            (select count(*)::int from stationnement s where s.emplacement_id = e.id and s.etat = 'demande') as "demandesEnAttente",
            e.adresse_exacte as "adresseExacte", e.verrouillage, e.intemperie, e.acces, e.ancrage,
            e.services, e.velos_acceptes as "velosAcceptes", e.precisions, e.description,
            e.jours_d_accueil::int[] as jours,
            to_char(e.heure_d_ouverture, 'HH24:MI') as ouverture,
            to_char(e.heure_de_fermeture, 'HH24:MI') as fermeture,
            e.duree_max_heures as "dureeMaxHeures", e.duree_max_jours as "dureeMaxJours",
            e.delai_de_reponse as "delaiDeReponse",
            array(select to_char(d, 'YYYY-MM-DD') from unnest(e.fermetures) d) as fermetures,
            m.verification = 'verifiee' as "identiteVerifiee"
       from emplacement e join membre m on m.id = e.membre_id
      where e.reference = $1 and e.membre_id = $2`,
    [reference, membreId],
  );
}

export async function enregistrerLaDescription(
  membreId: string,
  reference: string,
  description: string | null,
): Promise<void> {
  await interroger(
    'update emplacement set description = $3, modifie_le = now() where reference = $1 and membre_id = $2',
    [reference, membreId, description],
  );
}

export type ResultatDesDisponibilites =
  | { ok: true; publie: boolean }
  | { ok: false; motifs: string[] };

/**
 * Enregistre les disponibilités, puis publie le lieu si tout est prêt : des
 * jours d'accueil et une identité vérifiée. Un lieu en pause le reste — c'est
 * la personne qui décide de reprendre.
 */
export async function enregistrerLesDisponibilites(
  membreId: string,
  reference: string,
  disponibilites: DisponibilitesDuLieu,
): Promise<ResultatDesDisponibilites> {
  const motifs = motifsDesDisponibilites(disponibilites);
  if (motifs.length > 0) return { ok: false, motifs };

  const lignes = await interroger<{ publiable: boolean; en_pause: boolean }>(
    `update emplacement e
        set jours_d_accueil = $3::smallint[],
            heure_d_ouverture = $4::time,
            heure_de_fermeture = $5::time,
            duree_max_heures = $6,
            delai_de_reponse = $7,
            fermetures = $8::date[],
            horaires_par_jour = '{}'::jsonb,
            modifie_le = now()
       from membre m
      where e.reference = $1 and e.membre_id = $2 and m.id = e.membre_id
      returning m.verification = 'verifiee' as publiable, e.en_pause`,
    [
      reference,
      membreId,
      disponibilites.jours,
      disponibilites.ouverture,
      disponibilites.fermeture,
      disponibilites.dureeMaxHeures,
      disponibilites.delaiDeReponse,
      disponibilites.fermetures,
    ],
  );
  const ligne = lignes[0];
  if (!ligne) return { ok: false, motifs: ['Ce lieu n’est pas associé à votre compte.'] };
  if (!ligne.publiable || ligne.en_pause) return { ok: true, publie: false };

  const publies = await interroger<{ reference: string }>(
    'update emplacement set publie = true where reference = $1 and membre_id = $2 and not publie returning reference',
    [reference, membreId],
  );
  await prevenirLesAlertesPour(publies.map((lieu) => lieu.reference));
  return { ok: true, publie: true };
}

/**
 * Une référence lisible plutôt qu'un identifiant : elle se retrouve dans une
 * adresse de page, dans un message à l'association. Elle ne change plus
 * ensuite, même si le quartier change.
 */
export function referenceDeLieu(quartier: string, prenom: string): string {
  const sansAccent = (valeur: string) =>
    valeur
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  const suffixe = randomBytes(3).toString('hex').slice(0, 4);
  return `${sansAccent(quartier)}-${sansAccent(prenom)}-${suffixe}`.slice(0, 60);
}
