import 'server-only';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import { mettreEnFile } from '@/lib/courriel/file';
import { identiteRefusee, identiteVerifiee } from '@/lib/courriel/modeles';
import type { TypeDePiece } from '@/lib/regles/pieces';

/**
 * Ce que fait une personne qui modère.
 *
 * Deux principes portent ce fichier :
 *   - la décision est journalisée et le document ne l'est pas. On garde ce
 *     qu'on a décidé et pourquoi, jamais la pièce qui l'a fondée ;
 *   - la pièce est supprimée dans la même transaction que la décision. Elle
 *     n'a plus aucune utilité dès qu'un humain a tranché, et remettre la
 *     suppression à un travail de fond, c'est la remettre à jamais.
 */

export type DossierAVerifier = {
  membreId: string;
  prenom: string;
  nom: string;
  email: string;
  deposeeLe: Date;
  typeMime: TypeDePiece;
  tailleEnOctets: number;
};

export async function dossiersAVerifier(): Promise<DossierAVerifier[]> {
  return interroger<DossierAVerifier>(
    `select m.id            as "membreId",
            m.prenom,
            m.nom,
            m.email,
            p.deposee_le    as "deposeeLe",
            p.type_mime     as "typeMime",
            p.taille_en_octets as "tailleEnOctets"
       from piece_didentite p
       join membre m on m.id = p.membre_id
      where p.relue_le is null
      order by p.deposee_le`,
  );
}

export async function dossier(
  membreId: string,
): Promise<DossierAVerifier | null> {
  return uneLigne<DossierAVerifier>(
    `select m.id            as "membreId",
            m.prenom,
            m.nom,
            m.email,
            p.deposee_le    as "deposeeLe",
            p.type_mime     as "typeMime",
            p.taille_en_octets as "tailleEnOctets"
       from piece_didentite p
       join membre m on m.id = p.membre_id
      where m.id = $1 and p.relue_le is null`,
    [membreId],
  );
}

export type Decision = 'verifiee' | 'refusee';

/**
 * Trancher. Le motif est obligatoire pour un refus — la base le refuserait de
 * toute façon, mais mieux vaut le dire ici que faire remonter une erreur SQL.
 */
export async function trancher(
  membreId: string,
  moderateurId: string,
  decision: Decision,
  motif: string | null,
): Promise<boolean> {
  if (decision === 'refusee' && (motif === null || motif.trim() === '')) {
    throw new Error('Un refus se motive : le membre doit savoir pourquoi.');
  }

  return dansUneTransaction(async (client) => {
    const concerne = await client.query<{ prenom: string; email: string }>(
      `select m.prenom, m.email
         from membre m
         join piece_didentite p on p.membre_id = m.id
        where m.id = $1 and p.relue_le is null
        for update of m`,
      [membreId],
    );

    if (concerne.rowCount === 0) {
      return false;
    }

    const { prenom, email } = concerne.rows[0];

    await client.query(
      `update membre
          set verification = $2,
              verifie_le = case when $2 = 'verifiee' then now() else null end
        where id = $1`,
      [membreId, decision],
    );

    await client.query(
      `insert into decision_de_moderation (membre_id, decide_par, decision, motif)
       values ($1, $2, $3, $4)`,
      [membreId, moderateurId, decision, motif],
    );

    // La pièce disparaît ici, pas plus tard.
    await client.query('delete from piece_didentite where membre_id = $1', [
      membreId,
    ]);

    await mettreEnFile(
      email,
      decision === 'verifiee'
        ? identiteVerifiee({ prenom })
        : identiteRefusee({ prenom, motif: motif ?? '' }),
      { client, aPropos: `vérification ${membreId}` },
    );

    return true;
  });
}

export type EntreeDuJournal = {
  id: string;
  prenom: string;
  nom: string;
  decision: Decision;
  motif: string | null;
  decideeLe: Date;
  parQui: string | null;
};

export async function journal(combien = 50): Promise<EntreeDuJournal[]> {
  return interroger<EntreeDuJournal>(
    `select d.id,
            m.prenom,
            m.nom,
            d.decision,
            d.motif,
            d.decidee_le as "decideeLe",
            mo.prenom    as "parQui"
       from decision_de_moderation d
       join membre m on m.id = d.membre_id
       left join membre mo on mo.id = d.decide_par
      order by d.decidee_le desc
      limit $1`,
    [combien],
  );
}

// --- Candidatures d'emplacement ---------------------------------------------

export type CandidatureAVoir = {
  id: string;
  prenom: string;
  email: string;
  type: string;
  quartier: string | null;
  capacite: number;
  deposeeLe: Date;
};

export async function candidaturesEnAttente(): Promise<CandidatureAVoir[]> {
  return interroger<CandidatureAVoir>(
    `select id, prenom, email, type, quartier, capacite,
            deposee_le as "deposeeLe"
       from candidature_emplacement
      where traitee_le is null
      order by deposee_le`,
  );
}

export async function marquerCandidatureTraitee(
  candidatureId: string,
  moderateurId: string,
): Promise<void> {
  await interroger(
    `update candidature_emplacement
        set traitee_le = now(), traitee_par = $2
      where id = $1 and traitee_le is null`,
    [candidatureId, moderateurId],
  );
}
