import 'server-only';

import type { PoolClient } from 'pg';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import type { TypeDePiece } from '@/lib/regles/pieces';
import { CONSERVATION_MAXIMALE_JOURS } from '@/lib/regles/pieces';
import { chiffrer, dechiffrer } from '@/lib/securite/chiffrement';

/**
 * Les pièces d'identité.
 *
 * Le document est chiffré avant de toucher la base et déchiffré uniquement
 * pour être affiché à un modérateur. Il n'existe aucune fonction qui rende le
 * contenu ailleurs — c'est volontaire, et il ne faut pas en ajouter.
 */

export type PieceDeposee = {
  deposeeLe: Date;
  relueLe: Date | null;
  typeMime: TypeDePiece;
};

/**
 * Déposer remplace : quelqu'un dont la pièce a été refusée en renvoie une, et
 * l'ancienne n'a aucune raison de rester. La vérification repasse « en cours »
 * dans la même transaction, sinon un dépôt pourrait exister sans que personne
 * ne sache qu'il faut le regarder.
 */
export async function deposerLaPiece(
  membreId: string,
  document: { contenu: Buffer; typeMime: TypeDePiece },
): Promise<void> {
  const coffre = chiffrer(document.contenu);

  await dansUneTransaction(async (client) => {
    await client.query(
      `insert into piece_didentite
         (membre_id, contenu_chiffre, vecteur, etiquette, type_mime, taille_en_octets)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (membre_id) do update
          set contenu_chiffre = excluded.contenu_chiffre,
              vecteur = excluded.vecteur,
              etiquette = excluded.etiquette,
              type_mime = excluded.type_mime,
              taille_en_octets = excluded.taille_en_octets,
              deposee_le = now(),
              relue_le = null`,
      [
        membreId,
        coffre.contenu,
        coffre.vecteur,
        coffre.etiquette,
        document.typeMime,
        document.contenu.length,
      ],
    );

    await client.query(
      `update membre set verification = 'en_cours'
        where id = $1 and verification <> 'verifiee'`,
      [membreId],
    );
  });
}

export async function pieceDuMembre(
  membreId: string,
): Promise<PieceDeposee | null> {
  return uneLigne<PieceDeposee>(
    `select deposee_le as "deposeeLe",
            relue_le   as "relueLe",
            type_mime  as "typeMime"
       from piece_didentite
      where membre_id = $1`,
    [membreId],
  );
}

/**
 * Le seul chemin qui rend le contenu d'une pièce. L'appelant doit avoir
 * vérifié que la personne est modératrice — la route qui s'en sert le fait.
 */
export async function lirePourModeration(
  membreId: string,
): Promise<{ contenu: Buffer; typeMime: TypeDePiece } | null> {
  const ligne = await uneLigne<{
    contenu_chiffre: Buffer;
    vecteur: Buffer;
    etiquette: Buffer;
    typeMime: TypeDePiece;
  }>(
    `select contenu_chiffre, vecteur, etiquette, type_mime as "typeMime"
       from piece_didentite
      where membre_id = $1`,
    [membreId],
  );

  if (!ligne) {
    return null;
  }

  return {
    contenu: dechiffrer({
      contenu: ligne.contenu_chiffre,
      vecteur: ligne.vecteur,
      etiquette: ligne.etiquette,
    }),
    typeMime: ligne.typeMime,
  };
}

export async function supprimerLaPiece(
  membreId: string,
  client?: PoolClient,
): Promise<void> {
  const requete = 'delete from piece_didentite where membre_id = $1';
  if (client) {
    await client.query(requete, [membreId]);
    return;
  }
  await interroger(requete, [membreId]);
}

/**
 * La promesse faite au membre, exécutée : les pièces relues et celles que
 * personne n'a regardées depuis sept jours disparaissent. La règle vit dans
 * lib/regles/pieces.ts ; ici on l'applique en un seul ordre SQL, pour que la
 * purge tienne même sur une table qui aurait grossi.
 */
export async function purgerLesPieces(): Promise<number> {
  const supprimees = await interroger<{ id: string }>(
    `delete from piece_didentite
      where relue_le is not null
         or deposee_le <= now() - ($1 || ' days')::interval
      returning id`,
    [String(CONSERVATION_MAXIMALE_JOURS)],
  );
  return supprimees.length;
}
