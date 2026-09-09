/**
 * Les photos d'un emplacement.
 *
 * Elles servent à ce qu'un cycliste reconnaisse le lieu et sache où son vélo
 * va dormir. Elles ne servent pas à le trouver — et c'est là que se joue la
 * règle 4.
 *
 * DEUX FUITES POSSIBLES, TOUTES DEUX TRAITÉES AILLEURS :
 *   - les métadonnées. Une photo prise au téléphone porte les coordonnées GPS
 *     du lieu. Le dépôt ré-encode systématiquement en WebP, ce qui les
 *     supprime ; le schéma contraint le type stocké pour que personne ne
 *     contourne ce passage ;
 *   - ce qui est dans le cadre. Aucun code ne sait lire un numéro de rue sur
 *     une façade : c'est au bike sitter qu'on le dit, au moment du dépôt.
 */

export const PHOTOS_PAR_EMPLACEMENT = 3;

/** Ce que les trois photos montrent, dans l'ordre où elles s'affichent. */
export const SUJETS_DES_PHOTOS = [
  'Le lieu, vu en entier',
  'L’endroit où le vélo sera rangé',
  'L’entrée, telle qu’on la voit en arrivant',
] as const;

/** Huit mégaoctets : une photo de téléphone passe largement. */
export const TAILLE_MAXIMALE_OCTETS = 8 * 1024 * 1024;

/** Ce qu'un appareil photo produit. Le stockage, lui, est toujours du WebP. */
export const TYPES_ACCEPTES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export type TypeDePhoto = (typeof TYPES_ACCEPTES)[number];

/** Au-delà, on ne gagne rien en lisibilité et on alourdit la page. */
export const LARGEUR_MAXIMALE = 1400;

export function estUnTypeAccepte(valeur: string): valeur is TypeDePhoto {
  return (TYPES_ACCEPTES as readonly string[]).includes(valeur);
}

export function estUnRangValide(rang: number): boolean {
  return Number.isInteger(rang) && rang >= 0 && rang < PHOTOS_PAR_EMPLACEMENT;
}

export type RefusDePhoto = 'vide' | 'type_refuse' | 'trop_lourde' | 'rang_hors_limites';

export function refusDeLaPhoto(photo: {
  type: string;
  taille: number;
  rang: number;
}): RefusDePhoto | null {
  if (!estUnRangValide(photo.rang)) {
    return 'rang_hors_limites';
  }
  if (photo.taille <= 0) {
    return 'vide';
  }
  if (!estUnTypeAccepte(photo.type)) {
    return 'type_refuse';
  }
  if (photo.taille > TAILLE_MAXIMALE_OCTETS) {
    return 'trop_lourde';
  }
  return null;
}
