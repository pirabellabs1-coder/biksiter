import 'server-only';

import type { PoolClient } from 'pg';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import {
  motifDeModerationValide,
  PERIODES_DE_STATISTIQUES,
  prioriteDuLitige,
  refusDeCorrection,
  tauxDeFinalisation,
  transitionDeSignalementPermise,
  variation,
  type EtatDUnSignalement,
  type IssueDUnLitige,
  type PeriodeDeStatistiques,
  type PrioriteDUnLitige,
  type RefusDeCorrection,
} from '@/lib/regles/moderation';
import type { CategorieDOffre } from '@/lib/regles/catalogue';

import { ETATS_QUI_OCCUPENT_UNE_PLACE } from '@/lib/regles/capacite';

import { crediterLaGarde, soldeDuMembre } from './maillons';
import { notifier } from './notifications';

/**
 * L'administration de l'application : tableau de bord, litiges, signalements,
 * membres, points, catalogue et statistiques.
 *
 * Les mêmes interdits que `administration.ts` : aucune adresse, aucun corps
 * de message, aucun document ne sort d'ici. Chaque geste laisse une ligne
 * motivée dans `action_de_moderation`.
 */

const IDENTIFIANT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function tracer(
  client: PoolClient,
  action: {
    membreId: string | null;
    moderateurId: string;
    type:
      | 'compte_suspendu'
      | 'compte_reactive'
      | 'points_corriges'
      | 'litige_tranche'
      | 'signalement_traite'
      | 'offre_modifiee';
    motif: string;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  await client.query(
    `insert into action_de_moderation (membre_id, decide_par, action, motif, details)
     values ($1, $2, $3, $4, $5)`,
    [
      action.membreId,
      action.moderateurId,
      action.type,
      action.motif.trim(),
      action.details ?? {},
    ],
  );
}

// --- Le tableau de bord --------------------------------------------------------------

export type TableauDeBord = {
  verificationsEnAttente: number;
  gardesActives: number;
  litigesEnCours: number;
  signalementsOuverts: number;
  envoisEnEchec: number;
};

export async function tableauDeBord(): Promise<TableauDeBord> {
  const ligne = await uneLigne<TableauDeBord>(
    `select (select count(*) from piece_didentite where relue_le is null)::int as "verificationsEnAttente",
            (select count(*) from stationnement
              where etat in ('accepte', 'arrivee', 'en_cours', 'reprise_demandee'))::int as "gardesActives",
            (select count(*) from stationnement where etat = 'litige')::int as "litigesEnCours",
            (select count(*) from signalement where etat <> 'traite')::int as "signalementsOuverts",
            (select count(*) from message_sortant where envoye_le is null and tentatives > 0)::int as "envoisEnEchec"`,
  );
  return (
    ligne ?? {
      verificationsEnAttente: 0,
      gardesActives: 0,
      litigesEnCours: 0,
      signalementsOuverts: 0,
      envoisEnEchec: 0,
    }
  );
}

export type EvenementDActivite = {
  type: 'verification' | 'garde' | 'signalement' | 'litige';
  prenom: string;
  lien: string;
  quand: Date;
};

export async function activiteRecente(
  combien = 8,
): Promise<EvenementDActivite[]> {
  return interroger<EvenementDActivite>(
    `(select 'verification' as type, m.prenom, '/administration/verifications/' || m.id as lien, p.deposee_le as quand
        from piece_didentite p join membre m on m.id = p.membre_id where p.relue_le is null)
     union all
     (select 'garde', c.prenom, '/administration/litiges', ev.fait_le
        from evenement_de_garde ev join stationnement s on s.id = ev.stationnement_id
        join membre c on c.id = s.cycliste_id
       where ev.etape = 'en_cours' and ev.fait_le > now() - interval '7 days')
     union all
     (select 'signalement', coalesce(a.prenom, '—'), '/administration/signalements', sg.cree_le
        from signalement sg left join membre a on a.id = sg.auteur_id where sg.etat <> 'traite')
     union all
     (select 'litige', c.prenom, '/administration/litiges/' || s.id, ev.fait_le
        from evenement_de_garde ev join stationnement s on s.id = ev.stationnement_id
        join membre c on c.id = s.cycliste_id
       where ev.etape = 'litige' and s.etat = 'litige')
     order by quand desc
     limit $1`,
    [combien],
  );
}

// --- Les litiges ----------------------------------------------------------------------

export type LitigeEnCours = {
  id: string;
  motif: string | null;
  ouvertLe: Date;
  prenomDuCycliste: string;
  prenomDuBikeSitter: string;
  quartier: string;
  priorite: PrioriteDUnLitige;
};

export async function litigesEnCours(): Promise<LitigeEnCours[]> {
  const lignes = await interroger<Omit<LitigeEnCours, 'priorite'>>(
    `select s.id,
            ev.note as motif,
            ev.fait_le as "ouvertLe",
            c.prenom as "prenomDuCycliste",
            b.prenom as "prenomDuBikeSitter",
            e.quartier
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre c on c.id = s.cycliste_id
       join membre b on b.id = e.membre_id
       left join lateral (
         select note, fait_le from evenement_de_garde
          where stationnement_id = s.id and etape = 'litige'
          order by fait_le desc limit 1
       ) ev on true
      where s.etat = 'litige'
      order by ev.fait_le`,
  );
  return lignes
    .map((ligne) => ({ ...ligne, priorite: prioriteDuLitige(ligne.motif) }))
    .sort((a, b) =>
      a.priorite === b.priorite ? 0 : a.priorite === 'haute' ? -1 : 1,
    );
}

export type DetailDuLitige = LitigeEnCours & {
  etat: string;
  debut: Date;
  fin: Date;
  typeVelo: string;
  deposeLe: Date | null;
  reprisLe: Date | null;
  signalePar: 'cycliste' | 'bike_sitter' | null;
  evenements: {
    etape: string;
    acteur: string;
    note: string | null;
    faitLe: Date;
  }[];
  constats: {
    phase: string;
    etat: string;
    note: string | null;
    rangs: number[];
    batterieVerifiee: boolean | null;
    reserve: string | null;
  }[];
};

export async function detailDuLitige(
  id: string,
): Promise<DetailDuLitige | null> {
  if (!IDENTIFIANT.test(id)) return null;
  const garde = await uneLigne<
    Omit<DetailDuLitige, 'evenements' | 'constats' | 'priorite' | 'signalePar'>
  >(
    `select s.id, s.etat, s.debut, s.fin, s.type_velo as "typeVelo",
            s.depose_le as "deposeLe", s.repris_le as "reprisLe",
            c.prenom as "prenomDuCycliste", b.prenom as "prenomDuBikeSitter", e.quartier,
            (select note from evenement_de_garde where stationnement_id = s.id and etape = 'litige'
              order by fait_le desc limit 1) as motif,
            (select fait_le from evenement_de_garde where stationnement_id = s.id and etape = 'litige'
              order by fait_le desc limit 1) as "ouvertLe"
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre c on c.id = s.cycliste_id
       join membre b on b.id = e.membre_id
      where s.id = $1`,
    [id],
  );
  if (!garde || !garde.ouvertLe) return null;
  const [evenements, constats] = await Promise.all([
    interroger<DetailDuLitige['evenements'][number]>(
      `select etape, acteur, note, fait_le as "faitLe"
         from evenement_de_garde where stationnement_id = $1 order by fait_le`,
      [id],
    ),
    interroger<DetailDuLitige['constats'][number]>(
      `select c.phase, c.etat_du_velo as etat, c.note,
              c.batterie_verifiee as "batterieVerifiee", c.reserve,
              array(select p.rang from photo_de_constat p where p.constat_id = c.id order by p.rang)::int[] as rangs
         from constat c where c.stationnement_id = $1 order by c.etabli_le`,
      [id],
    ),
  ]);
  const ouverture = [...evenements].reverse().find((e) => e.etape === 'litige');
  return {
    ...garde,
    priorite: prioriteDuLitige(garde.motif),
    signalePar:
      ouverture?.acteur === 'cycliste' || ouverture?.acteur === 'bike_sitter'
        ? ouverture.acteur
        : null,
    evenements,
    constats,
  };
}

/**
 * Une photo de constat, pour trancher un litige : la modération ne la voit que
 * sur une garde qui a été signalée.
 */
export async function photoDeConstatPourModeration(
  id: string,
  phase: 'depot' | 'reprise',
  rang: number,
): Promise<Buffer | null> {
  if (!IDENTIFIANT.test(id)) return null;
  const ligne = await uneLigne<{ contenu: Buffer }>(
    `select p.contenu
       from photo_de_constat p
       join constat c on c.id = p.constat_id
      where c.stationnement_id = $1 and c.phase = $2 and p.rang = $3
        and exists (select 1 from evenement_de_garde ev
                     where ev.stationnement_id = c.stationnement_id and ev.etape = 'litige')`,
    [id, phase, rang],
  );
  return ligne?.contenu ?? null;
}

const TEXTE_DE_L_ISSUE: Record<IssueDUnLitige, string> = {
  terminer_avec_points:
    'La garde est close et les points du Bike Sitter sont accordés.',
  terminer_sans_points: 'La garde est close, sans points.',
  annuler: 'La garde est annulée.',
};

export async function trancherUnLitige(
  moderateurId: string,
  id: string,
  issue: IssueDUnLitige,
  motif: string,
  veloRenduConfirme: boolean,
): Promise<'ok' | 'deja_tranche' | 'velo_chez_le_bike_sitter'> {
  if (!IDENTIFIANT.test(id)) return 'deja_tranche';
  return dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      cycliste_id: string;
      bike_sitter_id: string;
      depose: boolean;
      repris: boolean;
    }>(
      `select s.cycliste_id, e.membre_id as bike_sitter_id,
              s.depose_le is not null as depose, s.repris_le is not null as repris
         from stationnement s join emplacement e on e.id = s.emplacement_id
        where s.id = $1 and s.etat = 'litige'
        for update of s`,
      [id],
    );
    const garde = rows[0];
    // Déjà tranché, peut-être par quelqu'un d'autre.
    if (!garde) return 'deja_tranche';

    // Clore la garde coupe l'adresse, le téléphone et la conversation : tant
    // que le vélo est chez le bike sitter, on ne la clôt pas sans que la
    // modération ait confirmé qu'il a été rendu.
    const veloEncoreChezLeBikeSitter = garde.depose && !garde.repris;
    if (veloEncoreChezLeBikeSitter && !veloRenduConfirme) {
      return 'velo_chez_le_bike_sitter';
    }
    const reprise = veloEncoreChezLeBikeSitter ? 'now()' : 'repris_le';

    if (issue === 'annuler') {
      await client.query(
        `update stationnement
            set etat = 'annule', annule_le = now(), conteste = false, repris_le = ${reprise}
          where id = $1`,
        [id],
      );
    } else {
      await client.query(
        `update stationnement
            set etat = 'termine', conteste = false, repris_le = ${reprise}
          where id = $1`,
        [id],
      );
    }

    const retenus = await client.query<{ id: string }>(
      'select id from maillon where stationnement_id = $1',
      [id],
    );
    if (issue === 'terminer_avec_points') {
      if (retenus.rowCount) {
        await client.query(
          "update maillon set etat = 'acquis' where stationnement_id = $1 and etat = 'en_attente'",
          [id],
        );
      } else {
        await crediterLaGarde(client, id);
      }
    } else if (retenus.rowCount) {
      await client.query(
        "update maillon set etat = 'annule' where stationnement_id = $1",
        [id],
      );
    }

    await client.query(
      `insert into evenement_de_garde (stationnement_id, etape, acteur, note)
       values ($1, $2, 'moderation', $3)`,
      [id, issue === 'annuler' ? 'annule' : 'termine', motif.trim()],
    );
    for (const membreId of [garde.cycliste_id, garde.bike_sitter_id]) {
      await notifier(client, membreId, {
        texte:
          'La modération a examiné le signalement de votre garde. {decision} {motif}',
        valeurs: { decision: TEXTE_DE_L_ISSUE[issue], motif: motif.trim() },
        lien: `/gardes/${id}/suivi`,
        urgente: true,
      });
    }
    await tracer(client, {
      membreId: null,
      moderateurId,
      type: 'litige_tranche',
      motif,
      details: { garde: id, issue, veloRenduConfirme },
    });
    return 'ok';
  });
}

