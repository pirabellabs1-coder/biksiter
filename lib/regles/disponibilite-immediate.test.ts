import { describe, expect, test } from 'vitest';

import {
  DUREE_DE_LA_DISPONIBILITE_IMMEDIATE_MINUTES,
  disponibiliteImmediateOuverte,
  finDeLaDisponibiliteImmediate,
  ouvertureImmediate,
  passeEnTeteDesResultats,
} from './disponibilite-immediate';

const MAINTENANT = new Date('2026-09-26T09:00:00Z');
const minutes = (n: number) => new Date(MAINTENANT.getTime() + n * 60_000);

describe('la disponibilité immédiate', () => {
  test('une disponibilité immédiate s’éteint seule au bout d’une heure', () => {
    expect(DUREE_DE_LA_DISPONIBILITE_IMMEDIATE_MINUTES).toBe(60);
    expect(finDeLaDisponibiliteImmediate(MAINTENANT)).toEqual(minutes(60));
  });

  test('une disponibilité échue n’est plus ouverte', () => {
    expect(disponibiliteImmediateOuverte(minutes(-1), MAINTENANT)).toBe(false);
    expect(disponibiliteImmediateOuverte(null, MAINTENANT)).toBe(false);
    expect(disponibiliteImmediateOuverte(minutes(30), MAINTENANT)).toBe(true);
  });

  test('le bike sitter disponible passe en tête pour une garde qui commence dans l’heure', () => {
    expect(passeEnTeteDesResultats(minutes(60), minutes(20), MAINTENANT)).toBe(true);
  });

  test('être disponible maintenant ne fait pas passer en tête pour une garde plus lointaine', () => {
    expect(passeEnTeteDesResultats(minutes(60), minutes(180), MAINTENANT)).toBe(false);
  });

  test('sans disponibilité ouverte, personne ne passe en tête', () => {
    expect(passeEnTeteDesResultats(null, minutes(10), MAINTENANT)).toBe(false);
    expect(passeEnTeteDesResultats(minutes(-5), minutes(10), MAINTENANT)).toBe(false);
  });
});

describe('quand on peut se dire disponible tout de suite', () => {
  // Un lieu ouvert tous les jours de 8 h à 21 h.
  const lieu = {
    jours: [0, 1, 2, 3, 4, 5, 6],
    ouverture: '08:00',
    fermeture: '21:00',
    parJour: {},
    fermetures: [],
  };
  // Heures de Bruxelles, en été (UTC + 2).
  const a = (heure: string) => new Date(`2026-09-28T${heure}:00+02:00`);

  test('on ne se dit pas disponible en pleine nuit, hors de ses horaires', () => {
    expect(ouvertureImmediate([lieu], a('02:34'))).toEqual({
      possible: false,
      des: '08:00',
    });
  });

  test('pendant ses horaires d’accueil, on peut se dire disponible', () => {
    expect(ouvertureImmediate([lieu], a('10:15'))).toEqual({ possible: true });
  });

  test('après la fermeture, plus rien à proposer ce jour-là', () => {
    expect(ouvertureImmediate([lieu], a('21:30'))).toEqual({
      possible: false,
      des: null,
    });
  });

  test('un lieu ouvert la nuit ne rend pas possible un dépôt avant 6 h', () => {
    const nuit = { ...lieu, ouverture: '00:00', fermeture: '23:45' };
    expect(ouvertureImmediate([nuit], a('03:00'))).toEqual({
      possible: false,
      des: '06:00',
    });
  });

  test('sans emplacement publié, on ne peut pas se dire disponible', () => {
    expect(ouvertureImmediate([], a('10:15'))).toEqual({
      possible: false,
      des: null,
    });
  });

  test('il suffit qu’un de ses emplacements accueille à cette heure', () => {
    const soir = { ...lieu, ouverture: '18:00', fermeture: '21:00' };
    const matin = { ...lieu, ouverture: '08:00', fermeture: '12:00' };
    expect(ouvertureImmediate([soir, matin], a('10:15'))).toEqual({
      possible: true,
    });
    expect(ouvertureImmediate([soir, matin], a('14:00'))).toEqual({
      possible: false,
      des: '18:00',
    });
  });

  test('l’heure d’hiver est celle de Bruxelles, pas celle du serveur', () => {
    // 7 h 30 UTC en décembre = 8 h 30 à Bruxelles (UTC + 1).
    expect(
      ouvertureImmediate([lieu], new Date('2026-12-07T07:30:00Z')),
    ).toEqual({ possible: true });
    // 6 h 30 UTC = 7 h 30 à Bruxelles : le lieu ouvre à 8 h.
    expect(
      ouvertureImmediate([lieu], new Date('2026-12-07T06:30:00Z')),
    ).toEqual({ possible: false, des: '08:00' });
  });

  test('un jour de fermeture exceptionnelle, on n’est pas disponible', () => {
    const ferme = { ...lieu, fermetures: ['2026-09-28'] };
    expect(ouvertureImmediate([ferme], a('10:15'))).toEqual({
      possible: false,
      des: null,
    });
  });
});
