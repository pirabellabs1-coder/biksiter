import { describe, expect, test } from 'vitest';

import { bonValide, decisionDEchange, stockAAfficher } from './catalogue';

const offre = { coutEnMaillons: 25, stockRestant: 8, active: true };
const solde = { acquis: 41, enAttente: 2 };

describe('qui peut échanger un remerciement', () => {
  test('un bike sitter qui a assez de maillons échange', () => {
    expect(decisionDEchange(offre, solde, 34)).toEqual({ possible: true });
  });

  test('un membre qui n’a jamais accueilli ne peut pas échanger', () => {
    expect(decisionDEchange(offre, { acquis: 0, enAttente: 0 }, 0)).toEqual({
      possible: false,
      motif: 'jamais_accueilli',
    });
  });

  test('le motif « jamais accueilli » passe avant la rupture de stock', () => {
    // Dire « épuisé » à quelqu'un qui de toute façon ne peut pas échanger
    // serait une fausse piste.
    expect(
      decisionDEchange({ ...offre, stockRestant: 0 }, { acquis: 0, enAttente: 0 }, 0),
    ).toEqual({ possible: false, motif: 'jamais_accueilli' });
  });

  test('une offre épuisée ne s’échange pas', () => {
    expect(decisionDEchange({ ...offre, stockRestant: 0 }, solde, 34)).toEqual({
      possible: false,
      motif: 'rupture',
    });
  });

  test('les maillons en attente ne comptent pas dans le solde dépensable', () => {
    // 39 acquis + 2 en attente ne suffisent pas pour une offre à 41.
    expect(
      decisionDEchange(
        { ...offre, coutEnMaillons: 41 },
        { acquis: 39, enAttente: 2 },
        34,
      ),
    ).toEqual({ possible: false, motif: 'solde_insuffisant' });
  });

  test('une offre retirée par le commerçant ne s’échange plus', () => {
    expect(decisionDEchange({ ...offre, active: false }, solde, 34)).toEqual({
      possible: false,
      motif: 'offre_indisponible',
    });
  });
});

describe('le stock s’affiche, le manque ne s’affiche pas', () => {
  test('le stock restant est un nombre, sans « plus que »', () => {
    expect(stockAAfficher(offre)).toBe('8 restants');
    expect(stockAAfficher({ ...offre, stockRestant: 1 })).toBe('1 restant');
  });

  test('une offre épuisée le dit', () => {
    expect(stockAAfficher({ ...offre, stockRestant: 0 })).toBe('épuisé');
  });

  test('une offre retirée n’affiche pas de stock du tout', () => {
    expect(stockAAfficher({ ...offre, active: false })).toBeNull();
  });
});

describe('le bon présenté au commerçant', () => {
  test('un bon fait huit caractères en majuscules', () => {
    expect(bonValide('A1B2C3D4')).toBe(true);
  });

  test('un bon mal formé est refusé', () => {
    expect(bonValide('a1b2c3d4')).toBe(false);
    expect(bonValide('A1B2C3')).toBe(false);
    expect(bonValide('')).toBe(false);
  });
});
