import { describe, expect, test } from 'vitest';

import { alerteConcernee, type AlerteAPrevenir } from './alertes';

// Deux points de Bruxelles à distance connue de la Bourse.
const bourse = { latitude: 50.8484, longitude: 4.3499 };
const saintGilles = { latitude: 50.8278, longitude: 4.3452 }; // environ 2,3 km
const uccle = { latitude: 50.7916, longitude: 4.3531 }; // environ 6,3 km

const alerte: AlerteAPrevenir = {
  ...bourse,
  membreId: 'cycliste',
  jour: null,
  prevenueLe: null,
};
const lieu = (point: typeof bourse) => ({ ...point, bikeSitterId: 'bike-sitter' });

describe('une alerte de recherche prévient d’une ouverture proche', () => {
  test('un lieu qui ouvre à moins de trois kilomètres déclenche l’alerte', () => {
    expect(alerteConcernee(alerte, lieu(saintGilles), '2026-09-14')).toBe(true);
  });

  test('un lieu trop loin ne la déclenche pas', () => {
    expect(alerteConcernee(alerte, lieu(uccle), '2026-09-14')).toBe(false);
  });

  test('une alerte ne prévient qu’une fois', () => {
    expect(
      alerteConcernee({ ...alerte, prevenueLe: new Date() }, lieu(saintGilles), '2026-09-14'),
    ).toBe(false);
  });

  test('une alerte pour un jour passé ne sonne plus', () => {
    expect(
      alerteConcernee({ ...alerte, jour: '2026-09-10' }, lieu(saintGilles), '2026-09-14'),
    ).toBe(false);
    expect(
      alerteConcernee({ ...alerte, jour: '2026-09-14' }, lieu(saintGilles), '2026-09-14'),
    ).toBe(true);
  });

  test('on n’est pas prévenu de l’ouverture de son propre lieu', () => {
    expect(
      alerteConcernee({ ...alerte, membreId: 'bike-sitter' }, lieu(saintGilles), '2026-09-14'),
    ).toBe(false);
  });
});
