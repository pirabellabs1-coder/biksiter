import { describe, expect, test } from 'vitest';

import { decisionDeFavori, FAVORIS_PAR_MEMBRE } from './favoris';

describe('les favoris', () => {
  test('un lieu déjà en favori se retire d’un geste', () => {
    expect(decisionDeFavori(true, 3)).toBe('retirer');
  });

  test('un lieu s’ajoute tant que la liste n’est pas pleine', () => {
    expect(decisionDeFavori(false, FAVORIS_PAR_MEMBRE - 1)).toBe('ajouter');
  });

  test('au-delà de cinquante favoris, on n’en ajoute plus', () => {
    expect(decisionDeFavori(false, FAVORIS_PAR_MEMBRE)).toBe('complet');
  });

  test('retirer reste possible même quand la liste est pleine', () => {
    expect(decisionDeFavori(true, FAVORIS_PAR_MEMBRE)).toBe('retirer');
  });
});
