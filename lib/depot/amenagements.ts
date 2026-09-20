import 'server-only';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import {
  ETATS_PROLONGEABLES,
  estUnRetardAnnoncable,
  heureAnnoncee,
  LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT,
  nouvelleFinRefusee,
  pointsEnPlus,
  prolongationPossible,
  retardAnnoncable,
  TEXTE_DU_REFUS_DE_PROLONGATION,
  type MinutesDeRetard,
} from '@/lib/regles/amenagements';
import { occupeAilleurs, placesRestantes } from '@/lib/regles/demande';
import { ETATS_QUI_OCCUPENT_UNE_PLACE } from '@/lib/regles/capacite';
import { jourAffiche } from '@/lib/regles/creneau';
import type { Acteur, Phase } from '@/lib/regles/garde';
import { PROLONGATIONS_PAR_GARDE_ET_PAR_JOUR } from '@/lib/regles/limites';
import type { TypeVelo } from '@/lib/regles/velos';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';

import {
  evenement,
  expirerLesDemandesDevenuesImpossibles,
  lienDeLaGarde,
  refus,
  verrouiller,
  type ResultatDEcriture,
} from './gardes';
import { ecrireUnMessage } from './membre-espace';
import { horairesDe } from './reseau';
import { limiteDejaAtteinte, noterUneTentative } from './tentatives';
import { notifier } from './notifications';

/**
 * Les aménagements d'une garde : annoncer un retard, demander et accorder une
 * prolongation. Chaque écriture verrouille la garde, comme tous les gestes.
 */

export type RetardAnnonce = {
  acteur: Acteur;
  phase: Phase;
  minutes: MinutesDeRetard;
  annonceLe: Date;
};

export type ProlongationDeLaGarde = {
  id: string;
  ancienneFin: Date;
  nouvelleFin: Date;
  motif: string | null;
  etat: 'demandee' | 'acceptee' | 'refusee' | 'annulee';
  demandeeLe: Date;
  pointsEnPlus: number;
};

export async function amenagementsDeLaGarde(gardeId: string): Promise<{
  retards: RetardAnnonce[];
  prolongation: ProlongationDeLaGarde | null;
}> {
  const [retards, prolongation] = await Promise.all([
    interroger<RetardAnnonce>(
      `select acteur, phase, minutes, annonce_le as "annonceLe"
         from retard_annonce where stationnement_id = $1`,
      [gardeId],
    ),
    uneLigne<
      Omit<ProlongationDeLaGarde, 'pointsEnPlus'> & {
        debut: Date;
        typeVelo: TypeVelo;
      }
    >(
      `select p.id, p.ancienne_fin as "ancienneFin", p.nouvelle_fin as "nouvelleFin",
              p.motif, p.etat, p.demandee_le as "demandeeLe",
              s.debut, s.type_velo as "typeVelo"
         from prolongation p join stationnement s on s.id = p.stationnement_id
        where p.stationnement_id = $1
        order by p.demandee_le desc
        limit 1`,
      [gardeId],
    ),
  ]);
  return {
    retards,
    prolongation: prolongation
      ? {
          id: prolongation.id,
          ancienneFin: prolongation.ancienneFin,
          nouvelleFin: prolongation.nouvelleFin,
          motif: prolongation.motif,
          etat: prolongation.etat,
          demandeeLe: prolongation.demandeeLe,
          pointsEnPlus: pointsEnPlus(
            {
              debut: new Date(prolongation.debut),
              fin: new Date(prolongation.ancienneFin),
              typeVelo: prolongation.typeVelo,
            },
            new Date(prolongation.nouvelleFin),
          ),
        }
      : null,
  };
}

function horaireLisible(instant: Date): string {
  const jour = jourABruxelles(instant);
  return jour === jourABruxelles()
    ? heureABruxelles(instant)
    : `${jourAffiche(jour)} ${heureABruxelles(instant)}`;
}

