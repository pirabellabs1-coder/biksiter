import { describe, expect, test } from 'vitest';

import { POINTS_PAR_GARDE } from './maillons';
import {
  euros,
  indexDeLaTranche,
  plafondPourLaDuree,
  POINTS_PAR_GARDE_GRATUITE,
  tarifPourLaDuree,
  trancheOuverteEnBeta,
  TRANCHES_DE_TARIF,
} from './tarifs';

describe('le tarif d’une garde', () => {
  test('une garde sans barème est gratuite', () => {
    expect(tarifPourLaDuree(null, 3)).toBe(0);
  });

  test('la borne d’une tranche appartient à cette tranche', () => {
    expect(indexDeLaTranche(2)).toBe(0);
    expect(indexDeLaTranche(2.25)).toBe(1);
  });

  test('une garde d’une durée inférieure à une heure compte comme une heure', () => {
    expect(indexDeLaTranche(0.25)).toBe(0);
  });

  test('un tarif ne dépasse jamais le plafond du réseau', () => {
    expect(tarifPourLaDuree([900, 900, 900, 900], 2)).toBe(
      TRANCHES_DE_TARIF[0].plafond,
    );
  });

  test('un tarif en dessous du plafond est demandé tel quel', () => {
    expect(tarifPourLaDuree([200, 400, 600, 800], 4)).toBe(400);
  });

  test('au-delà de vingt-quatre heures, aucun tarif n’est décidé', () => {
    expect(indexDeLaTranche(30)).toBe(-1);
    expect(plafondPourLaDuree(30)).toBeNull();
    expect(tarifPourLaDuree([200, 400, 600, 800], 30)).toBeNull();
  });

  test('un montant rond s’écrit sans décimale', () => {
    expect(euros(300)).toBe('3 €');
  });

  test('un montant à centimes s’écrit avec une virgule', () => {
    expect(euros(250)).toBe('2,50 €');
  });
});

describe('les tranches pendant la bêta', () => {
  test('les deux premières tranches sont ouvertes pendant la bêta', () => {
    expect(trancheOuverteEnBeta(0)).toBe(true);
    expect(trancheOuverteEnBeta(1)).toBe(true);
  });

  test('une tranche qui commence après cinq heures reste fermée pendant la bêta', () => {
    expect(trancheOuverteEnBeta(2)).toBe(false);
    expect(trancheOuverteEnBeta(3)).toBe(false);
  });

  test('une garde gratuite menée à son terme rapporte plus qu’une garde payante', () => {
    expect(POINTS_PAR_GARDE_GRATUITE).toBeGreaterThan(POINTS_PAR_GARDE);
  });
});
