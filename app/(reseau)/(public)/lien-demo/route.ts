import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { emailDeLaSession } from '@/lib/depot/sessions';
import { NOM_DU_COOKIE } from '@/lib/session';

/** Le seul compte qu'on peut ouvrir par ce lien. */
const COMPTE_DE_DEMONSTRATION = 'demo@bikesitters.be';

/**
 * Pose un cookie de session pour un jeton fourni en query — servi pour ouvrir
 * l'espace de démonstration depuis un téléphone, où le tour de passe-passe
 * en `javascript:` est bloqué par les navigateurs modernes.
 *
 *   /lien-demo?jeton=xxxx
 *
 * Le jeton doit appartenir à une session encore valide du compte de
 * démonstration, et à lui seul : sans ce contrôle, n'importe qui pouvait
 * envoyer un lien qui connecte sa victime à son propre compte (et lire
 * ensuite ce qu'elle y saisit). À retirer avant l'ouverture publique.
 */
export async function GET(requete: NextRequest): Promise<NextResponse> {
  const jeton = requete.nextUrl.searchParams.get('jeton');
  const email = jeton ? await emailDeLaSession(jeton) : null;
  if (!jeton || email?.toLowerCase() !== COMPTE_DE_DEMONSTRATION) {
    return NextResponse.redirect(new URL('/bienvenue', requete.url));
  }

  const reponse = NextResponse.redirect(new URL('/accueil', requete.url));
  const boite = await cookies();
  boite.set(NOM_DU_COOKIE, jeton, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 24 * 60 * 60,
  });
  return reponse;
}
