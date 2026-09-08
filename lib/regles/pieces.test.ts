import { describe, expect, test } from 'vitest';

import {
  CONSERVATION_MAXIMALE_JOURS,
  TAILLE_MAXIMALE_OCTETS,
  doitEtreSupprimee,
  joursAvantSuppression,
  refusDuDepot,
} from './pieces';

const DEPOT = new Date('2026-09-01T10:00:00Z');

function joursApres(nombre: number): Date {
  return new Date(DEPOT.getTime() + nombre * 24 * 60 * 60 * 1000);
}

describe('une pièce d’identité est supprimée dès la vérification', () => {
  test('une pièce relue est supprimée, même déposée il y a une minute', () => {
    expect(
      doitEtreSupprimee(
        { deposeeLe: DEPOT, relueLe: new Date(DEPOT.getTime() + 60_000) },
        new Date(DEPOT.getTime() + 60_000),
      ),
    ).toBe(true);
  });

  test('une pièce non relue est gardée le temps qu’une personne la regarde', () => {
    expect(doitEtreSupprimee({ deposeeLe: DEPOT, relueLe: null }, joursApres(2))).toBe(
      false,
    );
  });
});

describe('une pièce d’identité est supprimée au plus tard après sept jours', () => {
  test('la durée de conservation de référence est de sept jours', () => {
    expect(CONSERVATION_MAXIMALE_JOURS).toBe(7);
  });

  test('une pièce oubliée six jours est encore là', () => {
    expect(doitEtreSupprimee({ deposeeLe: DEPOT, relueLe: null }, joursApres(6))).toBe(
      false,
    );
  });

  test('une pièce que personne n’a regardée est supprimée au septième jour', () => {
    expect(doitEtreSupprimee({ deposeeLe: DEPOT, relueLe: null }, joursApres(7))).toBe(
      true,
    );
  });

  test('le compte à rebours annoncé au membre tombe à zéro et n’y descend pas', () => {
    expect(joursAvantSuppression(DEPOT, DEPOT)).toBe(7);
    expect(joursAvantSuppression(DEPOT, joursApres(6.5))).toBe(1);
    expect(joursAvantSuppression(DEPOT, joursApres(9))).toBe(0);
  });
});

describe('ce qu’on accepte comme pièce', () => {
  test('une photo ou un PDF passent', () => {
    expect(refusDuDepot({ type: 'image/jpeg', taille: 900_000 })).toBeNull();
    expect(refusDuDepot({ type: 'application/pdf', taille: 200_000 })).toBeNull();
  });

  test('un fichier vide est refusé', () => {
    expect(refusDuDepot({ type: 'image/jpeg', taille: 0 })).toBe('vide');
  });

  test('un type hors liste est refusé, y compris un exécutable renommé', () => {
    expect(refusDuDepot({ type: 'application/zip', taille: 1000 })).toBe(
      'type_refuse',
    );
    expect(refusDuDepot({ type: 'text/html', taille: 1000 })).toBe('type_refuse');
  });

  test('au-delà de huit mégaoctets, la pièce est refusée', () => {
    expect(
      refusDuDepot({ type: 'image/jpeg', taille: TAILLE_MAXIMALE_OCTETS }),
    ).toBeNull();
    expect(
      refusDuDepot({ type: 'image/jpeg', taille: TAILLE_MAXIMALE_OCTETS + 1 }),
    ).toBe('trop_lourde');
  });
});
