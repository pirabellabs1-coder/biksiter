import { describe, expect, test } from 'vitest';

import { creneauParDefaut } from './recherche-courante';

/** Un instant à Bruxelles (heure d'été, UTC+2), le 28 septembre 2026. */
const aBruxelles = (heure: string) => new Date(`2026-09-28T${heure}:00+02:00`);

describe('le créneau proposé par défaut', () => {
  test('en pleine nuit, la recherche propose le matin même', () => {
    expect(creneauParDefaut(aBruxelles('00:30'))).toEqual({
      jourDepot: '2026-09-28',
      heureDepot: '09:00',
      jourReprise: '2026-09-28',
      heureReprise: '12:00',
    });
  });

  test('en journée, la recherche propose la prochaine heure pleine, pour trois heures', () => {
    expect(creneauParDefaut(aBruxelles('10:10'))).toEqual({
      jourDepot: '2026-09-28',
      heureDepot: '11:00',
      jourReprise: '2026-09-28',
      heureReprise: '14:00',
    });
  });

  test('tard le soir, la recherche propose le lendemain matin', () => {
    expect(creneauParDefaut(aBruxelles('20:00'))).toEqual({
      jourDepot: '2026-09-29',
      heureDepot: '09:00',
      jourReprise: '2026-09-29',
      heureReprise: '12:00',
    });
  });
});
