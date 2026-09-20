import { describe, expect, test } from 'vitest';

import { placerLesZones } from './projection';

describe('la carte figurée des zones', () => {
  test('une zone seule se place au centre', () => {
    expect(placerLesZones([{ latitude: 50.83, longitude: 4.37 }])).toEqual([
      { gauche: 50, haut: 50 },
    ]);
  });

  test('le nord est en haut et l’est à droite', () => {
    const [nordOuest, sudEst] = placerLesZones([
      { latitude: 50.86, longitude: 4.33 },
      { latitude: 50.82, longitude: 4.4 },
    ]);
    expect(nordOuest!.haut).toBeLessThan(sudEst!.haut);
    expect(nordOuest!.gauche).toBeLessThan(sudEst!.gauche);
  });

  test('aucune zone ne touche le bord de la carte', () => {
    const placees = placerLesZones([
      { latitude: 50.8, longitude: 4.3 },
      { latitude: 50.9, longitude: 4.45 },
      { latitude: 50.85, longitude: 4.38 },
    ]);
    for (const zone of placees) {
      expect(zone.gauche).toBeGreaterThanOrEqual(16);
      expect(zone.gauche).toBeLessThanOrEqual(84);
      expect(zone.haut).toBeGreaterThanOrEqual(16);
      expect(zone.haut).toBeLessThanOrEqual(84);
    }
  });

  test('sans zone, il n’y a rien à placer', () => {
    expect(placerLesZones([])).toEqual([]);
  });
});
