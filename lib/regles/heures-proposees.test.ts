import { describe, expect, test } from 'vitest';

import {
  avecLesHeuresChoisies,
  heuresDansLAccueil,
  plagesDAccueil,
} from './heures-proposees';

const JOURNEE = ['00:00', '06:00', '08:00', '12:30', '21:00', '21:15', '23:45'];

describe('les heures proposées dans une demande', () => {
  test('une demande ne propose que les heures où le bike sitter accueille', () => {
    expect(heuresDansLAccueil(JOURNEE, [{ de: '08:00', a: '21:00' }])).toEqual([
      '08:00',
      '12:30',
      '21:00',
    ]);
  });

  test('les horaires propres à un jour élargissent les heures proposées', () => {
    const plages = plagesDAccueil({
      ouverture: '08:00',
      fermeture: '12:30',
      parJour: { samedi: { de: '06:00', a: '21:15' } },
    });
    expect(heuresDansLAccueil(JOURNEE, plages)).toEqual([
      '06:00',
      '08:00',
      '12:30',
      '21:00',
      '21:15',
    ]);
  });

  test('sans horaire connu, toutes les heures restent proposées', () => {
    expect(
      heuresDansLAccueil(JOURNEE, plagesDAccueil({ ouverture: null, fermeture: null })),
    ).toEqual(JOURNEE);
  });

  test('une heure déjà choisie reste proposée, même hors des heures d’accueil', () => {
    const accueil = heuresDansLAccueil(JOURNEE, [{ de: '08:00', a: '12:30' }]);
    expect(avecLesHeuresChoisies(accueil, '15:00', '18:00')).toEqual([
      '08:00',
      '12:30',
      '15:00',
      '18:00',
    ]);
    expect(avecLesHeuresChoisies(accueil, '08:00', null, 'n’importe')).toEqual(accueil);
  });
});
