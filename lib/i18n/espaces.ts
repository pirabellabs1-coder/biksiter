/**
 * Où la langue choisie s'applique.
 *
 * Le site public est traduit en néerlandais et en anglais ; l'espace membre,
 * lui, ne l'est pas encore. Y afficher un mélange de langues — et déclarer
 * `lang="en"` sur une page écrite en français — trompait les lecteurs
 * d'écran comme les membres. L'espace membre s'affiche donc en français,
 * quelle que soit la langue choisie sur le site, jusqu'à sa traduction.
 */
const PAGES_PUBLIQUES = [
  '/a-propos',
  '/bienvenue',
  '/blog',
  '/comment-ca-marche',
  '/communaute',
  '/conditions-generales',
  '/confidentialite',
  '/confirmer-mon-email',
  '/connexion',
  '/contact',
  '/faq',
  '/hors-ligne',
  '/inscription',
  '/invitation',
  '/liste-attente',
  '/mentions-legales',
  '/mot-de-passe-oublie',
  '/nouveau-mot-de-passe',
  '/plan-du-site',
  '/securite',
  '/soutenir',
] as const;

export function laLangueChoisieSApplique(chemin: string): boolean {
  if (chemin === '/' || chemin === '') return true;
  return PAGES_PUBLIQUES.some(
    (page) => chemin === page || chemin.startsWith(`${page}/`),
  );
}