export async function annoncerUnRetardDe(
  membreId: string,
  gardeId: string,
  minutes: number,
  mot: string,
): Promise<ResultatDEcriture> {
  if (!estUnRetardAnnoncable(minutes))
    return refus('Choisissez la durée de votre retard.');
  const texte = mot.trim();
  if (texte.length > LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT) {
    return refus('Votre mot peut contenir jusqu’à {n} caractères.', {
      n: LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT,
    });
  }

  const resultat = await dansUneTransaction(
    async (client): Promise<ResultatDEcriture> => {
      const g = await verrouiller(client, gardeId, membreId);
      if (!g) return refus('Cette garde ne vous concerne pas.');
      const acteur: Acteur =
        g.cycliste_id === membreId ? 'cycliste' : 'bike_sitter';
      const phase = retardAnnoncable(
        g.etat,
        { debut: new Date(g.debut), fin: new Date(g.fin) },
        new Date(),
      );
      if (!phase) {
        return refus(
          'Un retard se signale dans les trois heures qui précèdent le rendez-vous. Pour un autre changement, écrivez un message.',
        );
      }

      const { rowCount } = await client.query(
        `insert into retard_annonce (stationnement_id, acteur, phase, minutes)
       values ($1, $2, $3, $4)
       on conflict do nothing`,
        [g.id, acteur, phase, minutes],
      );
      if (!rowCount)
        return refus(
          'Vous avez déjà prévenu de votre retard pour ce rendez-vous.',
        );

      if (acteur === 'cycliste' && phase === 'depot') {
        // L'encart « vous a prévenu de son retard » de la garde s'appuie sur cette date.
        await client.query(
          'update stationnement set retard_annonce_le = coalesce(retard_annonce_le, now()) where id = $1',
          [g.id],
        );
      }
      await evenement(client, g.id, 'retard_annonce', acteur, `${minutes} min`);

      const reference = phase === 'depot' ? new Date(g.debut) : new Date(g.fin);
      const prenom =
        acteur === 'cycliste' ? g.prenom_cycliste : g.prenom_bike_sitter;
      await notifier(
        client,
        acteur === 'cycliste' ? g.bike_sitter_id : g.cycliste_id,
        {
          texte:
            phase === 'depot'
              ? '{prenom} vous prévient d’un retard d’environ {minutes} minutes pour le dépôt : vers {heure}.'
              : '{prenom} vous prévient d’un retard d’environ {minutes} minutes pour la reprise : vers {heure}.',
          valeurs: {
            prenom,
            minutes,
            heure: horaireLisible(heureAnnoncee(reference, minutes)),
          },
          lien: lienDeLaGarde(g.id),
          urgente: true,
        },
      );
      return { ok: true };
    },
  );

  // Le mot d'accompagnement passe par la conversation, avec ses propres
  // limites : s'il ne part pas, le retard est tout de même annoncé.
  if (resultat.ok && texte) {
    await ecrireUnMessage(membreId, gardeId, texte);
  }
  return resultat;
}

