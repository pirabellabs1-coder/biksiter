import { describe, expect, test } from 'vitest';

import { TYPES_VELO, estUnTypeVelo, typeVeloDansUnePhrase } from './velos';

describe('les types de vélo forment une liste fermée', () => {
  test('la liste compte exactement douze types de vélo', () => {
    expect(TYPES_VELO).toHaveLength(12);
  });

  test('le cargo et le longtail sont deux types distincts', () => {
    expect(estUnTypeVelo('Cargo')).toBe(true);
    expect(estUnTypeVelo('Longtail')).toBe(true);
  });

  test('un type absent de la liste est refusé', () => {
    expect(estUnTypeVelo('Trottinette')).toBe(false);
    expect(estUnTypeVelo('velo')).toBe(false);
  });
});

describe('un type de vélo s’écrit au fil du texte sans perdre ses sigles', () => {
  test('un nom commun passe en minuscules', () => {
    expect(typeVeloDansUnePhrase('Ville')).toBe('ville');
    expect(typeVeloDansUnePhrase('Avec remorque')).toBe('avec remorque');
  });

  test('un sigle garde ses capitales', () => {
    // « vtt déposé à Flagey » ne se lit pas : ce sont des initiales.
    expect(typeVeloDansUnePhrase('VTT')).toBe('VTT');
    expect(typeVeloDansUnePhrase('VTC')).toBe('VTC');
  });
});
