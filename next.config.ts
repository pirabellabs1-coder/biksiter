import type { NextConfig } from 'next';

/**
 * En-têtes de sécurité.
 *
 * Il n'y a pas encore de Content-Security-Policy : une CSP utile avec Next
 * suppose un nonce généré par un middleware et propagé aux scripts en ligne du
 * framework. Une CSP posée à la va-vite casse le rendu ou ne protège de rien —
 * on la fera correctement, avec le middleware, plutôt que de cocher la case.
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

  async headers() {
    return [{ source: '/:chemin*', headers: enTetesDeSecurite }];
  },
};

export default configuration;
