import { describe, expect, test } from 'vitest';

import {
  EMPLACEMENTS_PAR_MEMBRE,
  TYPES_EMPLACEMENT_PRIVE,
  estUnTypeEmplacementPrive,
  peutAjouterUnEmplacement,
} from './emplacements';

describe('règle 1 — l’espace privé', () => {
  test('la liste des types d’emplacement compte exactement quatorze entrées', () => {
    expect(TYPES_EMPLACEMENT_PRIVE).toHaveLength(14);
  });

  test('un local à vélos d’immeuble n’est pas un type d’emplacement publiable', () => {
    expect(estUnTypeEmplacementPrive('Local à vélos de l’immeuble')).toBe(false);
  });

  test('un espace partagé avec les autres résidents n’est pas publiable', () => {
    expect(estUnTypeEmplacementPrive('Cave commune')).toBe(false);
    expect(estUnTypeEmplacementPrive('Parking de la copropriété')).toBe(false);
    expect(estUnTypeEmplacementPrive('Hall d’entrée')).toBe(false);
  });

  test('un garage privé fermé est un type d’emplacement publiable', () => {
    expect(estUnTypeEmplacementPrive('Garage privé fermé')).toBe(true);
  });

  test('la liste est fermée : un type inventé est refusé', () => {
    expect(estUnTypeEmplacementPrive('Garage')).toBe(false);
  });
});

describe('un membre publie au maximum deux emplacements', () => {
  test('la valeur de référence est deux', () => {
    expect(EMPLACEMENTS_PAR_MEMBRE).toBe(2);
  });

  test('un membre sans emplacement peut en ajouter un', () => {
    expect(peutAjouterUnEmplacement(0)).toBe(true);
  });

  test('un membre qui en a déjà deux ne peut pas en ajouter un troisième', () => {
    expect(peutAjouterUnEmplacement(2)).toBe(false);
  });
});