export async function demanderUneProlongation(
  membreId: string,
  gardeId: string,
  nouvelleFin: Date,
  motif: string,
): Promise<ResultatDEcriture> {
  const texte = motif.trim();
  if (texte.length > LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT) {
    return refus('Votre motif peut contenir jusqu’à {n} caractères.', {
      n: LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT,
    });
  }
  // Chaque demande prévient le bike sitter : trois par garde et par jour.
  if (await limiteDejaAtteinte(PROLONGATIONS_PAR_GARDE_ET_PAR_JOUR, `garde:${gardeId}`)) {
    return refus(
      'Vous avez déjà demandé plusieurs prolongations aujourd’hui pour cette garde. Écrivez un message à votre Bike Sitter.',
    );
  }
  return dansUneTransaction(async (client) => {
    const g = await verrouiller(client, gardeId, membreId);
    if (!g || g.cycliste_id !== membreId) {
      return refus('Seul le cycliste peut demander une prolongation.');
    }
    const fin = new Date(g.fin);
    const { rows: contexte } = await client.query<{
      bloque: boolean;
      jours: number[];
      ouverture: string | null;
      fermeture: string | null;
      parJour: Record<string, { de: string; a: string }> | null;
      fermetures: string[];
      dureeMaxJours: number;
    }>(
      `select exists (select 1 from blocage b
                       where (b.membre_id = $2 and b.bloque_id = e.membre_id)
                          or (b.membre_id = e.membre_id and b.bloque_id = $2)) as bloque,
              e.jours_d_accueil::int[] as jours,
              to_char(e.heure_d_ouverture, 'HH24:MI') as ouverture,
              to_char(e.heure_de_fermeture, 'HH24:MI') as fermeture,
              e.horaires_par_jour as "parJour",
              array(select to_char(d, 'YYYY-MM-DD') from unnest(e.fermetures) d) as fermetures,
              e.duree_max_jours as "dureeMaxJours"
         from emplacement e where e.id = $1`,
      [g.emplacement_id, membreId],
    );
    const lieu = contexte[0];
    // Un blocage entre les deux membres ferme la demande sans le dire.
    if (!lieu || lieu.bloque || !prolongationPossible(g.etat, fin, new Date())) {
      return refus('Cette garde ne peut plus être prolongée.');
    }
    const refusDeFin = nouvelleFinRefusee({ debut: new Date(g.debut), fin }, nouvelleFin, {
      horaires: horairesDe({ ...lieu, parJour: lieu.parJour ?? {} }),
      dureeMaxJours: lieu.dureeMaxJours,
    });
    if (refusDeFin) return refus(TEXTE_DU_REFUS_DE_PROLONGATION[refusDeFin]);

    const { rowCount } = await client.query(
      `insert into prolongation (stationnement_id, ancienne_fin, nouvelle_fin, motif)
       values ($1, $2, $3, $4)
       on conflict (stationnement_id) where etat = 'demandee' do nothing`,
      [g.id, fin, nouvelleFin, texte || null],
    );
    if (!rowCount)
      return refus('Une demande de prolongation attend déjà une réponse.');
    await noterUneTentative('prolongation_demandee', `garde:${g.id}`, client);

    await evenement(
      client,
      g.id,
      'prolongation_demandee',
      'cycliste',
      horaireLisible(nouvelleFin),
    );
    await notifier(client, g.bike_sitter_id, {
      texte: '{prenom} demande à prolonger la garde jusqu’à {heure}.',
      valeurs: {
        prenom: g.prenom_cycliste,
        heure: horaireLisible(nouvelleFin),
      },
      lien: lienDeLaGarde(g.id),
    });
    return { ok: true };
  });
}

export type ReponseALaProlongation =
  | 'ok'
  | 'interdit'
  | 'deja_repondu'
  | 'plus_possible'
  | 'occupe';

