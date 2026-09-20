import 'server-only';

import { interroger, uneLigne } from '@/lib/bd/client';
import { jourDeLaSemaine } from '@/lib/regles/creneau';
import type { EtatDeGarde } from '@/lib/regles/garde';
import { jourABruxelles } from '@/lib/temps';

import { expirerLesDemandes } from './gardes';
import { soldeDuMembre } from './maillons';

/**
 * Ce que l'accueil montre d'un coup d'œil : la prochaine garde du cycliste,
 * ou, côté bike sitter, la demande qui attend et les chiffres du mois.
 */

const ETATS_A_VENIR = ['demande', 'accepte', 'arrivee', 'en_cours', 'reprise_demandee'];

export type ProchaineGarde = {
  id: string;
  etat: EtatDeGarde;
  debut: Date;
  fin: Date;
  autrePrenom: string;
  autreInitiale: string;
  autreVerifie: boolean;
  typeDEmplacement: string;
  quartier: string;
  reference: string;
  aUnePhoto: boolean;
  veloNom: string | null;
  typeVelo: string;
};

const COLONNES_DE_GARDE = `
  s.id, s.etat, s.debut, s.fin, s.type_velo as "typeVelo",
  autre.prenom as "autrePrenom", upper(left(autre.nom, 1)) as "autreInitiale",
  autre.verification = 'verifiee' as "autreVerifie",
  e.type as "typeDEmplacement", e.quartier, e.reference,
  exists (select 1 from photo_emplacement ph where ph.emplacement_id = e.id) as "aUnePhoto",
  v.nom as "veloNom"`;

export async function prochaineGardeDuCycliste(
  membreId: string,
): Promise<ProchaineGarde | null> {
  await expirerLesDemandes();
  return uneLigne<ProchaineGarde>(
    `select ${COLONNES_DE_GARDE}
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre autre on autre.id = e.membre_id
       left join velo v on v.id = s.velo_id
      where s.cycliste_id = $1 and s.etat = any($2::text[])
      order by s.debut
      limit 1`,
    [membreId, ETATS_A_VENIR],
  );
}

export type AccueilDuBikeSitter = {
  emplacements: number;
  disponibleAujourdhui: boolean;
  points: number;
  demandesEnAttente: number;
  gardesTerminees: number;
  nouvelleDemande: ProchaineGarde | null;
  prochaineGarde: ProchaineGarde | null;
};

export async function accueilDuBikeSitter(
  membreId: string,
): Promise<AccueilDuBikeSitter> {
  await expirerLesDemandes();
  const aujourdhui = jourABruxelles();
  const [chiffres, solde, nouvelleDemande, prochaineGarde] = await Promise.all([
    uneLigne<{
      emplacements: number;
      disponible: boolean;
      demandes: number;
      terminees: number;
    }>(
      `select (select count(*)::int from emplacement where membre_id = $1) as emplacements,
              exists (select 1 from emplacement
                       where membre_id = $1 and publie and not en_pause
                         and $2::smallint = any(jours_d_accueil)
                         and not ($3::date = any(fermetures))) as disponible,
              (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
                where e.membre_id = $1 and s.etat = 'demande') as demandes,
              (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
                where e.membre_id = $1 and s.etat = 'termine') as terminees`,
      [membreId, jourDeLaSemaine(aujourdhui), aujourdhui],
    ),
    soldeDuMembre(membreId),
    uneLigne<ProchaineGarde>(
      `select ${COLONNES_DE_GARDE}
         from stationnement s
         join emplacement e on e.id = s.emplacement_id
         join membre autre on autre.id = s.cycliste_id
         left join velo v on v.id = s.velo_id
        where e.membre_id = $1 and s.etat = 'demande'
        order by s.demande_le
        limit 1`,
      [membreId],
    ),
    uneLigne<ProchaineGarde>(
      `select ${COLONNES_DE_GARDE}
         from stationnement s
         join emplacement e on e.id = s.emplacement_id
         join membre autre on autre.id = s.cycliste_id
         left join velo v on v.id = s.velo_id
        where e.membre_id = $1
          and s.etat in ('accepte', 'arrivee', 'en_cours', 'reprise_demandee')
        order by s.debut
        limit 1`,
      [membreId],
    ),
  ]);
  return {
    emplacements: chiffres?.emplacements ?? 0,
    disponibleAujourdhui: chiffres?.disponible ?? false,
    points: solde.acquis,
    demandesEnAttente: chiffres?.demandes ?? 0,
    gardesTerminees: chiffres?.terminees ?? 0,
    nouvelleDemande,
    prochaineGarde,
  };
}

export type GardeDeLaListe = ProchaineGarde & {
  role: 'cycliste' | 'bike_sitter';
  demandeLe: Date;
};

/** Toutes les gardes du membre, des deux côtés, pour « Mes gardes ». */
export async function gardesDuMembre(
  membreId: string,
): Promise<GardeDeLaListe[]> {
  await expirerLesDemandes();
  return interroger<GardeDeLaListe>(
    `select ${COLONNES_DE_GARDE}, s.demande_le as "demandeLe",
            case when s.cycliste_id = $1 then 'cycliste' else 'bike_sitter' end as role
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre autre on autre.id = case when s.cycliste_id = $1 then e.membre_id else s.cycliste_id end
       left join velo v on v.id = s.velo_id
      where s.cycliste_id = $1 or e.membre_id = $1
      order by s.debut desc
      limit 200`,
    [membreId],
  );
}

/** Les vélos de la personne, pour le raccourci « Ajouter un vélo ». */
export async function nombreDeVelos(membreId: string): Promise<number> {
  const [ligne] = await interroger<{ combien: number }>(
    'select count(*)::int as combien from velo where membre_id = $1',
    [membreId],
  );
  return ligne?.combien ?? 0;
}
