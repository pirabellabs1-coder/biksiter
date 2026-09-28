import { describe, expect, test } from 'vitest';

import { motifDeSignalementValable } from './signalements';

describe('les motifs d’un signalement', () => {
  test('un signalement porte un motif de la liste de sa cible', () => {
    expect(motifDeSignalementValable('membre', 'Harcèlement')).toBe(true);
    expect(motifDeSignalementValable('emplacement', 'Lieu non sûr')).toBe(true);
  });

  test('un motif inventé ou celui d’une autre cible est refusé', () => {
    expect(motifDeSignalementValable('membre', 'Lieu non sûr')).toBe(false);
    expect(motifDeSignalementValable('membre', 'n’importe quoi')).toBe(false);
    expect(motifDeSignalementValable('emplacement', '')).toBe(false);
  });
});
