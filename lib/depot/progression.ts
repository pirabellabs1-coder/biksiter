import 'server-only';

import { interroger, uneLigne } from '@/lib/bd/client';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import {
  ANNULATIONS_IMPUTABLES_AU_BIKE_SITTER,
  DELAI_D_UNE_REPONSE_RAPIDE_MINUTES,
  TAILLE_DU_CLASSEMENT,
  bornesDeLaPeriode,
  fiabilite,
  figureAuClassement,
  ligneDuClassement,
  rangsDuClassement,
  seriesSansAnnulation,
  type ActiviteDuBikeSitter,
  type FiltreDuJournal,
  type IssueDUneGarde,
  type LigneDuClassement,
  type PeriodeDuClassement,
} from '@/lib/regles/progression';

import { soldeDuMembre, type SoldeDuMembre } from './maillons';
import { AVIS_PUBLIE } from './reseau';

/**
 * La progression d'un membre et le classement « Top Bike Sitters ».
 *
 * Le classement est la seule requête du produit qui ordonne des membres par
 * leurs points (règle 3) : elle ne lit que ceux qui l'ont choisi, et ne rend
 * que les champs de `CHAMPS_DU_CLASSEMENT`.
 */

/** Une annulation du bike sitter avant d'avoir reçu le vélo. Un vélo refusé au dépôt pour sa batterie n'en est pas une. */
const ANNULEE_PAR_LE_BIKE_SITTER = `s.etat = 'annule'
  and exists (select 1 from evenement_de_garde ev
               where ev.stationnement_id = s.id and ev.etape = 'annule'
                 and (${ANNULATIONS_IMPUTABLES_AU_BIKE_SITTER.map(
                   (cas) => `(ev.acteur = '${cas.acteur}' and ev.geste = '${cas.geste}')`,
                 ).join(' or ')}))`;

export type ProgressionDuMembre = {
  solde: SoldeDuMembre;
  /** Tous les points gagnés, dépenses non déduites : c'est ce qui fait le niveau. */
  pointsGagnes: number;
  activite: ActiviteDuBikeSitter;
  cyclistesAides: number;
  noteMoyenne: number | null;
  fiabilite: number | null;
  apparaitAuClassement: boolean;
};

export async function progressionDuMembre(
  membreId: string,
): Promise<ProgressionDuMembre> {
  const [solde, chiffres, issues] = await Promise.all([
    soldeDuMembre(membreId),
    uneLigne<{
      gagnes: number;
      terminees: number;
      electriques: number;
      cyclistes: number;
      rapides: number;
      cinqEtoiles: number;
      avis: number;
      note: number | null;
      annulees: number;
      apparait: boolean;
    }>(
      `select (select coalesce(sum(nombre), 0)::int from maillon
                where membre_id = $1 and nature = 'garde' and etat = 'acquis') as gagnes,
              (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
                where e.membre_id = $1 and s.etat = 'termine') as terminees,
              (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
                where e.membre_id = $1 and s.etat = 'termine' and s.type_velo = 'Électrique') as electriques,
              (select count(distinct s.cycliste_id)::int from stationnement s join emplacement e on e.id = s.emplacement_id
                where e.membre_id = $1 and s.etat = 'termine') as cyclistes,
              (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
                where e.membre_id = $1 and s.repondu_le is not null
                  and s.repondu_le - s.demande_le <= make_interval(mins => $2)) as rapides,
              (select count(*)::int from avis_sur_une_garde a
                where a.cible_id = $1 and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}
                  and a.note = 5) as "cinqEtoiles",
              (select count(*)::int from avis_sur_une_garde a
                where a.cible_id = $1 and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}) as avis,
              (select avg(a.note)::float8 from avis_sur_une_garde a
                where a.cible_id = $1 and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}) as note,
              (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
                where e.membre_id = $1 and ${ANNULEE_PAR_LE_BIKE_SITTER}) as annulees,
              (select apparait_au_classement from membre where id = $1) as apparait`,
      [membreId, DELAI_D_UNE_REPONSE_RAPIDE_MINUTES],
    ),
    interroger<{ issue: IssueDUneGarde }>(
      `select case when s.etat = 'termine' then 'menee' else 'annulee' end as issue
         from stationnement s join emplacement e on e.id = s.emplacement_id
        where e.membre_id = $1
          and (s.etat = 'termine' or (${ANNULEE_PAR_LE_BIKE_SITTER}))
        order by coalesce(s.repris_le, s.annule_le, s.fin)`,
      [membreId],
    ),
  ]);

  const series = seriesSansAnnulation(issues.map((ligne) => ligne.issue));
  const terminees = chiffres?.terminees ?? 0;
  return {
    solde,
    pointsGagnes: chiffres?.gagnes ?? 0,
    activite: {
      gardesTerminees: terminees,
      gardesDeVeloElectrique: chiffres?.electriques ?? 0,
      reponsesRapides: chiffres?.rapides ?? 0,
      avisCinqEtoiles: chiffres?.cinqEtoiles ?? 0,
      serieSansAnnulation: series.actuelle,
      meilleureSerieSansAnnulation: series.meilleure,
    },
    cyclistesAides: chiffres?.cyclistes ?? 0,
    noteMoyenne:
      (chiffres?.avis ?? 0) >= AVIS_POUR_AFFICHER_UNE_NOTE
        ? (chiffres?.note ?? null)
        : null,
    fiabilite: fiabilite(terminees, chiffres?.annulees ?? 0),
    apparaitAuClassement: chiffres?.apparait ?? false,
  };
}

