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
  // Une fois venu en HTTPS, le navigateur n'essaie plus jamais la version en
  // clair : c'est là qu'un cookie de session se ferait intercepter. Seulement
  // en production, pour ne pas bloquer le poste de développement.
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ]
    : []),
];

const configuration: NextConfig = {
  // L'en-tête « X-Powered-By » n'apporte rien et annonce la pile technique.
  poweredByHeader: false,

  // L'indicateur de développement de Next.js se posait sur les écrans, par
  // dessus le choix de la langue : on relit les pages telles qu'on les livre.
  devIndicators: false,

  experimental: {
    // Deux racines coexistent le temps de remplacer les écrans de l'ancien
    // site : une adresse inconnue n'appartient à aucune des deux, et c'est
    // `app/global-not-found.tsx` qui lui répond.
    globalNotFound: true,
    // Une pièce d'identité photographiée dépasse la limite d'un mégaoctet des
    // actions serveur. Un constat joint jusqu'à quatre photos : le formulaire
    // les réduit avant l'envoi et refuse celles qui dépassent quatre
    // mégaoctets (lib/regles/constat.ts), pour que l'envoi tienne sous cette
    // limite. Au-delà, l'action échouerait avant d'avoir pu répondre.
    serverActions: { bodySizeLimit: '17mb' },
  },

  // Les anciennes adresses des pages de texte, pour les liens déjà partagés.
  async redirects() {
    return [
      {
        source: '/fonctionnement',
        destination: '/comment-ca-marche',
        permanent: true,
      },
      { source: '/questions-frequentes', destination: '/faq', permanent: true },
      {
        source: '/inscription/verification',
        destination: '/inscription/telephone',
        permanent: true,
      },
      {
        source: '/inscription/validation',
        destination: '/inscription/identite',
        permanent: true,
      },
      // L'ancien espace membre : les liens déjà envoyés par e-mail doivent
      // encore mener quelque part.
      { source: '/mon-compte', destination: '/accueil', permanent: true },
      { source: '/explorer', destination: '/accueil', permanent: false },
      { source: '/activite', destination: '/gardes', permanent: false },
      { source: '/mes-stationnements', destination: '/gardes', permanent: true },
      { source: '/stationnements/:id', destination: '/gardes/:id', permanent: true },
      { source: '/emplacements', destination: '/recherche', permanent: true },
      { source: '/mes-emplacements', destination: '/mes-lieux', permanent: false },
      { source: '/mes-emplacements/:reference/modifier', destination: '/mes-lieux/:reference/modifier', permanent: false },
      { source: '/proposer-un-emplacement', destination: '/devenir-bike-sitter', permanent: false },
      { source: '/moderation', destination: '/administration/verifications', permanent: false },
      { source: '/moderation/membres/:id', destination: '/administration/verifications/:id', permanent: false },
    ];
  },

  async headers() {
    // La route de la pièce d'identité pose ses propres en-têtes, plus stricts
    // (`no-referrer`, bac à sable) : ceux du site ne doivent pas les remplacer.
    return [
      {
        source: '/((?!administration/verifications/[^/]+/piece).*)',
        headers: enTetesDeSecurite,
      },
    ];
  },
};

export default configuration;
