import { describe, expect, test } from 'vitest';

import { estDansLaZoneCouverte } from './territoire';

describe('le réseau ne couvre que la région bruxelloise', () => {
  test('une adresse à Ixelles est dans la zone couverte', () => {
    expect(estDansLaZoneCouverte({ latitude: 50.829, longitude: 4.3723 })).toBe(
      true,
    );
  });

  test('une adresse à Schaerbeek est dans la zone couverte', () => {
    expect(estDansLaZoneCouverte({ latitude: 50.8676, longitude: 4.3736 })).toBe(
      true,
    );
  });

  test('une adresse à Anvers est hors de la zone couverte', () => {
    expect(estDansLaZoneCouverte({ latitude: 51.2194, longitude: 4.4025 })).toBe(
      false,
    );
  });

  test('une adresse à Namur est hors de la zone couverte', () => {
    expect(estDansLaZoneCouverte({ latitude: 50.4674, longitude: 4.8718 })).toBe(
      false,
    );
  });

  test('une commune limitrophe reste acceptée : la frontière régionale ne se voit pas depuis la rue', () => {
    // Kraainem, juste à l'est de la Région.
    expect(estDansLaZoneCouverte({ latitude: 50.8544, longitude: 4.4608 })).toBe(
      true,
    );
  });
});
