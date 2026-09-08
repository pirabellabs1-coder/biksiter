import { describe, expect, test } from 'vitest';

import {
  EMPLACEMENTS_PAR_MEMBRE,
  ETATS_QUI_RETIENNENT,
  TYPES_EMPLACEMENT_PRIVE,
  decisionDeRetrait,
  estUnTypeEmplacementPrive,
  peutAjouterUnEmplacement,
  peutEtreMisEnPause,
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

describe('retirer un emplacement', () => {
  test('un emplacement sans stationnement en cours se retire', () => {
    expect(decisionDeRetrait(0)).toEqual({ retirable: true });
  });

  test('un emplacement qui garde un vélo ne se retire pas', () => {
    expect(decisionDeRetrait(1)).toEqual({
      retirable: false,
      motif: 'stationnements_en_cours',
      combien: 1,
    });
  });

  test('une demande en attente retient aussi : on y répond avant de partir', () => {
    expect(decisionDeRetrait(3).retirable).toBe(false);
  });

  test('les trois états qui retiennent sont la demande, l’acceptation et la garde', () => {
    expect(ETATS_QUI_RETIENNENT).toEqual(['demande', 'accepte', 'en_cours']);
  });

  test('mettre en pause reste possible en toutes circonstances', () => {
    expect(peutEtreMisEnPause()).toBe(true);
  });
});
