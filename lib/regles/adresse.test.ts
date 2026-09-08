import { describe, expect, test } from 'vitest';

import {
  RAYON_MINIMAL_DE_ZONE_METRES,
  adressePourLeCycliste,
  ficheVisible,
  zoneAssezFloue,
  type Emplacement,
} from './adresse';

const emplacement: Emplacement = {
  reference: 'bxl-flagey-1',
  prenomDuBikeSitter: 'Manoelle',
  quartier: 'Place Flagey',
  rayonDeLaZone: 400,
  adresseExacte: 'rue Malibran 12, 1050 Ixelles',
};

describe('règle 4 — l’adresse exacte n’existe qu’après acceptation', () => {
  test('la fiche visible ne contient pas l’adresse exacte', () => {
    const fiche = ficheVisible(emplacement);
    expect(Object.keys(fiche)).not.toContain('adresseExacte');
    expect(JSON.stringify(fiche)).not.toContain('Malibran');
  });

  test('une demande en attente ne donne pas l’adresse', () => {
    expect(adressePourLeCycliste(emplacement, 'demande')).toBeNull();
  });

  test('une demande acceptée donne l’adresse', () => {
    expect(adressePourLeCycliste(emplacement, 'accepte')).toBe(
      'rue Malibran 12, 1050 Ixelles',
    );
  });

  test('un refus ou une annulation reprend l’adresse', () => {
    expect(adressePourLeCycliste(emplacement, 'refuse')).toBeNull();
    expect(adressePourLeCycliste(emplacement, 'annule')).toBeNull();
  });
});

describe('la zone affichée reste assez floue pour ne pas désigner une maison', () => {
  test('le rayon minimal d’une zone est de 250 mètres', () => {
    expect(RAYON_MINIMAL_DE_ZONE_METRES).toBe(250);
  });

  test('une zone de 50 mètres est refusée', () => {
    expect(zoneAssezFloue(50)).toBe(false);
  });

  test('une zone de 400 mètres est acceptée', () => {
    expect(zoneAssezFloue(400)).toBe(true);
  });
});
