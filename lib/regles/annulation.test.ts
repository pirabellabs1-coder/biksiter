import { describe, expect, test } from 'vitest';

import {
  SEUIL_DESISTEMENT_TARDIF_HEURES,
  estUnDesistementTardif,
} from './annulation';

const depot = new Date('2026-09-08T09:00:00Z');

function heuresAvantLeDepot(nombre: number): Date {
  return new Date(depot.getTime() - nombre * 60 * 60 * 1000);
}

describe('un désistement est tardif à moins de deux heures du dépôt', () => {
  test('le seuil de référence est de deux heures', () => {
    expect(SEUIL_DESISTEMENT_TARDIF_HEURES).toBe(2);
  });

  test('une annulation la veille n’est pas un désistement tardif', () => {
    expect(estUnDesistementTardif(depot, heuresAvantLeDepot(20))).toBe(false);
  });

  test('une annulation deux heures avant n’est pas encore tardive', () => {
    expect(estUnDesistementTardif(depot, heuresAvantLeDepot(2))).toBe(false);
  });

  test('une annulation une heure avant est un désistement tardif', () => {
    expect(estUnDesistementTardif(depot, heuresAvantLeDepot(1))).toBe(true);
  });

  test('une annulation après l’heure du dépôt est un désistement tardif', () => {
    expect(
      estUnDesistementTardif(depot, new Date('2026-09-08T10:00:00Z')),
    ).toBe(true);
  });
});
