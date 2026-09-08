import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

/**
 * Le chiffrement des pièces d'identité.
 *
 * AES-256-GCM : le mode authentifié, donc un document altéré en base ne se
 * déchiffre pas silencieusement en autre chose — il lève une erreur. Un
 * vecteur d'initialisation neuf à chaque pièce, comme l'exige GCM ; le
 * réutiliser avec la même clé casserait tout.
 *
 * La clé vit dans l'environnement, jamais dans la base : quelqu'un qui repart
 * avec une sauvegarde repart avec des octets illisibles.
 */

const ALGORITHME = 'aes-256-gcm';
const OCTETS_DE_CLE = 32;
const OCTETS_DE_VECTEUR = 12;

export class CleDeChiffrementAbsente extends Error {
  constructor(detail: string) {
    super(
      `Le dépôt de pièces d’identité est fermé : ${detail} ` +
        'Produire une clé : node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
    this.name = 'CleDeChiffrementAbsente';
  }
}

/**
 * Sans clé lisible, on refuse — on ne stocke pas une pièce d'identité en clair
 * « en attendant ». C'est le seul comportement acceptable pour ce fichier.
 */
function cle(): Buffer {
  const brut = process.env.CLE_DES_PIECES;

  if (!brut) {
    throw new CleDeChiffrementAbsente('CLE_DES_PIECES n’est pas définie.');
  }

  if (!/^[0-9a-fA-F]{64}$/.test(brut)) {
    throw new CleDeChiffrementAbsente(
      'CLE_DES_PIECES doit faire 32 octets en hexadécimal (64 caractères).',
    );
  }

  return Buffer.from(brut, 'hex');
}

export function chiffrementDisponible(): boolean {
  try {
    cle();
    return true;
  } catch {
    return false;
  }
}

export type Coffre = {
  contenu: Buffer;
  vecteur: Buffer;
  etiquette: Buffer;
};

export function chiffrer(clair: Buffer): Coffre {
  const vecteur = randomBytes(OCTETS_DE_VECTEUR);
  const chiffreur = createCipheriv(ALGORITHME, cle(), vecteur);

  const contenu = Buffer.concat([chiffreur.update(clair), chiffreur.final()]);

  return { contenu, vecteur, etiquette: chiffreur.getAuthTag() };
}

export function dechiffrer(coffre: Coffre): Buffer {
  const dechiffreur = createDecipheriv(ALGORITHME, cle(), coffre.vecteur);
  dechiffreur.setAuthTag(coffre.etiquette);

  // `final()` lève si l'étiquette ne correspond pas : c'est exactement ce
  // qu'on veut, plutôt que de rendre un document silencieusement faux.
  return Buffer.concat([dechiffreur.update(coffre.contenu), dechiffreur.final()]);
}

/** Vérifie qu'une clé fraîchement produite a la bonne forme, sans la révéler. */
export function cleValide(candidate: string): boolean {
  if (!/^[0-9a-fA-F]{64}$/.test(candidate)) {
    return false;
  }
  const octets = Buffer.from(candidate, 'hex');
  return (
    octets.length === OCTETS_DE_CLE &&
    !timingSafeEqual(octets, Buffer.alloc(OCTETS_DE_CLE))
  );
}
