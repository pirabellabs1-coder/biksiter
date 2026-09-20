import { describe, expect, test } from 'vitest';

import { trouverUnLieu } from './lieux';

describe('la recherche d’un lieu', () => {
  test('un lieu se trouve sans accent ni majuscule', () => {
    expect(trouverUnLieu('place flagey')?.nom).toBe('Place Flagey');
    expect(trouverUnLieu('SAINT GILLES')?.nom).toBe('Saint-Gilles');
  });

  test('le début d’un nom suffit', () => {
    expect(trouverUnLieu('Schaer')?.nom).toBe('Schaerbeek');
  });

  test('un texte trop court ou inconnu ne désigne aucun lieu', () => {
    expect(trouverUnLieu('x')).toBeNull();
    expect(trouverUnLieu('Paris Montparnasse')).toBeNull();
  });
});
