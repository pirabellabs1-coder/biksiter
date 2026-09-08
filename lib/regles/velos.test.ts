import { describe, expect, test } from 'vitest';

import { TYPES_VELO, estUnTypeVelo } from './velos';

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