// --- Les signalements -----------------------------------------------------------------

export type SignalementAModerer = {
  id: string;
  cibleType: 'membre' | 'emplacement' | 'garde' | 'avis';
  cible: string;
  cibleLibelle: string | null;
  lienDeLaCible: string | null;
  motif: string;
  details: string | null;
  etat: EtatDUnSignalement;
  creeLe: Date;
  auteur: string | null;
  note: string | null;
};

export async function signalements(
  etat: EtatDUnSignalement,
): Promise<SignalementAModerer[]> {
  return interroger<SignalementAModerer>(
    `select sg.id, sg.cible_type as "cibleType", sg.cible, sg.motif, sg.details, sg.etat,
            sg.cree_le as "creeLe", a.prenom as auteur, sg.note_de_moderation as note,
            case sg.cible_type
              when 'membre' then (select m.prenom || ' ' || upper(left(m.nom, 1)) || '.' from membre m where m.id::text = sg.cible)
              when 'emplacement' then (select e.type || ' · ' || e.quartier from emplacement e where e.reference = sg.cible)
              else null
            end as "cibleLibelle",
            case sg.cible_type
              when 'membre' then '/administration/membres/' || sg.cible
              when 'garde' then '/administration/litiges/' || sg.cible
              else null
            end as "lienDeLaCible"
       from signalement sg
       left join membre a on a.id = sg.auteur_id
      where sg.etat = $1
      order by sg.cree_le ${etat === 'traite' ? 'desc' : 'asc'}
      limit 100`,
    [etat],
  );
}

