import { describe, expect, test } from 'vitest';

import { ecrireLesReglages, lireLesReglages } from './accessibilite';

describe('les réglages d’affichage', () => {
  test('un réglage inconnu dans le témoin est ignoré', () => {
    expect(lireLesReglages('texte-grand,police-rose,contraste-eleve')).toEqual([
      'texte-grand',
      'contraste-eleve',
    ]);
  });

  test('sans témoin, aucun réglage n’est actif', () => {
    expect(lireLesReglages(undefined)).toEqual([]);
    expect(lireLesReglages('')).toEqual([]);
  });

  test('un réglage coché deux fois ne s’écrit qu’une fois', () => {
    expect(
      ecrireLesReglages(['animations-reduites', 'animations-reduites']),
    ).toBe('animations-reduites');
  });
});
