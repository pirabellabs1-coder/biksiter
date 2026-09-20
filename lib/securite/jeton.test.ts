import { describe, expect, test } from 'vitest';

import { nouveauCodeDeRemise } from './jeton';

describe('règle 5 — le code de remise', () => {
  test('un code de remise compte six chiffres, zéros de tête compris', () => {
    for (let essai = 0; essai < 200; essai += 1) {
      expect(nouveauCodeDeRemise()).toMatch(/^[0-9]{6}$/);
    }
  });
});
