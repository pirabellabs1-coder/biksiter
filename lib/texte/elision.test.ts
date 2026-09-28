import { describe, expect, test } from 'vitest';

import { avecElision, dePrenom } from './elision';

describe('élision devant un prénom', () => {
  test('« de » s’élide devant un prénom qui commence par une voyelle', () => {
    expect(avecElision('Le vélo de Inès est chez vous.')).toBe(
      'Le vélo d’Inès est chez vous.',
    );
    expect(dePrenom('Élise')).toBe('d’Élise');
  });

  test('« que » s’élide aussi, et le reste de la phrase ne change pas', () => {
    expect(avecElision('Plus tard que Aya, plus tôt que Tom.')).toBe(
      'Plus tard qu’Aya, plus tôt que Tom.',
    );
  });

  test('un prénom qui commence par une consonne garde « de »', () => {
    expect(dePrenom('Tom')).toBe('de Tom');
    expect(avecElision('La demande de Karim')).toBe('La demande de Karim');
  });

  test('un mot en minuscule n’est pas touché : seuls les noms propres le sont', () => {
    expect(avecElision('une garde de une heure')).toBe('une garde de une heure');
  });

  test('un Y s’élide devant une consonne, pas devant une voyelle', () => {
    expect(dePrenom('Yves')).toBe('d’Yves');
    expect(dePrenom('Youssef')).toBe('de Youssef');
    expect(dePrenom('Yasmine')).toBe('de Yasmine');
  });

  test('seul le mot « de » entier s’élide, pas la fin d’un autre mot', () => {
    expect(avecElision('la bibliothèque Ixelles')).toBe('la bibliothèque Ixelles');
    expect(avecElision('un masque Orange')).toBe('un masque Orange');
  });
});
