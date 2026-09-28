import { describe, expect, test } from 'vitest';

import { adresseSansBoiteReelle } from './envois';

describe('les courriels qui partent', () => {
  test('une adresse ordinaire reçoit ses courriels', () => {
    expect(adresseSansBoiteReelle('prenom.nom@gmail.com')).toBe(false);
    expect(adresseSansBoiteReelle('bonjour@bikesitters.be')).toBe(false);
  });

  test('un compte de démonstration ou de recette ne reçoit jamais de courriel', () => {
    expect(adresseSansBoiteReelle('thomas@exemple.be')).toBe(true);
    expect(adresseSansBoiteReelle('qa-t10-a@exemple.test')).toBe(true);
    expect(adresseSansBoiteReelle('nom@mail.exemple.be')).toBe(true);
    expect(adresseSansBoiteReelle('Nom@EXEMPLE.BE')).toBe(true);
  });

  test('un domaine réservé aux essais ne reçoit jamais de courriel', () => {
    expect(adresseSansBoiteReelle('nom@site.example')).toBe(true);
    expect(adresseSansBoiteReelle('nom@boite.invalid')).toBe(true);
    expect(adresseSansBoiteReelle('nom@localhost')).toBe(true);
  });

  test('un domaine voisin d’un domaine de démonstration reste une vraie adresse', () => {
    expect(adresseSansBoiteReelle('nom@monexemple.be')).toBe(false);
  });
});
