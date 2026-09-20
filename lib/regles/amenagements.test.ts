import { describe, expect, test } from 'vitest';

import {
  estUnRetardAnnoncable,
  nouvelleFinRefusee,
  pointsEnPlus,
  prolongationPossible,
  retardAnnoncable,
} from './amenagements';

const debut = new Date('2026-09-20T12:00:00Z');
const fin = new Date('2026-09-20T16:00:00Z');
const horaires = { debut, fin };
const a = (iso: string) => new Date(iso);

describe('prévenir d’un retard', () => {
  test('on prévient d’un retard de 15, 30 ou 60 minutes, pas d’une durée libre', () => {
    expect(estUnRetardAnnoncable(30)).toBe(true);
    expect(estUnRetardAnnoncable(45)).toBe(false);
  });

  test('un retard au dépôt s’annonce dans les trois heures avant l’heure convenue', () => {
    expect(
      retardAnnoncable('accepte', horaires, a('2026-09-20T09:30:00Z')),
    ).toBe('depot');
    expect(
      retardAnnoncable('accepte', horaires, a('2026-09-20T08:30:00Z')),
    ).toBeNull();
  });

  test('un retard ne s’annonce plus une heure après l’heure convenue', () => {
    expect(
      retardAnnoncable('accepte', horaires, a('2026-09-20T13:01:00Z')),
    ).toBeNull();
  });

  test('pendant la garde, le retard porte sur la reprise', () => {
    expect(
      retardAnnoncable('en_cours', horaires, a('2026-09-20T15:00:00Z')),
    ).toBe('reprise');
  });

  test('une demande pas encore acceptée n’a pas de retard à annoncer', () => {
    expect(
      retardAnnoncable('demande', horaires, a('2026-09-20T11:00:00Z')),
    ).toBeNull();
  });
});

describe('prolonger une garde', () => {
  test('une garde se prolonge tant que sa fin n’est pas passée', () => {
    expect(
      prolongationPossible('en_cours', fin, a('2026-09-20T15:00:00Z')),
    ).toBe(true);
    expect(
      prolongationPossible('en_cours', fin, a('2026-09-20T16:30:00Z')),
    ).toBe(false);
  });

  test('une demande en attente ou une garde terminée ne se prolonge pas', () => {
    expect(
      prolongationPossible('demande', fin, a('2026-09-20T10:00:00Z')),
    ).toBe(false);
    expect(
      prolongationPossible('termine', fin, a('2026-09-20T10:00:00Z')),
    ).toBe(false);
  });

  // Un lieu ouvert tous les jours de 8 h à 20 h, pour une semaine au plus.
  const lieu = {
    horaires: {
      jours: [0, 1, 2, 3, 4, 5, 6],
      ouverture: '08:00',
      fermeture: '20:00',
      parJour: {},
      fermetures: [],
    },
    dureeMaxJours: 7,
  };

  test('la nouvelle fin doit être plus tardive, et d’une semaine au plus', () => {
    expect(nouvelleFinRefusee(horaires, a('2026-09-20T15:00:00Z'), lieu)).toBe(
      'pas_plus_tard',
    );
    expect(nouvelleFinRefusee(horaires, a('2026-09-28T16:00:00Z'), lieu)).toBe(
      'trop_longue',
    );
    expect(
      nouvelleFinRefusee(horaires, a('2026-09-21T16:00:00Z'), lieu),
    ).toBeNull();
  });

  test('une prolongation ne fixe pas la reprise à une heure où le lieu est fermé', () => {
    // 1 h du matin à Bruxelles.
    expect(nouvelleFinRefusee(horaires, a('2026-09-20T23:00:00Z'), lieu)).toBe(
      'hors_horaires',
    );
    expect(
      nouvelleFinRefusee(horaires, a('2026-09-21T16:00:00Z'), {
        ...lieu,
        horaires: { ...lieu.horaires, fermetures: ['2026-09-21'] },
      }),
    ).toBe('hors_horaires');
  });

  test('une prolongation respecte la durée d’accueil fixée par le bike sitter', () => {
    expect(
      nouvelleFinRefusee(horaires, a('2026-09-22T16:00:00Z'), {
        ...lieu,
        dureeMaxJours: 2,
      }),
    ).toBe('duree_du_lieu');
  });

  test('une prolongation sur le jour suivant ajoute un point par jour entamé', () => {
    const garde = { debut, fin, typeVelo: 'Ville' as const };
    expect(pointsEnPlus(garde, a('2026-09-21T14:00:00Z'))).toBe(1);
    expect(pointsEnPlus(garde, a('2026-09-20T18:00:00Z'))).toBe(0);
  });

  test('un vélo encombrant compte double dans les points ajoutés', () => {
    const cargo = { debut, fin, typeVelo: 'Cargo' as const };
    expect(pointsEnPlus(cargo, a('2026-09-21T14:00:00Z'))).toBe(2);
  });
});
