/**
 * Les motifs d'un signalement : une liste fermée par type de cible.
 *
 * La modération trie sa file par motif ; un texte libre à cet endroit la
 * rendrait illisible. Les motifs sont enregistrés en français, seul leur
 * libellé se traduit à l'écran.
 */
export const MOTIFS_DE_SIGNALEMENT = {
  membre: [
    'Comportement inapproprié',
    'Harcèlement',
    'Faux profil',
    "Ne s'est pas présenté",
    'Autre',
  ],
  emplacement: [
    'Lieu non sûr',
    'Photos trompeuses',
    'Emplacement partagé',
    'Annonce en double',
    'Autre',
  ],
} as const;

export type CibleSignalable = keyof typeof MOTIFS_DE_SIGNALEMENT;

export function motifDeSignalementValable(
  cible: CibleSignalable,
  motif: string,
): boolean {
  return (MOTIFS_DE_SIGNALEMENT[cible] as readonly string[]).includes(motif);
}
