import { describe, expect, test } from 'vitest';

import {
  PHOTOS_PAR_EMPLACEMENT,
  SUJETS_DES_PHOTOS,
  TAILLE_MAXIMALE_OCTETS,
  estUnRangValide,
  refusDeLaPhoto,
} from './photos';

const bonne = { type: 'image/jpeg', taille: 900_000, rang: 0 };

describe('trois photos, et trois sujets', () => {
  test('un emplacement porte au plus trois photos', () => {
    expect(PHOTOS_PAR_EMPLACEMENT).toBe(3);
    expect(SUJETS_DES_PHOTOS).toHaveLength(3);
  });

  test('les rangs vont de zéro à deux', () => {
    expect(estUnRangValide(0)).toBe(true);
    expect(estUnRangValide(2)).toBe(true);
    expect(estUnRangValide(3)).toBe(false);
    expect(estUnRangValide(-1)).toBe(false);
  });

  test('un rang hors limites est refusé avant tout le reste', () => {
    expect(refusDeLaPhoto({ ...bonne, rang: 9 })).toBe('rang_hors_limites');
  });
});

describe('ce qu’on accepte comme photo', () => {
  test('une photo de téléphone passe', () => {
    expect(refusDeLaPhoto(bonne)).toBeNull();
    expect(refusDeLaPhoto({ ...bonne, type: 'image/heic' })).toBeNull();
  });

  test('un fichier vide est refusé', () => {
    expect(refusDeLaPhoto({ ...bonne, taille: 0 })).toBe('vide');
  });

  test('un format hors liste est refusé', () => {
    // Le SVG, en particulier : il peut contenir du script.
    expect(refusDeLaPhoto({ ...bonne, type: 'image/svg+xml' })).toBe(
      'type_refuse',
    );
    expect(refusDeLaPhoto({ ...bonne, type: 'application/pdf' })).toBe(
      'type_refuse',
    );
  });

  test('au-delà de huit mégaoctets, la photo est refusée', () => {
    expect(
      refusDeLaPhoto({ ...bonne, taille: TAILLE_MAXIMALE_OCTETS }),
    ).toBeNull();
    expect(
      refusDeLaPhoto({ ...bonne, taille: TAILLE_MAXIMALE_OCTETS + 1 }),
    ).toBe('trop_lourde');
  });
});
