import type { NextConfig } from 'next';

/**
 * En-têtes de sécurité.
 *
 * La Content-Security-Policy n'est pas ici : elle a besoin d'un nonce qui
 * change à chaque requête, donc elle vit dans `middleware.ts`. Ce qui suit est
 * ce qui peut être posé une fois pour toutes.
 */
const enTetesDeSecurite = [
  // Empêche le navigateur de deviner un type MIME et d'exécuter un fichier
  // téléversé comme du script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Le site n'a aucune raison d'être affiché dans une iframe : c'est ce qui
  // rend le détournement de clic possible.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Ne fuite pas le chemin consulté vers les sites externes — les URL du site
  // contiennent des références d'emplacements.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Aucune de ces fonctions n'est utilisée.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const configuration: NextConfig = {
  // L'en-tête « X-Powered-By » n'apporte rien et annonce la pile technique.
  poweredByHeader: false,

  experimental: {
    // Une pièce d'identité photographiée dépasse la limite d'un mégaoctet des
    // actions serveur. La borne haute reste celle de lib/regles/pieces.ts,
    // qui refuse proprement au-delà de huit mégaoctets.
    serverActions: { bodySizeLimit: '9mb' },
  },

  async headers() {
    return [{ source: '/:chemin*', headers: enTetesDeSecurite }];
  },
};

export default configuration;
