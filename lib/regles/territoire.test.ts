import { describe, expect, test } from 'vitest';

import { codePostalHorsDeBruxelles, estDansLaZoneCouverte } from './territoire';

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

describe('le code postal, contrôle de secours de la zone', () => {
  test('une adresse avec un code postal hors de Bruxelles est hors zone', () => {
    expect(codePostalHorsDeBruxelles('Grand-Place 1, 7000 Mons')).toBe(true);
    expect(codePostalHorsDeBruxelles('Rue de Namur 12, 1300 Wavre')).toBe(true);
  });

  test('une adresse bruxelloise passe', () => {
    expect(codePostalHorsDeBruxelles('Rue de la Victoire 96, 1060 Saint-Gilles')).toBe(false);
    expect(codePostalHorsDeBruxelles('Avenue Louise 1, 1050 Ixelles')).toBe(false);
  });

  test('une adresse sans code postal n’est pas refusée', () => {
    expect(codePostalHorsDeBruxelles('Rue Malibran 20')).toBe(false);
  });

  test('un numéro de rue à quatre chiffres ne fait pas refuser une adresse bruxelloise', () => {
    expect(codePostalHorsDeBruxelles('Chaussée de Waterloo 1151, 1180 Uccle')).toBe(false);
  });
});
