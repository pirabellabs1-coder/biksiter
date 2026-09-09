import { describe, expect, test } from 'vitest';

import {
  BIKE_SITTERS_POUR_OUVRIR,
  bikeSittersManquants,
  maturiteDUnQuartier,
} from './ouverture';

describe('un quartier ouvre quand il compte assez de bike sitters', () => {
  test('le seuil est atteint, le quartier est prêt', () => {
    expect(maturiteDUnQuartier(BIKE_SITTERS_POUR_OUVRIR)).toBe('pret');
    expect(maturiteDUnQuartier(BIKE_SITTERS_POUR_OUVRIR + 10)).toBe('pret');
  });

  test('juste en dessous, il n’est pas prêt', () => {
    // Ouvrir ici reviendrait à promettre une place qui n'existe pas.
    expect(maturiteDUnQuartier(BIKE_SITTERS_POUR_OUVRIR - 1)).toBe('bientot');
  });

  test('un quartier presque prêt se distingue d’un quartier vide', () => {
    expect(maturiteDUnQuartier(3)).toBe('bientot');
    expect(maturiteDUnQuartier(2)).toBe('trop-tot');
    expect(maturiteDUnQuartier(0)).toBe('trop-tot');
  });
});

describe('ce qui manque se compte, mais ne se dit qu’à l’administration', () => {
  test('il ne manque rien à un quartier déjà prêt', () => {
    expect(bikeSittersManquants(BIKE_SITTERS_POUR_OUVRIR)).toBe(0);
    expect(bikeSittersManquants(BIKE_SITTERS_POUR_OUVRIR + 4)).toBe(0);
  });

  test('le compte qui manque n’est jamais négatif', () => {
    // Sinon un quartier très fourni afficherait « il manque −4 personnes ».
    expect(bikeSittersManquants(50)).toBe(0);
  });

  test('un quartier vide a tout le seuil à combler', () => {
    expect(bikeSittersManquants(0)).toBe(BIKE_SITTERS_POUR_OUVRIR);
  });
});
