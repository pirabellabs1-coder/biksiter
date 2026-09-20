import { NextResponse, type NextRequest } from 'next/server';

/**
 * La Content-Security-Policy.
 *
 * Elle n'a pas pu être posée dans `next.config.ts` : Next injecte ses propres
 * scripts en ligne, et la seule façon de les autoriser sans ouvrir la porte à
 * tous les autres est un nonce, qui change à chaque requête. C'est ce que fait
 * ce middleware — le nonce part sur la requête, Next le pose sur ses scripts,
 * et la même valeur part sur la réponse.
 *
 * `strict-dynamic` dit au navigateur de faire confiance à ce qu'un script
 * autorisé charge lui-même : sans lui, le découpage en morceaux de Next
 * exigerait de lister chaque fichier.
 *
 * En développement, le rechargement à chaud a besoin d'`unsafe-eval`. On ne le
 * concède que là : la politique servie en production ne le contient pas.
 */
function politique(nonce: string, enDeveloppement: boolean): string {
  const scripts = enDeveloppement
    ? `'self' 'unsafe-inline' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  return [
    `default-src 'self'`,
    `script-src ${scripts}`,
    // Les styles en ligne restent nécessaires : Next et next/font en posent.
    // Le risque est faible — une feuille de style n'exécute rien.
    `style-src 'self' 'unsafe-inline'`,
    // Toutes les images sont servies par notre origine, y compris les
    // visuels éditoriaux de l'accueil (`public/images/`) : rien à charger
    // chez un tiers, donc rien à autoriser ici.
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    ...(enDeveloppement ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

export function middleware(requete: NextRequest): NextResponse {
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const csp = politique(nonce, process.env.NODE_ENV === 'development');

  const entetes = new Headers(requete.headers);
  entetes.set('x-nonce', nonce);
  entetes.set('Content-Security-Policy', csp);

  const reponse = NextResponse.next({ request: { headers: entetes } });
  reponse.headers.set('Content-Security-Policy', csp);

  return reponse;
}

export const config = {
  matcher: [
    /*
     * Tout, sauf les fichiers statiques — et sauf la route qui sert une pièce
     * d'identité : elle pose sa propre politique, bien plus stricte, et n'a
     * aucune raison d'hériter de celle du site.
     */
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|administration/verifications/[^/]+/piece).*)',
      missing: [{ type: 'header', key: 'next-router-prefetch' }],
    },
  ],
};
