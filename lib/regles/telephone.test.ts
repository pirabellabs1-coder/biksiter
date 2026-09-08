import { describe, expect, test } from 'vitest';

import {
  ESSAIS_PAR_CODE_TELEPHONE,
  VALIDITE_DU_CODE_MINUTES,
  lireLeNumero,
  normaliserLeNumero,
  verifierLeCode,
} from './telephone';

const EMISSION = new Date('2026-09-08T10:00:00Z');

function minutesApres(nombre: number): Date {
  return new Date(EMISSION.getTime() + nombre * 60 * 1000);
}

describe('un numéro belge s’écrit de six façons et veut dire la même chose', () => {
  test('les formes courantes se ramènent toutes au même numéro', () => {
    for (const saisie of [
      '0470123456',
      '0470 12 34 56',
      '0470/12.34.56',
      '+32470123456',
      '+32 470 12 34 56',
      '0032470123456',
    ]) {
      expect(normaliserLeNumero(saisie)).toBe('+32470123456');
    }
  });

  test('un numéro qui ne ressemble à rien est refusé', () => {
    expect(lireLeNumero('bonjour')).toEqual({
      valide: false,
      motif: 'illisible',
    });
    expect(lireLeNumero('12')).toEqual({ valide: false, motif: 'illisible' });
  });

  test('une ligne fixe est refusée : un SMS n’y arrive pas', () => {
    // 02 est un fixe bruxellois.
    expect(lireLeNumero('02 123 45 67')).toEqual({
      valide: false,
      motif: 'pas_un_mobile',
    });
  });

  test('un mobile belge est accepté', () => {
    expect(lireLeNumero('0495 11 22 33')).toEqual({
      valide: true,
      numero: '+32495112233',
    });
  });
});

describe('le code envoyé par SMS vaut dix minutes et trois essais', () => {
  test('les valeurs de référence sont dix minutes et trois essais', () => {
    expect(VALIDITE_DU_CODE_MINUTES).toBe(10);
    expect(ESSAIS_PAR_CODE_TELEPHONE).toBe(3);
  });

  test('le bon code accepte', () => {
    expect(
      verifierLeCode({ emisLe: EMISSION, essaisUtilises: 0 }, true, minutesApres(2)),
    ).toEqual({ accepte: true });
  });

  test('un code faux consomme un essai sur les trois', () => {
    expect(
      verifierLeCode({ emisLe: EMISSION, essaisUtilises: 0 }, false, minutesApres(2)),
    ).toEqual({ accepte: false, motif: 'incorrect', essaisRestants: 2 });
  });

  test('après trois essais, le code ne sert plus', () => {
    expect(
      verifierLeCode({ emisLe: EMISSION, essaisUtilises: 3 }, true, minutesApres(2)),
    ).toEqual({ accepte: false, motif: 'epuise' });
  });

  test('un code de dix minutes est expiré', () => {
    expect(
      verifierLeCode({ emisLe: EMISSION, essaisUtilises: 0 }, true, minutesApres(10)),
    ).toEqual({ accepte: false, motif: 'expire' });
  });

  test('un code expiré ne consomme pas d’essai : attendre ne doit pas bloquer', () => {
    expect(
      verifierLeCode({ emisLe: EMISSION, essaisUtilises: 0 }, false, minutesApres(30)),
    ).toEqual({ accepte: false, motif: 'expire' });
  });
});
