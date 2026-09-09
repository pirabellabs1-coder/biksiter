import { describe, expect, test } from 'vitest';

import { LONGUEUR_MAXIMALE_DE_LAVIS, refusDeLAvis } from './avis';

const bon = {
  corps: 'Accueil simple, le garage est exactement comme sur les photos.',
  etatDeLaGarde: 'termine',
  estLeCycliste: true,
  dejaEcrit: false,
};

describe('un avis s’écrit après avoir laissé son vélo, pas avant', () => {
  test('un avis ordinaire après une garde terminée passe', () => {
    expect(refusDeLAvis(bon)).toBeNull();
  });

  test('on n’écrit pas pendant la garde', () => {
    // Un avis écrit pendant la garde pèserait sur la personne qui héberge.
    expect(refusDeLAvis({ ...bon, etatDeLaGarde: 'en_cours' })).toBe(
      'garde_non_terminee',
    );
  });

  test('le bike sitter n’écrit pas d’avis sur son propre emplacement', () => {
    expect(refusDeLAvis({ ...bon, estLeCycliste: false })).toBe(
      'pas_le_cycliste',
    );
  });

  test('un avis par garde, pas deux', () => {
    expect(refusDeLAvis({ ...bon, dejaEcrit: true })).toBe('deja_ecrit');
  });

  test('le fait de ne pas être le cycliste passe avant tout le reste', () => {
    expect(
      refusDeLAvis({
        ...bon,
        estLeCycliste: false,
        etatDeLaGarde: 'en_cours',
        corps: '',
      }),
    ).toBe('pas_le_cycliste');
  });
});

describe('ce qu’on refuse d’enregistrer comme avis', () => {
  test('un avis vide n’est pas un avis', () => {
    expect(refusDeLAvis({ ...bon, corps: '   ' })).toBe('vide');
  });

  test('un avis trop long est refusé', () => {
    expect(
      refusDeLAvis({ ...bon, corps: 'a'.repeat(LONGUEUR_MAXIMALE_DE_LAVIS) }),
    ).toBeNull();
    expect(
      refusDeLAvis({ ...bon, corps: 'a'.repeat(LONGUEUR_MAXIMALE_DE_LAVIS + 1) }),
    ).toBe('trop_long');
  });
});
