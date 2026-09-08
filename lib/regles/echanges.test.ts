import { describe, expect, test } from 'vitest';

import {
  LONGUEUR_MAXIMALE_DU_MESSAGE,
  onPeutEcrire,
  refusDuMessage,
} from './echanges';

describe('on écrit autour d’un stationnement, pas n’importe quand', () => {
  test('un bike sitter peut poser une question avant d’accepter', () => {
    expect(onPeutEcrire('demande')).toBe(true);
  });

  test('on écrit pendant la garde et après la reprise', () => {
    expect(onPeutEcrire('accepte')).toBe(true);
    expect(onPeutEcrire('en_cours')).toBe(true);
    expect(onPeutEcrire('termine')).toBe(true);
  });

  test('un refus ou une annulation referme le fil', () => {
    // Laisser un fil ouvert sur un refus, c'est inviter à le contester.
    expect(onPeutEcrire('refuse')).toBe(false);
    expect(onPeutEcrire('annule')).toBe(false);
  });
});

describe('ce qu’on refuse d’enregistrer comme message', () => {
  test('un message vide n’est pas un message', () => {
    expect(refusDuMessage('   ', 'accepte')).toBe('vide');
  });

  test('un message trop long est refusé', () => {
    expect(
      refusDuMessage('a'.repeat(LONGUEUR_MAXIMALE_DU_MESSAGE), 'accepte'),
    ).toBeNull();
    expect(
      refusDuMessage('a'.repeat(LONGUEUR_MAXIMALE_DU_MESSAGE + 1), 'accepte'),
    ).toBe('trop_long');
  });

  test('on n’écrit pas sur un stationnement refusé, même un message valable', () => {
    expect(refusDuMessage('Bonjour', 'refuse')).toBe('etat_ferme');
  });

  test('un message ordinaire passe', () => {
    expect(refusDuMessage('Je serai là vers 14h.', 'accepte')).toBeNull();
  });
});
