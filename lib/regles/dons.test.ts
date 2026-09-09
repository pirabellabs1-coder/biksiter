import { describe, expect, test } from 'vitest';

import {
  communicationStructuree,
  communicationValide,
  lesDonsSontOuverts,
} from './dons';

describe('la communication structurée permet de rapprocher un virement', () => {
  test('elle prend la forme belge que toutes les banques savent lire', () => {
    expect(communicationStructuree(1)).toMatch(
      /^\+\+\+[0-9]{3}\/[0-9]{4}\/[0-9]{5}\+\+\+$/,
    );
  });

  test('les deux derniers chiffres sont le reste de la division par 97', () => {
    // 0000000001 modulo 97 vaut 1.
    expect(communicationStructuree(1)).toBe('+++000/0000/00101+++');
    // 0000000097 modulo 97 vaut 0, remplacé par 97.
    expect(communicationStructuree(97)).toBe('+++000/0000/09797+++');
  });

  test('une communication produite ici est reconnue valide', () => {
    for (const numero of [0, 1, 42, 97, 1234, 9_999_999_999]) {
      expect(communicationValide(communicationStructuree(numero))).toBe(true);
    }
  });

  test('un chiffre de contrôle faux est rejeté', () => {
    expect(communicationValide('+++000/0000/00102+++')).toBe(false);
  });

  test('une communication mal formée est rejetée', () => {
    expect(communicationValide('000/0000/00101')).toBe(false);
    expect(communicationValide('+++0000/000/00101+++')).toBe(false);
    expect(communicationValide('')).toBe(false);
  });

  test('un numéro qui ne tient pas sur dix chiffres est refusé', () => {
    expect(() => communicationStructuree(10_000_000_000)).toThrow();
    expect(() => communicationStructuree(-1)).toThrow();
  });
});

describe('un don suppose un compte pour le recevoir', () => {
  test('les dons restent fermés tant que l’association n’a pas d’IBAN', () => {
    expect(lesDonsSontOuverts({ iban: null })).toBe(false);
  });

  test('un compte renseigné rouvre les dons', () => {
    expect(lesDonsSontOuverts({ iban: 'BE68 5390 0754 7034' })).toBe(true);
  });
});
