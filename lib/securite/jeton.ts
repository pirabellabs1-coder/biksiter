import { createHash, randomBytes } from 'node:crypto';

/**
 * Les jetons de session.
 *
 * Le jeton est 256 bits d'aléa : il n'a aucun sens, donc rien à signer. Ce que
 * la base garde est son empreinte SHA-256, pas le jeton lui-même — une fuite
 * de la table `session` ne donne alors de quoi se connecter à personne.
 *
 * SHA-256 sans étirement suffit ici, contrairement aux mots de passe : un
 * jeton de 256 bits tiré au hasard ne se retrouve pas par force brute.
 */

export function nouveauJeton(): string {
  return randomBytes(32).toString('base64url');
}

export function empreinteDuJeton(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex');
}

/**
 * Un code numérique tiré sans biais.
 *
 * On rejette les octets au-delà de 249 : prendre un octet modulo 10
 * favoriserait les chiffres 0 à 5, et un code prévisible n'est pas un code.
 */
export function nouveauCodeNumerique(longueur: number): string {
  const chiffres: string[] = [];
  while (chiffres.length < longueur) {
    for (const octet of randomBytes(longueur * 2)) {
      if (octet < 250 && chiffres.length < longueur) {
        chiffres.push(String(octet % 10));
      }
    }
  }
  return chiffres.join('');
}

/** Le code de remise, à quatre chiffres (règle 5). */
export function nouveauCodeDeRemise(): string {
  return nouveauCodeNumerique(4);
}
