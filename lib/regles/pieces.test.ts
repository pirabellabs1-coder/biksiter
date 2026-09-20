import { describe, expect, test } from 'vitest';

import {
  CONSERVATION_MAXIMALE_JOURS,
  TAILLE_MAXIMALE_OCTETS,
  doitEtreSupprimee,
  joursAvantSuppression,
  refusDuDepot,
  typeReelDuFichier,
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
    expect(
      doitEtreSupprimee({ deposeeLe: DEPOT, relueLe: null }, joursApres(2)),
    ).toBe(false);
  });
});

describe('une pièce d’identité est supprimée au plus tard après sept jours', () => {
  test('la durée de conservation de référence est de sept jours', () => {
    expect(CONSERVATION_MAXIMALE_JOURS).toBe(7);
  });

  test('une pièce oubliée six jours est encore là', () => {
    expect(
      doitEtreSupprimee({ deposeeLe: DEPOT, relueLe: null }, joursApres(6)),
    ).toBe(false);
  });

  test('une pièce que personne n’a regardée est supprimée au septième jour', () => {
    expect(
      doitEtreSupprimee({ deposeeLe: DEPOT, relueLe: null }, joursApres(7)),
    ).toBe(true);
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
    expect(
      refusDuDepot({ type: 'application/pdf', taille: 200_000 }),
    ).toBeNull();
  });

  test('un fichier vide est refusé', () => {
    expect(refusDuDepot({ type: 'image/jpeg', taille: 0 })).toBe('vide');
  });

  test('un type hors liste est refusé, y compris un exécutable renommé', () => {
    expect(refusDuDepot({ type: 'application/zip', taille: 1000 })).toBe(
      'type_refuse',
    );
    expect(refusDuDepot({ type: 'text/html', taille: 1000 })).toBe(
      'type_refuse',
    );
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

describe('le type réel d’une pièce déposée', () => {
  test('une photo JPEG, PNG ou WebP et un PDF sont reconnus à leur signature', () => {
    expect(typeReelDuFichier(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      'image/jpeg',
    );
    expect(
      typeReelDuFichier(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe('image/png');
    expect(
      typeReelDuFichier(
        new TextEncoder().encode('RIFF\u0000\u0000\u0000\u0000WEBPVP8 '),
      ),
    ).toBe('image/webp');
    expect(typeReelDuFichier(new TextEncoder().encode('%PDF-1.7'))).toBe(
      'application/pdf',
    );
  });

  test('un fichier qui se dit image sans en avoir la signature est refusé', () => {
    expect(
      typeReelDuFichier(new TextEncoder().encode('<html><script>')),
    ).toBeNull();
  });
});
