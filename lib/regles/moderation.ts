/**
 * Les gestes de la modération.
 *
 * Un geste qui touche un membre se motive toujours : la personne concernée
 * doit pouvoir comprendre, et l'association relire ce qui a été décidé.
 */

export const LONGUEUR_MINIMALE_D_UN_MOTIF = 5;
export const LONGUEUR_MAXIMALE_D_UN_MOTIF = 600;

export function motifDeModerationValide(motif: string): boolean {
  const texte = motif.trim();
  return (
    texte.length >= LONGUEUR_MINIMALE_D_UN_MOTIF &&
    texte.length <= LONGUEUR_MAXIMALE_D_UN_MOTIF
  );
}

// --- Les corrections de points ---------------------------------------------------

/**
 * Une correction répare une erreur ; elle ne remplace pas les gardes. Au-delà
 * de cent points d'un coup, c'est un autre problème, qui ne se règle pas d'un
 * formulaire.
 */
export const CORRECTION_MAXIMALE = 100;

export type RefusDeCorrection = 'nulle' | 'trop_grande' | 'solde_negatif';

export function refusDeCorrection(
  nombre: number,
  soldeActuel: number,
): RefusDeCorrection | null {
  if (!Number.isInteger(nombre) || nombre === 0) return 'nulle';
  if (Math.abs(nombre) > CORRECTION_MAXIMALE) return 'trop_grande';
  if (soldeActuel + nombre < 0) return 'solde_negatif';
  return null;
}

// --- Les litiges ------------------------------------------------------------------

export const ISSUES_D_UN_LITIGE = [
  {
    cle: 'terminer_avec_points',
    titre: 'Clore la garde, points accordés',
    description:
      'Le vélo est rendu et la garde s’est bien terminée : le Bike Sitter reçoit ses points.',
  },
  {
    cle: 'terminer_sans_points',
    titre: 'Clore la garde, sans points',
    description:
      'Le vélo est rendu, mais la garde ne s’est pas déroulée comme prévu : aucun point.',
  },
  {
    cle: 'annuler',
    titre: 'Annuler la garde',
    description:
      'La garde n’a pas eu lieu comme convenu : elle est annulée, sans points.',
  },
] as const;

export type IssueDUnLitige = (typeof ISSUES_D_UN_LITIGE)[number]['cle'];

export function estUneIssueDeLitige(valeur: unknown): valeur is IssueDUnLitige {
  return ISSUES_D_UN_LITIGE.some((issue) => issue.cle === valeur);
}

export type PrioriteDUnLitige = 'haute' | 'moyenne';

/** Un vélo qui n'est pas revenu passe avant tout le reste. */
const MOTIFS_URGENTS = [
  "Le vélo n'a pas été restitué",
  'Le vélo est endommagé',
];

export function prioriteDuLitige(motif: string | null): PrioriteDUnLitige {
  return motif && MOTIFS_URGENTS.includes(motif) ? 'haute' : 'moyenne';
}

// --- Les signalements -------------------------------------------------------------

export const ETATS_D_UN_SIGNALEMENT = [
  { cle: 'ouvert', titre: 'Nouveaux' },
  { cle: 'en_cours', titre: 'En cours' },
  { cle: 'traite', titre: 'Traités' },
] as const;

export type EtatDUnSignalement = (typeof ETATS_D_UN_SIGNALEMENT)[number]['cle'];

/** Un signalement avance, il ne revient pas en arrière. */
export function transitionDeSignalementPermise(
  depuis: EtatDUnSignalement,
  vers: EtatDUnSignalement,
): boolean {
  const ordre: EtatDUnSignalement[] = ['ouvert', 'en_cours', 'traite'];
  return ordre.indexOf(vers) > ordre.indexOf(depuis);
}

// --- Les statistiques ---------------------------------------------------------------

export const PERIODES_DE_STATISTIQUES = [
  { cle: '7j', titre: '7 jours', jours: 7 },
  { cle: '30j', titre: '30 jours', jours: 30 },
  { cle: '3m', titre: '3 mois', jours: 91 },
  { cle: '1a', titre: '1 an', jours: 365 },
] as const;

export type PeriodeDeStatistiques =
  (typeof PERIODES_DE_STATISTIQUES)[number]['cle'];

/** L'évolution par rapport à la période précédente, en pour cent ; rien à comparer sans base. */
export function variation(actuel: number, precedent: number): number | null {
  if (precedent <= 0) return null;
  return Math.round(((actuel - precedent) / precedent) * 100);
}

/** La part des gardes acceptées qui sont allées à leur terme. */
export function tauxDeFinalisation(
  terminees: number,
  interrompues: number,
): number | null {
  const total = terminees + interrompues;
  return total > 0 ? Math.round((terminees / total) * 100) : null;
}