export async function faireAvancerUnSignalement(
  moderateurId: string,
  id: string,
  vers: EtatDUnSignalement,
  note: string,
): Promise<boolean> {
  if (!IDENTIFIANT.test(id)) return false;
  return dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      etat: EtatDUnSignalement;
      cible_type: string;
      cible: string;
    }>(
      'select etat, cible_type, cible from signalement where id = $1 for update',
      [id],
    );
    const signalement = rows[0];
    if (!signalement || !transitionDeSignalementPermise(signalement.etat, vers))
      return false;
    const texte = note.trim().slice(0, 600) || null;
    await client.query(
      `update signalement
          set etat = $2,
              note_de_moderation = coalesce($3, note_de_moderation),
              traite_par = case when $2 = 'traite' then $4::uuid else traite_par end,
              traite_le = case when $2 = 'traite' then now() else traite_le end
        where id = $1`,
      [id, vers, texte, moderateurId],
    );
    if (vers === 'traite') {
      await tracer(client, {
        membreId:
          signalement.cible_type === 'membre' &&
          IDENTIFIANT.test(signalement.cible)
            ? signalement.cible
            : null,
        moderateurId,
        type: 'signalement_traite',
        motif:
          texte && motifDeModerationValide(texte)
            ? texte
            : 'Signalement examiné et classé.',
        details: { signalement: id },
      });
    }
    return true;
  });
}

