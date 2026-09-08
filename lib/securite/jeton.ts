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

/** Un code de remise à quatre chiffres (règle 5), tiré sans biais. */
export function nouveauCodeDeRemise(): string {
  // On rejette les tirages qui déborderaient : prendre un octet modulo 10
  // favoriserait les chiffres 0 à 5.
  const chiffres: string[] = [];
  while (chiffres.length < 4) {
    for (const octet of randomBytes(8)) {
      if (octet < 250 && chiffres.length < 4) {
        chiffres.push(String(octet % 10));
      }
    }
  }
  return chiffres.join('');
}
