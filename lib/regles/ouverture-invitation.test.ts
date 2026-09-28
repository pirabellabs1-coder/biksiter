import { describe, expect, test } from 'vitest';

import {
  BIKE_SITTERS_POUR_OUVRIR,
  avancementDeLOuverture,
} from './ouverture';

describe('l’avancement vers l’ouverture d’un quartier', () => {
  test('l’avancement se lit en pour cent du seuil d’ouverture', () => {
    expect(avancementDeLOuverture(BIKE_SITTERS_POUR_OUVRIR)).toBe(100);
  });

  test('un réseau vide affiche zéro', () => {
    expect(avancementDeLOuverture(0)).toBe(0);
  });

  test('l’avancement ne dépasse jamais cent pour cent', () => {
    expect(avancementDeLOuverture(BIKE_SITTERS_POUR_OUVRIR * 4)).toBe(100);
  });

  test('la moitié du seuil affiche cinquante pour cent', () => {
    expect(avancementDeLOuverture(BIKE_SITTERS_POUR_OUVRIR / 2)).toBe(50);
  });
});