// --- Les membres -----------------------------------------------------------------------

export type MembreEnGestion = {
  id: string;
  prenom: string;
  initiale: string;
  verification: string;
  suspendu: boolean;
  moderateur: boolean;
  membreDepuis: number;
};

export async function rechercherDesMembres(
  recherche: string,
  filtre: 'tous' | 'actifs' | 'suspendus',
): Promise<{
  membres: MembreEnGestion[];
  comptes: Record<'tous' | 'actifs' | 'suspendus', number>;
}> {
  const texte = recherche.trim().slice(0, 80);
  const motif = `%${texte.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const [membres, comptes] = await Promise.all([
    interroger<MembreEnGestion>(
      `select m.id, m.prenom, upper(left(m.nom, 1)) as initiale, m.verification, m.suspendu,
              m.moderateur, extract(year from m.cree_le)::int as "membreDepuis"
         from membre m
        where m.supprime_le is null
          and ($1 = '' or m.prenom ilike $2 or m.nom ilike $2 or m.email ilike $2)
          and ($3 = 'tous' or ($3 = 'actifs' and not m.suspendu) or ($3 = 'suspendus' and m.suspendu))
        order by m.prenom, m.nom
        limit 50`,
      [texte, motif, filtre],
    ),
    uneLigne<Record<'tous' | 'actifs' | 'suspendus', number>>(
      `select count(*)::int as tous,
              count(*) filter (where not suspendu)::int as actifs,
              count(*) filter (where suspendu)::int as suspendus
         from membre where supprime_le is null`,
    ),
  ]);
  return { membres, comptes: comptes ?? { tous: 0, actifs: 0, suspendus: 0 } };
}

export type FicheDeGestion = MembreEnGestion & {
  nom: string;
  email: string;
  gardesAccueillies: number;
  gardesConfiees: number;
  gardesEngagees: number;
  lieux: number;
  signalementsRecus: number;
  solde: { acquis: number; enAttente: number };
  actions: {
    action: string;
    motif: string;
    faitLe: Date;
    parQui: string | null;
  }[];
};

export async function ficheDeGestion(
  membreId: string,
): Promise<FicheDeGestion | null> {
  if (!IDENTIFIANT.test(membreId)) return null;
  const membre = await uneLigne<Omit<FicheDeGestion, 'solde' | 'actions'>>(
    `select m.id, m.prenom, m.nom, upper(left(m.nom, 1)) as initiale, m.email, m.verification,
            m.suspendu, m.moderateur, extract(year from m.cree_le)::int as "membreDepuis",
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where e.membre_id = m.id and s.etat = 'termine') as "gardesAccueillies",
            (select count(*)::int from stationnement where cycliste_id = m.id and etat = 'termine') as "gardesConfiees",
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where (s.cycliste_id = m.id or e.membre_id = m.id)
                and s.etat in ('accepte', 'arrivee', 'en_cours', 'reprise_demandee', 'litige')) as "gardesEngagees",
            (select count(*)::int from emplacement where membre_id = m.id) as lieux,
            (select count(*)::int from signalement where cible_type = 'membre' and cible = m.id::text) as "signalementsRecus"
       from membre m
      where m.id = $1 and m.supprime_le is null`,
    [membreId],
  );
  if (!membre) return null;
  const [solde, actions] = await Promise.all([
    soldeDuMembre(membreId),
    interroger<FicheDeGestion['actions'][number]>(
      `select a.action, a.motif, a.fait_le as "faitLe", mo.prenom as "parQui"
         from action_de_moderation a left join membre mo on mo.id = a.decide_par
        where a.membre_id = $1
        order by a.fait_le desc
        limit 20`,
      [membreId],
    ),
  ]);
  return { ...membre, solde, actions };
}

export async function suspendreOuReactiver(
  moderateurId: string,
  membreId: string,
  suspendre: boolean,
  motif: string,
  malgreLesGardesEngagees: boolean,
): Promise<'ok' | 'introuvable' | 'interdit' | 'gardes_engagees'> {
  if (!IDENTIFIANT.test(membreId)) return 'introuvable';
  // On ne se suspend pas soi-même, et une personne qui modère ne se suspend
  // pas d'ici : ce rôle se retire à la main, comme il se pose.
  if (membreId === moderateurId) return 'interdit';
  return dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      moderateur: boolean;
      suspendu: boolean;
    }>(
      'select moderateur, suspendu from membre where id = $1 and supprime_le is null for update',
      [membreId],
    );
    const membre = rows[0];
    if (!membre) return 'introuvable';
    if (membre.moderateur) return 'interdit';
    if (membre.suspendu === suspendre) return 'ok';

    if (suspendre) {
      // Une garde engagée a besoin de ses deux membres pour la remise du
      // vélo (règle 5) : on ne suspend pas sans l'avoir vu et assumé.
      const { rows: engagees } = await client.query<{ nombre: number }>(
        `select count(*)::int as nombre
           from stationnement s join emplacement e on e.id = s.emplacement_id
          where (s.cycliste_id = $1 or e.membre_id = $1) and s.etat = any($2::text[])`,
        [membreId, ETATS_QUI_OCCUPENT_UNE_PLACE],
      );
      if ((engagees[0]?.nombre ?? 0) > 0 && !malgreLesGardesEngagees) {
        return 'gardes_engagees';
      }
    }

    await client.query('update membre set suspendu = $2 where id = $1', [
      membreId,
      suspendre,
    ]);
    if (suspendre) {
      // Un compte suspendu ne garde aucune session ouverte.
      await client.query('delete from session where membre_id = $1', [
        membreId,
      ]);
      // Ses lieux sortent des recherches.
      await client.query(
        'update emplacement set publie = false where membre_id = $1 and publie',
        [membreId],
      );
      // Ses demandes en attente, dans un sens comme dans l'autre, sont closes :
      // aucune ne doit plus pouvoir être acceptée, ni envoyer une adresse.
      const { rows: closes } = await client.query<{
        id: string;
        autre_id: string;
      }>(
        `update stationnement s
            set etat = 'annule', annule_le = now(),
                motif = 'Cette demande a été close par l’équipe de Bike Sitters.'
           from emplacement e
          where e.id = s.emplacement_id and s.etat = 'demande'
            and (s.cycliste_id = $1 or e.membre_id = $1)
        returning s.id,
                  case when s.cycliste_id = $1 then e.membre_id else s.cycliste_id end as autre_id`,
        [membreId],
      );
      for (const demande of closes) {
        await client.query(
          `insert into evenement_de_garde (stationnement_id, etape, acteur, note)
           values ($1, 'annule', 'moderation', 'Demande close par l’équipe')`,
          [demande.id],
        );
        await notifier(client, demande.autre_id, {
          texte:
            'Une demande de garde a été close par l’équipe de Bike Sitters. Aucune action n’est attendue de votre part.',
          lien: `/gardes/${demande.id}`,
        });
      }
    }
    await tracer(client, {
      membreId,
      moderateurId,
      type: suspendre ? 'compte_suspendu' : 'compte_reactive',
      motif,
    });
    return 'ok';
  });
}

export async function corrigerLesPoints(
  moderateurId: string,
  membreId: string,
  nombre: number,
  motif: string,
): Promise<RefusDeCorrection | 'introuvable' | 'interdit' | null> {
  if (!IDENTIFIANT.test(membreId)) return 'introuvable';
  // Personne ne corrige ses propres points : un autre regard est nécessaire.
  if (membreId === moderateurId) return 'interdit';
  return dansUneTransaction(async (client) => {
    const { rowCount } = await client.query(
      'select id from membre where id = $1 and supprime_le is null for update',
      [membreId],
    );
    if (!rowCount) return 'introuvable';
    const { rows } = await client.query<{ acquis: number }>(
      `select coalesce(sum(nombre) filter (where etat = 'acquis'), 0)::int as acquis
         from maillon where membre_id = $1`,
      [membreId],
    );
    const refus = refusDeCorrection(nombre, rows[0]?.acquis ?? 0);
    if (refus) return refus;

    await client.query(
      `insert into maillon (membre_id, nombre, etat, motif, nature)
       values ($1, $2, 'acquis', $3, 'correction')`,
      [membreId, nombre, `Correction : ${motif.trim()}`],
    );
    await notifier(client, membreId, {
      texte:
        nombre > 0
          ? 'Votre solde a été corrigé : {n} points ajoutés. {motif}'
          : 'Votre solde a été corrigé : {n} points retirés. {motif}',
      valeurs: { n: Math.abs(nombre), motif: motif.trim() },
      lien: '/progression/historique',
    });
    await tracer(client, {
      membreId,
      moderateurId,
      type: 'points_corriges',
      motif,
      details: { nombre },
    });
    return null;
  });
}

// --- Le catalogue ----------------------------------------------------------------------

export type OffreEnGestion = {
  id: string;
  titre: string;
  description: string | null;
  categorie: CategorieDOffre;
  retrait: string | null;
  partenaire: string;
  coutEnMaillons: number;
  stockRestant: number;
  active: boolean;
  echanges: number;
};

export async function offresEnGestion(): Promise<OffreEnGestion[]> {
  return interroger<OffreEnGestion>(
    `select o.id, o.titre, o.description, o.categorie, o.retrait, p.nom as partenaire,
            o.cout_en_maillons as "coutEnMaillons", o.stock_restant as "stockRestant", o.active,
            (select count(*)::int from echange e where e.offre_id = o.id) as echanges
       from offre o join partenaire p on p.id = o.partenaire_id
      order by o.active desc, o.titre`,
  );
}

export async function offreEnGestion(
  id: string,
): Promise<OffreEnGestion | null> {
  if (!IDENTIFIANT.test(id)) return null;
  const [offre] = (await offresEnGestion()).filter((o) => o.id === id);
  return offre ?? null;
}

export type OffreSaisie = {
  titre: string;
  description: string;
  categorie: CategorieDOffre;
  retrait: string;
  partenaire: string;
  cout: number;
  stock: number;
  /** Le stock affiché à l'ouverture de la fiche ; `null` pour un nouvel avantage. */
  stockLu: number | null;
  active: boolean;
};

export async function enregistrerUneOffre(
  moderateurId: string,
  id: string | null,
  offre: OffreSaisie,
): Promise<string | null> {
  if (id !== null && !IDENTIFIANT.test(id)) return null;
  return dansUneTransaction(async (client) => {
    const partenaire = await client.query<{ id: string }>(
      `with trouve as (select id from partenaire where lower(nom) = lower($1) limit 1),
            cree as (insert into partenaire (nom) select $1 where not exists (select 1 from trouve) returning id)
       select id from trouve union all select id from cree`,
      [offre.partenaire.trim()],
    );
    const partenaireId = partenaire.rows[0]!.id;
    const valeurs = [
      partenaireId,
      offre.titre.trim(),
      offre.description.trim() || null,
      offre.categorie,
      offre.retrait.trim() || null,
      offre.cout,
      offre.stock,
      offre.active,
    ];
    let identifiant = id;
    if (id) {
      const { rowCount } = await client.query(
        `update offre set partenaire_id = $1, titre = $2, description = $3, categorie = $4,
                retrait = $5, cout_en_maillons = $6,
                stock_restant = greatest(0, stock_restant + ($7::int - $10::int)),
                active = $8
          where id = $9`,
        [...valeurs, id, offre.stockLu ?? offre.stock],
      );
      if (!rowCount) return null;
    } else {
      const cree = await client.query<{ id: string }>(
        `insert into offre (partenaire_id, titre, description, categorie, retrait, cout_en_maillons, stock_restant, active)
         values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
        valeurs,
      );
      identifiant = cree.rows[0]!.id;
    }
    await tracer(client, {
      membreId: null,
      moderateurId,
      type: 'offre_modifiee',
      motif: id
        ? `Offre modifiée : ${offre.titre.trim()}`
        : `Offre créée : ${offre.titre.trim()}`,
      details: { offre: identifiant },
    });
    return identifiant;
  });
}

