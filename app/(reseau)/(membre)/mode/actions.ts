'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { estUnMode, TEMOIN_DE_MODE } from '@/lib/mode';
import { exigerUnMembre } from '@/lib/session';

/** Un an : le mode choisi reste celui qu'on retrouve en revenant. */
const UN_AN = 60 * 60 * 24 * 365;

/**
 * Bascule entre cycliste et bike sitter.
 *
 * Le compte reste unique : le mode ne change que les onglets et l'écran
 * d'accueil. Le champ `vers` dit où atterrir — l'espace bike sitter quand on
 * prend ce rôle, les gardes quand on revient côté cycliste.
 */
export async function choisirLeMode(donnees: FormData): Promise<void> {
  await exigerUnMembre();
  const mode = donnees.get('mode');
  if (estUnMode(mode)) {
    (await cookies()).set(TEMOIN_DE_MODE, mode, {
      maxAge: UN_AN,
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  const vers = donnees.get('vers');
  // Un chemin du site, jamais « //ailleurs » ni « /\ailleurs » : les deux
  // mèneraient vers un autre domaine.
  const destination =
    typeof vers === 'string' &&
    vers.startsWith('/') &&
    !vers.startsWith('//') &&
    !vers.startsWith('/\\')
      ? vers
      : '/accueil';
  redirect(destination);
}
