import { describe, expect, test } from 'vitest';

import {
  decisionDePublication,
  peutDemanderUnStationnement,
  type Membre,
} from './publication';

function membre(partiel: Partial<Membre> = {}): Membre {
  return { verification: 'verifiee', emplacementsPublies: 0, ...partiel };
}

describe('règle 2 — l’identité avant la publication', () => {
  test('un membre dont l’identité n’a pas été vérifiée ne publie pas d’emplacement', () => {
    expect(decisionDePublication(membre({ verification: 'absente' }))).toEqual({
      autorise: false,
      motif: 'identite_non_verifiee',
    });
  });

  test('une vérification en cours ne suffit pas à publier', () => {
    expect(decisionDePublication(membre({ verification: 'en_cours' }))).toEqual({
      autorise: false,
      motif: 'identite_non_verifiee',
    });
  });

  test('une vérification refusée ne permet pas de publier', () => {
    expect(decisionDePublication(membre({ verification: 'refusee' }))).toEqual({
      autorise: false,
      motif: 'identite_non_verifiee',
    });
  });

  test('un membre vérifié peut publier un emplacement', () => {
    expect(decisionDePublication(membre())).toEqual({ autorise: true });
  });

  test('un membre vérifié qui a déjà deux emplacements est refusé pour le quota', () => {
    expect(decisionDePublication(membre({ emplacementsPublies: 2 }))).toEqual({
      autorise: false,
      motif: 'quota_atteint',
    });
  });
});

describe('demander un stationnement suppose la même vérification', () => {
  test('un membre non vérifié ne peut pas demander un stationnement', () => {
    expect(peutDemanderUnStationnement(membre({ verification: 'en_cours' }))).toBe(
      false,
    );
  });

  test('un membre vérifié peut demander un stationnement', () => {
    expect(peutDemanderUnStationnement(membre())).toBe(true);
  });
});
