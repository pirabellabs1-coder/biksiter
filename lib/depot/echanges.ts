import 'server-only';

import { dansUneTransaction, interroger } from '@/lib/bd/client';
import { messageRecu } from '@/lib/courriel/modeles';
import { mettreEnFile } from '@/lib/envois/file';
import { refusDuMessage, type RefusDeMessage } from '@/lib/regles/echanges';

/**
 * Les échanges autour d'un stationnement.
 *
 * Pas d'accusé de lecture, pas de compteur de messages non lus, pas d'heure de
 * dernière connexion. Personne ne doit pouvoir reprocher à un bénévole d'avoir
 * répondu le lendemain — c'est la raison pour laquelle le chat en temps réel a
 * été écarté, et ce n'est pas la peine de le réintroduire par la fenêtre.
 */

export type MessageEchange = {
  id: string;
  corps: string;
  ecritLe: Date;
  auteurId: string;
  prenomDeLAuteur: string;
};

export async function messagesDuStationnement(
  stationnementId: string,
  membreId: string,
): Promise<MessageEchange[]> {
  // L'autorisation est dans la requête : un membre ne lit que les fils des
  // stationnements qui le concernent, d'un côté ou de l'autre.
  return interroger<MessageEchange>(
    `select m.id,
            m.corps,
            m.ecrit_le as "ecritLe",
            m.auteur_id as "auteurId",
            a.prenom    as "prenomDeLAuteur"
       from message m
       join membre a on a.id = m.auteur_id
       join stationnement s on s.id = m.stationnement_id
       join emplacement e on e.id = s.emplacement_id
      where m.stationnement_id = $1
        and (s.cycliste_id = $2 or e.membre_id = $2)
      order by m.ecrit_le`,
    [stationnementId, membreId],
  );
}

export type EcritureDeMessage =
  | { ecrit: true }
  | { ecrit: false; motif: RefusDeMessage | 'pas_concerne' };

export async function ecrireUnMessage(
  stationnementId: string,
  auteurId: string,
  corps: string,
): Promise<EcritureDeMessage> {
  return dansUneTransaction(async (client) => {
    const contexte = await client.query<{
      etat: string;
      cyclisteId: string;
      bikeSitterId: string;
      emailDuCycliste: string;
      emailDuBikeSitter: string;
      prenomDuCycliste: string;
      prenomDuBikeSitter: string;
      quartier: string;
    }>(
      `select s.etat,
              s.cycliste_id as "cyclisteId",
              e.membre_id   as "bikeSitterId",
              cy.email      as "emailDuCycliste",
              bs.email      as "emailDuBikeSitter",
              cy.prenom     as "prenomDuCycliste",
              bs.prenom     as "prenomDuBikeSitter",
              e.quartier
         from stationnement s
         join emplacement e on e.id = s.emplacement_id
         join membre cy on cy.id = s.cycliste_id
         join membre bs on bs.id = e.membre_id
        where s.id = $1 and (s.cycliste_id = $2 or e.membre_id = $2)`,
      [stationnementId, auteurId],
    );

    if (contexte.rowCount === 0) {
      return { ecrit: false, motif: 'pas_concerne' };
    }

    const ligne = contexte.rows[0];
    const refus = refusDuMessage(corps, ligne.etat);
    if (refus) {
      return { ecrit: false, motif: refus };
    }

    await client.query(
      'insert into message (stationnement_id, auteur_id, corps) values ($1, $2, $3)',
      [stationnementId, auteurId, corps.trim()],
    );

    // Le message part par courriel : c'est le seul moyen que l'autre le voie
    // sans qu'on lui demande de venir regarder une page.
    const cestLeCycliste = auteurId === ligne.cyclisteId;

    await mettreEnFile(
      cestLeCycliste ? ligne.emailDuBikeSitter : ligne.emailDuCycliste,
      messageRecu({
        prenomDuDestinataire: cestLeCycliste
          ? ligne.prenomDuBikeSitter
          : ligne.prenomDuCycliste,
        prenomDeLAuteur: cestLeCycliste
          ? ligne.prenomDuCycliste
          : ligne.prenomDuBikeSitter,
        quartier: ligne.quartier,
        corps: corps.trim(),
      }),
      { client, aPropos: `stationnement ${stationnementId}` },
    );

    return { ecrit: true };
  });
}
