import { describe, expect, test } from 'vitest';

import { creneauCourt } from './temps';

// 27 septembre 2026, 9 h à Bruxelles (UTC+2).
const MAINTENANT = new Date('2026-09-27T07:00:00Z');

describe('le créneau court d’une carte', () => {
  test('une garde du jour se lit « Aujourd’hui »', () => {
    expect(
      creneauCourt(new Date('2026-09-27T12:00:00Z'), new Date('2026-09-27T15:00:00Z'), MAINTENANT),
    ).toBe('Aujourd’hui · 14:00 – 17:00');
  });

  test('une garde du lendemain se lit « Demain »', () => {
    expect(
      creneauCourt(new Date('2026-09-28T08:00:00Z'), new Date('2026-09-28T11:00:00Z'), MAINTENANT),
    ).toBe('Demain · 10:00 – 13:00');
  });

  test('le jour se compte à l’heure de Bruxelles, pas en temps universel', () => {
    // 23 h 30 à Bruxelles le 27 : encore « aujourd’hui », bien que ce soit
    // déjà le 27 à 21 h 30 UTC.
    expect(
      creneauCourt(new Date('2026-09-27T21:30:00Z'), new Date('2026-09-27T21:45:00Z'), MAINTENANT),
    ).toMatch(/^Aujourd’hui/);
  });

  test('une garde plus lointaine donne le jour et la date abrégés', () => {
    expect(
      creneauCourt(new Date('2026-10-05T08:00:00Z'), new Date('2026-10-05T11:00:00Z'), MAINTENANT),
    ).toMatch(/^lun\. 5 oct\. · 10:00 – 13:00$/);
  });
});