export async function repondreALaProlongation(
  membreId: string,
  gardeId: string,
  reponse: 'accepter' | 'refuser' | 'annuler',
): Promise<ReponseALaProlongation> {
  return dansUneTransaction(async (client) => {
    const g = await verrouiller(client, gardeId, membreId);
    if (!g) return 'interdit';
    const acteur: Acteur =
      g.cycliste_id === membreId ? 'cycliste' : 'bike_sitter';
    if ((reponse === 'annuler') !== (acteur === 'cycliste')) return 'interdit';

    const { rows } = await client.query<{ id: string; nouvelle_fin: Date }>(
      `select id, nouvelle_fin from prolongation
        where stationnement_id = $1 and etat = 'demandee'
        for update`,
      [g.id],
    );
    const demande = rows[0];
    if (!demande) return 'deja_repondu';

    const nouvelleFin = new Date(demande.nouvelle_fin);
    const cloturer = (etat: 'acceptee' | 'refusee' | 'annulee') =>
      client.query(
        'update prolongation set etat = $2, repondue_le = now() where id = $1',
        [demande.id, etat],
      );

    // Une garde qui a changé d'état entre-temps (terminée, gelée) ne se
    // prolonge plus. Une réponse arrivée après la fin initiale compte encore,
    // tant que la nouvelle fin est devant nous.
    if (
      !ETATS_PROLONGEABLES.includes(g.etat) ||
      nouvelleFin.getTime() <= Date.now()
    ) {
      await cloturer('annulee');
      return 'plus_possible';
    }

    if (reponse === 'annuler') {
      await cloturer('annulee');
      return 'ok';
    }

    if (reponse === 'refuser') {
      await cloturer('refusee');
      await evenement(client, g.id, 'prolongation_refusee', 'bike_sitter');
      await notifier(client, g.cycliste_id, {
        texte:
          '{prenom} ne peut pas prolonger la garde. Le vélo est à reprendre à l’heure prévue.',
        valeurs: { prenom: g.prenom_bike_sitter },
        lien: lienDeLaGarde(g.id),
      });
      return 'ok';
    }

    // Accepter : la place doit rester libre sur tout le créneau prolongé, chez
    // ce bike sitter, comme pour une acceptation. Seules les gardes qui
    // occupent une place comptent ; une demande en attente n'en occupe aucune.
    await client.query(
      'select id from emplacement where membre_id = $1 order by id for update',
      [g.bike_sitter_id],
    );
    const debut = new Date(g.debut);
    const { rows: retenues } = await client.query<{
      emplacement_id: string;
      debut: Date;
      fin: Date;
    }>(
      `select s.emplacement_id, s.debut, s.fin
         from stationnement s join emplacement e on e.id = s.emplacement_id
        where e.membre_id = $1 and s.id <> $2 and s.etat = any($3::text[])
          and s.fin > $4::timestamptz - interval '1 day' and s.debut < $5::timestamptz + interval '1 day'`,
      [g.bike_sitter_id, g.id, ETATS_QUI_OCCUPENT_UNE_PLACE, debut, nouvelleFin],
    );
    const creneau = { debut, fin: nouvelleFin };
    const intervalles = (liste: typeof retenues) =>
      liste.map((r) => ({ debut: new Date(r.debut), fin: new Date(r.fin) }));
    const ici = intervalles(
      retenues.filter((r) => r.emplacement_id === g.emplacement_id),
    );
    const ailleurs = intervalles(
      retenues.filter((r) => r.emplacement_id !== g.emplacement_id),
    );
    if (
      occupeAilleurs(ailleurs, creneau) ||
      placesRestantes(g.capacite, ici, creneau) <= 0
    ) {
      return 'occupe';
    }

    await cloturer('acceptee');
    await client.query('update stationnement set fin = $2 where id = $1', [
      g.id,
      nouvelleFin,
    ]);
    // Un retard annoncé pour l'ancienne heure de reprise n'a plus d'objet, et
    // pourra de nouveau s'annoncer pour la nouvelle.
    await client.query(
      "delete from retard_annonce where stationnement_id = $1 and phase = 'reprise'",
      [g.id],
    );
    // Les demandes que la garde prolongée rend impossibles sont closes tout
    // de suite, comme à l'acceptation.
    await expirerLesDemandesDevenuesImpossibles(client, g, debut, nouvelleFin);
    await evenement(
      client,
      g.id,
      'prolongation_acceptee',
      'bike_sitter',
      horaireLisible(nouvelleFin),
    );
    await notifier(client, g.cycliste_id, {
      texte:
        '{prenom} a accepté la prolongation : la garde se termine désormais à {heure}.',
      valeurs: {
        prenom: g.prenom_bike_sitter,
        heure: horaireLisible(nouvelleFin),
      },
      lien: lienDeLaGarde(g.id),
    });
    return 'ok';
  });
}
