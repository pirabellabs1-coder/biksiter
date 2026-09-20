import 'server-only';

import { headers } from 'next/headers';

/**
 * L'adresse de la connexion, pour limiter ce qui ne se rattache à aucun
 * compte (la consultation d'un code d'invitation).
 *
 * Elle est lue dans l'en-tête posé par le serveur mandataire de l'hébergeur,
 * qui doit remplacer toute valeur envoyée par le navigateur. Sans mandataire,
 * cet en-tête se falsifie : la limite reste alors une précaution, et les
 * vraies protections sont ailleurs (la longueur des codes, le compte des
 * inscriptions refusées).
 */
export async function adresseIpDuVisiteur(): Promise<string> {
  const entetes = await headers();
  const transmise = entetes.get('x-forwarded-for')?.split(',')[0]?.trim();
  return transmise || entetes.get('x-real-ip') || 'inconnue';
}
