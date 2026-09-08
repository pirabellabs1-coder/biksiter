import { describe, expect, test } from 'vitest';

import {
  ACCES,
  ANCRAGES,
  INTEMPERIES,
  SERVICES,
  VERROUILLAGES,
  estUnAcces,
  estUnAncrage,
  estUnService,
  estUnVerrouillage,
  estUneIntemperie,
} from './caracteristiques';

describe('les caractéristiques d’un emplacement sont des listes fermées', () => {
  test('le verrouillage n’accepte que clé, code, autre ou aucun', () => {
    expect(Object.keys(VERROUILLAGES)).toEqual(['cle', 'code', 'autre', 'aucun']);
    expect(estUnVerrouillage('cle')).toBe(true);
    expect(estUnVerrouillage('cadenas')).toBe(false);
  });

  test('l’exposition aux intempéries n’accepte que quatre valeurs', () => {
    expect(Object.keys(INTEMPERIES)).toEqual([
      'interieur',
      'abri',
      'partiel',
      'dehors',
    ]);
    expect(estUneIntemperie('partiel')).toBe(true);
    expect(estUneIntemperie('couvert')).toBe(false);
  });

  test('l’accès compte huit possibilités', () => {
    expect(ACCES).toHaveLength(8);
    expect(estUnAcces('Plain-pied')).toBe(true);
    expect(estUnAcces('Monte-charge')).toBe(false);
  });

  test('l’ancrage compte cinq possibilités', () => {
    expect(ANCRAGES).toHaveLength(5);
    expect(estUnAncrage('Ancrage mural')).toBe(true);
    expect(estUnAncrage('Poteau')).toBe(false);
  });

  test('les services proposés sont au nombre de trois', () => {
    expect(SERVICES).toHaveLength(3);
    expect(estUnService('Recharge VAE')).toBe(true);
    expect(estUnService('Lavage du vélo')).toBe(false);
  });
});
