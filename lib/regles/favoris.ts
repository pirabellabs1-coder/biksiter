/**
 * Les favoris d'un cycliste.
 *
 * Une liste privée, pour retrouver les lieux où l'on a ses habitudes. Elle
 * reste courte : au-delà, ce n'est plus une liste de favoris mais un annuaire.
 */

export const FAVORIS_PAR_MEMBRE = 50;

export type DecisionDeFavori = 'ajouter' | 'retirer' | 'complet';

export function decisionDeFavori(
  dejaEnFavori: boolean,
  nombreDeFavoris: number,
): DecisionDeFavori {
  if (dejaEnFavori) return 'retirer';
  return nombreDeFavoris >= FAVORIS_PAR_MEMBRE ? 'complet' : 'ajouter';
}
