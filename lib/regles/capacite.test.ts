import { describe, expect, test } from 'vitest';

import {
  MARGE_ENTRE_STATIONNEMENTS_MINUTES,
  laPlaceEstLibre,
  seChevauchent,
  type Creneau,
} from './capacite';

function creneau(debut: string, fin: string): Creneau {
  return { debut: new Date(debut), fin: new Date(fin) };
}

const matin = creneau('2026-09-08T09:00:00Z', '2026-09-08T12:00:00Z');

describe('trente minutes séparent deux stationnements', () => {
  test('la marge de référence est de trente minutes', () => {
    expect(MARGE_ENTRE_STATIONNEMENTS_MINUTES).toBe(30);
  });

  test('un stationnement qui commence quinze minutes après le précédent est refusé', () => {
    expect(
      seChevauchent(matin, creneau('2026-09-08T12:15:00Z', '2026-09-08T14:00:00Z')),
    ).toBe(true);
  });

  test('un stationnement qui commence trente minutes après le précédent est accepté', () => {
    expect(
      seChevauchent(matin, creneau('2026-09-08T12:30:00Z', '2026-09-08T14:00:00Z')),
    ).toBe(false);
  });

  test('la marge vaut aussi avant le stationnement existant', () => {
    expect(
      seChevauchent(matin, creneau('2026-09-08T07:00:00Z', '2026-09-08T08:45:00Z')),
    ).toBe(true);
  });

  test('deux créneaux franchement séparés ne se chevauchent pas', () => {
    expect(
      seChevauchent(matin, creneau('2026-09-09T09:00:00Z', '2026-09-09T12:00:00Z')),
    ).toBe(false);
  });
});

describe('un emplacement accueille autant de vélos que sa capacité', () => {
  test('un emplacement d’un vélo déjà occupé n’est plus libre', () => {
    expect(
      laPlaceEstLibre(
        creneau('2026-09-08T10:00:00Z', '2026-09-08T11:00:00Z'),
        [matin],
        1,
      ),
    ).toBe(false);
  });

  test('un emplacement de deux vélos reste libre avec un seul stationnement', () => {
    expect(
      laPlaceEstLibre(
        creneau('2026-09-08T10:00:00Z', '2026-09-08T11:00:00Z'),
        [matin],
        2,
      ),
    ).toBe(true);
  });

  test('un emplacement sans stationnement accepté est libre', () => {
    expect(laPlaceEstLibre(matin, [], 1)).toBe(true);
  });
});