// --- Les statistiques -------------------------------------------------------------------

export type Statistiques = {
  gardesRealisees: { valeur: number; variation: number | null };
  tauxDeFinalisation: { valeur: number | null; variation: number | null };
  incidents: { valeur: number; variation: number | null };
  bikeSittersActifs: { valeur: number; variation: number | null };
  parQuartier: { quartier: string; gardes: number; part: number }[];
};

/** Le moment où une garde a trouvé son issue : la reprise, l'annulation, ou à défaut la fin prévue. */
const ISSUE = 'coalesce(s.repris_le, s.annule_le, s.fin)';

export async function statistiques(
  periode: PeriodeDeStatistiques,
): Promise<Statistiques> {
  const jours =
    PERIODES_DE_STATISTIQUES.find((p) => p.cle === periode)?.jours ?? 30;
  const mesures = `
    count(*) filter (where s.etat = 'termine')::int as terminees,
    count(*) filter (where s.etat in ('annule', 'litige') and s.repondu_le is not null
                       and exists (select 1 from evenement_de_garde ev
                                    where ev.stationnement_id = s.id and ev.etape = 'accepte'))::int as interrompues,
    count(distinct e.membre_id) filter (where s.etat = 'termine')::int as actifs`;
  const [actuelle, precedente, incidents, quartiers] = await Promise.all([
    uneLigne<{ terminees: number; interrompues: number; actifs: number }>(
      `select ${mesures}
         from stationnement s join emplacement e on e.id = s.emplacement_id
        where ${ISSUE} >= now() - make_interval(days => $1) and ${ISSUE} < now()`,
      [jours],
    ),
    uneLigne<{ terminees: number; interrompues: number; actifs: number }>(
      `select ${mesures}
         from stationnement s join emplacement e on e.id = s.emplacement_id
        where ${ISSUE} >= now() - make_interval(days => $1 * 2) and ${ISSUE} < now() - make_interval(days => $1)`,
      [jours],
    ),
    uneLigne<{ actuels: number; precedents: number }>(
      `select count(*) filter (where fait_le >= now() - make_interval(days => $1))::int as actuels,
              count(*) filter (where fait_le < now() - make_interval(days => $1)
                                 and fait_le >= now() - make_interval(days => $1 * 2))::int as precedents
         from evenement_de_garde where etape = 'litige'`,
      [jours],
    ),
    interroger<{ quartier: string; gardes: number }>(
      `select e.quartier, count(*)::int as gardes
         from stationnement s join emplacement e on e.id = s.emplacement_id
        where s.etat = 'termine' and ${ISSUE} >= now() - make_interval(days => $1) and ${ISSUE} < now()
        group by e.quartier
        order by gardes desc, e.quartier
        limit 8`,
      [jours],
    ),
  ]);
  const a = actuelle ?? { terminees: 0, interrompues: 0, actifs: 0 };
  const b = precedente ?? { terminees: 0, interrompues: 0, actifs: 0 };
  const tauxActuel = tauxDeFinalisation(a.terminees, a.interrompues);
  const tauxPrecedent = tauxDeFinalisation(b.terminees, b.interrompues);
  const total = quartiers.reduce((somme, q) => somme + q.gardes, 0);
  return {
    gardesRealisees: {
      valeur: a.terminees,
      variation: variation(a.terminees, b.terminees),
    },
    tauxDeFinalisation: {
      valeur: tauxActuel,
      variation:
        tauxActuel !== null && tauxPrecedent !== null
          ? tauxActuel - tauxPrecedent
          : null,
    },
    incidents: {
      valeur: incidents?.actuels ?? 0,
      variation: variation(incidents?.actuels ?? 0, incidents?.precedents ?? 0),
    },
    bikeSittersActifs: {
      valeur: a.actifs,
      variation: variation(a.actifs, b.actifs),
    },
    parQuartier: quartiers.map((q) => ({
      ...q,
      part: total > 0 ? Math.round((q.gardes / total) * 100) : 0,
    })),
  };
}
