import sharp from 'sharp';

import { LARGEUR_MAXIMALE } from '@/lib/regles/photos';

/**
 * Le nettoyage d'une photo avant stockage.
 *
 * RÈGLE 4. Une photo prise au téléphone porte les coordonnées GPS du lieu dans
 * ses métadonnées EXIF. La publier telle quelle reviendrait à publier
 * l'adresse que tout le reste du produit protège — et personne ne s'en
 * apercevrait, parce que rien ne se voit à l'écran.
 *
 * Ce module est la garantie. Il est séparé du dépôt précisément pour être
 * testable sans base de données : le test vérifie qu'une image entrée avec des
 * coordonnées GPS en ressort sans.
 *
 * Ne jamais ajouter `.withMetadata()` ni `.withExif()` ici. Ne jamais ouvrir
 * un chemin qui stocke l'octet reçu tel quel.
 */

export type PhotoNettoyee = {
  contenu: Buffer;
  largeur: number;
  hauteur: number;
};

export async function nettoyerLaPhoto(original: Buffer): Promise<PhotoNettoyee> {
  const resultat = await sharp(original)
    // `rotate()` sans argument applique l'orientation EXIF avant qu'on la
    // jette : sans lui, une photo prise en portrait s'afficherait couchée.
    .rotate()
    .resize({ width: LARGEUR_MAXIMALE, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  return {
    contenu: resultat.data,
    largeur: resultat.info.width,
    hauteur: resultat.info.height,
  };
}

/** Ce qu'une image porte encore comme métadonnées — sert aux vérifications. */
export async function metadonneesDe(image: Buffer): Promise<{
  exif: boolean;
  bloc: Buffer | undefined;
  format: string | undefined;
}> {
  const metadonnees = await sharp(image).metadata();
  return {
    exif: metadonnees.exif !== undefined,
    bloc: metadonnees.exif,
    format: metadonnees.format,
  };
}

/**
 * Vrai si le bloc EXIF contient un pointeur vers l'IFD GPS.
 *
 * L'EXIF ne stocke pas le mot « GPS » : il désigne ce bloc par l'étiquette
 * numérique 0x8825, écrite sur deux octets dans l'ordre du fichier. C'est ce
 * marqueur-là qu'on cherche, pas une chaîne de caractères.
 */
export function contientDesCoordonnees(bloc: Buffer | undefined): boolean {
  if (!bloc) {
    return false;
  }
  return bloc.includes(Buffer.from([0x25, 0x88]))
    || bloc.includes(Buffer.from([0x88, 0x25]));
}
