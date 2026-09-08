import { describe, expect, test } from 'vitest';

import {
  SEUIL_DESISTEMENT_TARDIF_HEURES,
  estUnDesistementTardif,
} from './annulation';

const depot = new Date('2026-09-08T09:00:00Z');

function heuresAvantLeDepot(nombre: number): Date {
  return new Date(depot.getTime() - nombre * 60 * 60 * 1000);
}

describe('un désistement est tardif à moins de douze heures du dépôt', () => {
  test('le seuil de référence est de douze heures', () => {
    expect(SEUIL_DESISTEMENT_TARDIF_HEURES).toBe(12);
  });

  test('une annulation deux jours avant n’est pas un désistement tardif', () => {
    expect(estUnDesistementTardif(depot, heuresAvantLeDepot(48))).toBe(false);
  });

  test('une annulation douze heures avant n’est pas encore tardive', () => {
    expect(estUnDesistementTardif(depot, heuresAvantLeDepot(12))).toBe(false);
  });

  test('une annulation trois heures avant est un désistement tardif', () => {
    expect(estUnDesistementTardif(depot, heuresAvantLeDepot(3))).toBe(true);
  });

  test('une annulation après l’heure du dépôt est un désistement tardif', () => {
    expect(estUnDesistementTardif(depot, new Date('2026-09-08T10:00:00Z'))).toBe(true);
  });
});
