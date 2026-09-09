import 'server-only';

import { interroger, uneLigne } from '@/lib/bd/client';
import { nettoyerLaPhoto } from '@/lib/securite/image';

/**
 * Les photos d'un emplacement.
 *
 * RÈGLE 4 — le ré-encodage n'est pas une optimisation, c'est une garantie.
 *
 * Une photo prise au téléphone porte les coordonnées GPS du lieu dans ses
 * métadonnées EXIF : la publier telle quelle, c'est publier l'adresse que tout
 * le reste du produit protège. `sharp` ne recopie pas les métadonnées sauf si
 * on le lui demande explicitement — et on ne le lui demande pas.
 *
 * Ne pas ajouter `.withMetadata()` ici. Ne pas ajouter de chemin qui stocke
 * l'octet reçu tel quel.
 */

export type PhotoRangee = {
  rang: number;
  largeur: number;
  hauteur: number;
};

export async function ajouterUnePhoto(
  emplacementId: string,
  rang: number,
  original: Buffer,
): Promise<void> {
  // Le nettoyage vit dans lib/securite/image.ts, avec le test qui prouve
  // qu'une photo entrée avec des coordonnées GPS en ressort sans.
  const nettoyee = await nettoyerLaPhoto(original);

  await interroger(
    `insert into photo_emplacement
       (emplacement_id, contenu, type_mime, largeur, hauteur, rang)
     values ($1, $2, 'image/webp', $3, $4, $5)
     on conflict (emplacement_id, rang) do update
        set contenu = excluded.contenu,
            largeur = excluded.largeur,
            hauteur = excluded.hauteur,
            ajoutee_le = now()`,
    [
      emplacementId,
      nettoyee.contenu,
      nettoyee.largeur,
      nettoyee.hauteur,
      rang,
    ],
  );
}

/** Les métadonnées seules : le contenu ne voyage que par la route dédiée. */
export async function photosDeLEmplacement(
  reference: string,
): Promise<PhotoRangee[]> {
  return interroger<PhotoRangee>(
    `select p.rang, p.largeur, p.hauteur
       from photo_emplacement p
       join emplacement e on e.id = p.emplacement_id
      where e.reference = $1
      order by p.rang`,
    [reference],
  );
}

export async function lireUnePhoto(
  reference: string,
  rang: number,
): Promise<Buffer | null> {
  const ligne = await uneLigne<{ contenu: Buffer }>(
    `select p.contenu
       from photo_emplacement p
       join emplacement e on e.id = p.emplacement_id
      where e.reference = $1 and p.rang = $2`,
    [reference, rang],
  );
  return ligne?.contenu ?? null;
}

export async function retirerUnePhoto(
  emplacementId: string,
  rang: number,
): Promise<void> {
  await interroger(
    'delete from photo_emplacement where emplacement_id = $1 and rang = $2',
    [emplacementId, rang],
  );
}

/** L'identifiant interne, pour les écritures — jamais rendu au client. */
export async function identifiantDeLEmplacement(
  reference: string,
  membreId: string,
): Promise<string | null> {
  const ligne = await uneLigne<{ id: string }>(
    'select id from emplacement where reference = $1 and membre_id = $2',
    [reference, membreId],
  );
  return ligne?.id ?? null;
}