export type LigneDuJournal = {
  id: string;
  nature: 'garde' | 'echange' | 'correction';
  nombre: number;
  etat: 'acquis' | 'en_attente' | 'annule';
  creeLe: Date;
  stationnementId: string | null;
  cyclistePrenom: string | null;
  offreTitre: string | null;
  motif: string | null;
};

const CONDITION_DU_FILTRE: Record<FiltreDuJournal, string> = {
  tous: 'true',
  gagnes: "m.nombre > 0 and m.etat = 'acquis'",
  utilises: 'm.nombre < 0',
};

export async function journalDesPoints(
  membreId: string,
  filtre: FiltreDuJournal,
  combien = 50,
): Promise<LigneDuJournal[]> {
  return interroger<LigneDuJournal>(
    `select m.id, m.nature, m.nombre, m.etat, m.cree_le as "creeLe", m.motif,
            m.stationnement_id as "stationnementId",
            c.prenom as "cyclistePrenom",
            o.titre as "offreTitre"
       from maillon m
       left join stationnement s on s.id = m.stationnement_id
       left join membre c on c.id = s.cycliste_id
       left join echange ech on ech.id = m.echange_id
       left join offre o on o.id = ech.offre_id
      where m.membre_id = $1 and ${CONDITION_DU_FILTRE[filtre]}
      order by m.cree_le desc
      limit $2`,
    [membreId, combien],
  );
}

/** Les points d'une garde, pour le bike sitter qui l'a menée à terme. */
export async function pointsDeLaGarde(
  stationnementId: string,
  membreId: string,
): Promise<{
  nombre: number;
  etat: 'acquis' | 'en_attente' | 'annule';
} | null> {
  return uneLigne(
    `select nombre, etat from maillon
      where stationnement_id = $1 and membre_id = $2`,
    [stationnementId, membreId],
  );
}

export type ClassementDeLaPeriode = {
  periode: PeriodeDuClassement;
  premierJour: string;
  dernierJour: string;
  lignes: (LigneDuClassement & { rang: number; estMoi: boolean })[];
  /** La place du membre qui regarde, s'il figure au classement. */
  maPlace: (LigneDuClassement & { rang: number; estMoi: boolean }) | null;
};

export async function classement(
  periode: PeriodeDuClassement,
  spectateurId: string,
): Promise<ClassementDeLaPeriode> {
  const bornes = bornesDeLaPeriode(periode);
  const lignes = await interroger<
    LigneDuClassement & {
      id: string;
      apparaitAuClassement: boolean;
      supprime: boolean;
      suspendu: boolean;
      menees: number;
      annulees: number;
      avis: number;
      bloque: boolean;
    }
  >(
    `with gains as (
       select membre_id, sum(nombre)::int as points
         from maillon
        where nature = 'garde' and etat = 'acquis' and cree_le >= $1 and cree_le < $2
        group by membre_id
     )
     select mb.id, mb.prenom, upper(left(mb.nom, 1)) as initiale,
            mb.verification = 'verifiee' as verifie,
            g.points,
            mb.apparait_au_classement as "apparaitAuClassement",
            mb.supprime_le is not null as supprime,
            mb.suspendu,
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where e.membre_id = mb.id and s.etat = 'termine') as menees,
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where e.membre_id = mb.id and ${ANNULEE_PAR_LE_BIKE_SITTER}) as annulees,
            (select count(*)::int from avis_sur_une_garde a
              where a.cible_id = mb.id and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}) as avis,
            (select avg(a.note)::float8 from avis_sur_une_garde a
              where a.cible_id = mb.id and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}) as note,
            exists (select 1 from blocage b
                     where (b.membre_id = $3 and b.bloque_id = mb.id)
                        or (b.membre_id = mb.id and b.bloque_id = $3)) as bloque
       from gains g
       join membre mb on mb.id = g.membre_id
      where mb.apparait_au_classement
      order by g.points desc, mb.prenom, mb.id`,
    [bornes.debut, bornes.fin, spectateurId],
  );

  const classes = rangsDuClassement(
    lignes
      .filter((ligne) => figureAuClassement(ligne))
      .map((ligne) => ({
        ...ligneDuClassement({
          ...ligne,
          gardes: ligne.menees,
          fiabilite: fiabilite(ligne.menees, ligne.annulees),
          note: ligne.avis >= AVIS_POUR_AFFICHER_UNE_NOTE ? ligne.note : null,
        }),
        estMoi: ligne.id === spectateurId,
        bloque: ligne.bloque,
      })),
  );

  // Un membre bloqué, dans un sens ou dans l'autre, n'apparaît pas à l'écran ;
  // les rangs des autres ne bougent pas pour autant. L'identifiant des membres
  // ne quitte pas le serveur : l'écran n'a besoin que du rang et de « c'est
  // moi ».
  const visibles = classes
    .filter((ligne) => !ligne.bloque)
    .map(({ bloque: _bloque, ...ligne }) => ligne);
  return {
    periode,
    premierJour: bornes.premierJour,
    dernierJour: bornes.dernierJour,
    lignes: visibles.slice(0, TAILLE_DU_CLASSEMENT),
    maPlace: visibles.find((ligne) => ligne.estMoi) ?? null,
  };
}

export async function choisirDApparaitreAuClassement(
  membreId: string,
  apparait: boolean,
): Promise<void> {
  await interroger(
    'update membre set apparait_au_classement = $2 where id = $1',
    [membreId, apparait],
  );
}

export async function apparaitAuClassement(membreId: string): Promise<boolean> {
  const ligne = await uneLigne<{ apparait: boolean }>(
    'select apparait_au_classement as apparait from membre where id = $1',
    [membreId],
  );
  return ligne?.apparait ?? false;
}
