/**
 * Les réglages d'affichage : un texte plus grand, un contraste renforcé, des
 * animations réduites. Ils s'ajoutent à ce que le navigateur sait déjà faire
 * (zoom, `prefers-reduced-motion`) pour qui préfère régler l'application
 * elle-même.
 */

export const REGLAGES_D_AFFICHAGE = [
  {
    cle: 'texte-grand',
    titre: 'Texte plus grand',
    description: 'Agrandit le texte et les boutons dans toute l’application.',
  },
  {
    cle: 'contraste-eleve',
    titre: 'Contraste élevé',
    description: 'Renforce les textes secondaires et les bordures.',
  },
  {
    cle: 'animations-reduites',
    titre: 'Réduire les animations',
    description: 'Supprime les mouvements et les effets de transition.',
  },
] as const;

export type ReglageDAffichage = (typeof REGLAGES_D_AFFICHAGE)[number]['cle'];

const CLES: readonly string[] = REGLAGES_D_AFFICHAGE.map((r) => r.cle);

/** Lit le témoin « texte-grand,contraste-eleve » ; tout le reste est ignoré. */
export function lireLesReglages(
  valeur: string | undefined,
): ReglageDAffichage[] {
  if (!valeur) return [];
  const lus = valeur
    .split(',')
    .filter((cle): cle is ReglageDAffichage => CLES.includes(cle));
  return [...new Set(lus)];
}

export function ecrireLesReglages(reglages: readonly string[]): string {
  return lireLesReglages(reglages.join(',')).join(',');
}
