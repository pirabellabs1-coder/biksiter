import { describe, expect, test } from 'vitest';

import {
  CHIFFRES_DU_CODE_DE_REMISE,
  ESSAIS_PAR_CODE,
  VALIDITE_CODE_HEURES,
  codeEncoreValide,
  saisirLeCode,
  type Code,
} from './remise';

const emission = new Date('2026-09-08T09:00:00Z');

function code(partiel: Partial<Code> = {}): Code {
  return { chiffres: '472913', emisLe: emission, essaisUtilises: 0, ...partiel };
}

function heuresApres(nombre: number): Date {
  return new Date(emission.getTime() + nombre * 60 * 60 * 1000);
}

describe('règle 5 — le vélo ne change d’état qu’avec un code', () => {
  test('les valeurs de référence sont six chiffres, six heures et trois essais', () => {
    expect(CHIFFRES_DU_CODE_DE_REMISE).toBe(6);
    expect(VALIDITE_CODE_HEURES).toBe(6);
    expect(ESSAIS_PAR_CODE).toBe(3);
  });

  test('le bon code accepte la remise', () => {
    expect(saisirLeCode(code(), '472913', heuresApres(1))).toEqual({ accepte: true });
  });

  test('un code faux consomme un essai sur les trois', () => {
    expect(saisirLeCode(code(), '000013', heuresApres(1))).toEqual({
      accepte: false,
      motif: 'incorrect',
      essaisRestants: 2,
      aRegenerer: false,
    });
  });

  test('le troisième essai raté déclenche la régénération du code', () => {
    expect(saisirLeCode(code({ essaisUtilises: 2 }), '000013', heuresApres(1))).toEqual({
      accepte: false,
      motif: 'incorrect',
      essaisRestants: 0,
      aRegenerer: true,
    });
  });

  test('un code dont les trois essais sont épuisés n’accepte plus rien', () => {
    expect(saisirLeCode(code({ essaisUtilises: 3 }), '472913', heuresApres(1))).toEqual({
      accepte: false,
      motif: 'epuise',
    });
  });
});

describe('un code vaut six heures', () => {
  test('un code de cinq heures est encore valide', () => {
    expect(codeEncoreValide(code(), heuresApres(5))).toBe(true);
  });

  test('un code de six heures est expiré', () => {
    expect(codeEncoreValide(code(), heuresApres(6))).toBe(false);
  });

  test('un code expiré ne consomme pas d’essai', () => {
    expect(saisirLeCode(code(), '000013', heuresApres(7))).toEqual({
      accepte: false,
      motif: 'expire',
    });
  });
});
