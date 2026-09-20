import { describe, expect, test } from 'vitest';

import { motifsDesDisponibilites } from './disponibilites-du-lieu';

const VALIDES = {
  jours: [1, 2, 3],
  ouverture: '08:00',
  fermeture: '20:00',
  dureeMaxHeures: 8,
  delaiDeReponse: 'jour',
  fermetures: ['2026-12-24'],
};

describe('les disponibilités d’un lieu', () => {
  test('des disponibilités complètes ne donnent aucun motif', () => {
    expect(motifsDesDisponibilites(VALIDES)).toEqual([]);
  });

  test('un lieu sans jour d’accueil reste un brouillon', () => {
    expect(motifsDesDisponibilites({ ...VALIDES, jours: [] })).toContain(
      'Choisissez au moins un jour d’accueil.',
    );
  });

  test('la plage horaire va dans le bon sens', () => {
    expect(
      motifsDesDisponibilites({ ...VALIDES, ouverture: '20:00', fermeture: '08:00' }),
    ).toContain('L’heure de fin doit suivre l’heure de début.');
  });

  test('une durée ou un délai hors liste est refusé', () => {
    expect(motifsDesDisponibilites({ ...VALIDES, dureeMaxHeures: 12 })).toHaveLength(1);
    expect(motifsDesDisponibilites({ ...VALIDES, delaiDeReponse: 'jamais' })).toHaveLength(1);
  });

  test('une date de fermeture impossible est refusée', () => {
    expect(motifsDesDisponibilites({ ...VALIDES, fermetures: ['2026-02-30x'] })).toHaveLength(1);
  });
});
