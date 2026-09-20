/**
 * La pièce d'identité.
 *
 * On en demande une parce que la règle 2 l'exige : personne ne publie un
 * emplacement sans avoir été vérifié par un humain, et c'est ce qui rend
 * acceptable d'ouvrir sa porte à un inconnu.
 *
 * En échange, on s'engage sur ce qu'on en fait : elle est supprimée dès que la
 * vérification est faite, et au plus tard après sept jours, même si personne
 * ne l'a regardée. Ni l'image ni le numéro ne sont conservés — seulement le
 * fait que la vérification a eu lieu. Cette promesse est écrite sur le site :
 * elle doit donc être exécutable, et c'est ce fichier qui la porte.
 */

export const CONSERVATION_MAXIMALE_JOURS = 7;

/** Huit mégaoctets : une photo de téléphone passe, un scan de brochure non. */
export const TAILLE_MAXIMALE_OCTETS = 8 * 1024 * 1024;

/** Ce qu'un appareil photo ou un scanner produit, et rien d'autre. */
export const TYPES_ACCEPTES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export type TypeDePiece = (typeof TYPES_ACCEPTES)[number];

const JOUR_EN_MS = 24 * 60 * 60 * 1000;

export function estUnTypeAccepte(valeur: string): valeur is TypeDePiece {
  return (TYPES_ACCEPTES as readonly string[]).includes(valeur);
}

/**
 * Le type d'un fichier, lu dans ses premiers octets.
 *
 * Le type annoncé par le navigateur se déclare, il ne se vérifie pas : c'est
 * la signature du fichier qui dit ce qu'il est vraiment. Un fichier dont la
 * signature n'est pas celle d'une photo ou d'un PDF n'est pas accepté, quel
 * que soit son nom.
 */
export function typeReelDuFichier(octets: Uint8Array): TypeDePiece | null {
  const commencePar = (...signature: number[]) =>
    signature.every((octet, rang) => octets[rang] === octet);

  if (commencePar(0xff, 0xd8, 0xff)) {
    return 'image/jpeg';
  }
  if (commencePar(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
    return 'image/png';
  }
  // « RIFF », quatre octets de taille, puis « WEBP ».
  if (
    commencePar(0x52, 0x49, 0x46, 0x46) &&
    octets[8] === 0x57 &&
    octets[9] === 0x45 &&
    octets[10] === 0x42 &&
    octets[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (commencePar(0x25, 0x50, 0x44, 0x46, 0x2d)) {
    return 'application/pdf';
  }
  return null;
}

export type RefusDeDepot = 'type_refuse' | 'trop_lourde' | 'vide';

export function refusDuDepot(fichier: {
  type: string;
  taille: number;
}): RefusDeDepot | null {
  if (fichier.taille <= 0) {
    return 'vide';
  }
  if (!estUnTypeAccepte(fichier.type)) {
    return 'type_refuse';
  }
  if (fichier.taille > TAILLE_MAXIMALE_OCTETS) {
    return 'trop_lourde';
  }
  return null;
}

export type Piece = {
  deposeeLe: Date;
  /** Renseigné quand une personne a tranché. */
  relueLe: Date | null;
};

/**
 * Deux raisons de supprimer, et la première l'emporte : une pièce relue n'a
 * plus aucune utilité, quelle que soit sa date de dépôt.
 */
export function doitEtreSupprimee(piece: Piece, maintenant: Date): boolean {
  if (piece.relueLe !== null) {
    return true;
  }

  const age = maintenant.getTime() - piece.deposeeLe.getTime();
  return age >= CONSERVATION_MAXIMALE_JOURS * JOUR_EN_MS;
}

/** Ce qu'on annonce au membre : combien de temps sa pièce reste chez nous. */
export function joursAvantSuppression(
  deposeeLe: Date,
  maintenant: Date,
): number {
  const ecoules = (maintenant.getTime() - deposeeLe.getTime()) / JOUR_EN_MS;
  return Math.max(0, Math.ceil(CONSERVATION_MAXIMALE_JOURS - ecoules));
}
