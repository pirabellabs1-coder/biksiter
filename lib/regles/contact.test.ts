import { describe, expect, test } from 'vitest';

import {
  LONGUEUR_MAXIMALE_D_UN_MESSAGE,
  MESSAGES_PAR_ADRESSE_PAR_JOUR,
  peutEncoreEcrire,
  verifierUnMessageDeContact,
} from './contact';

const valide = {
  email: 'nom@exemple.be',
  sujet: 'question',
  message: 'Bonjour, une question sur les emplacements.',
};

describe('les messages de la page Contact', () => {
  test('un message complet est accepté', () => {
    expect(verifierUnMessageDeContact(valide)).toEqual({});
  });

  test('un message sans adresse e-mail valide est refusé, faute de pouvoir répondre', () => {
    expect(
      verifierUnMessageDeContact({ ...valide, email: 'nom@exemple' }),
    ).toHaveProperty('email');
  });

  test('un sujet hors de la liste est refusé', () => {
    expect(
      verifierUnMessageDeContact({ ...valide, sujet: 'autre' }),
    ).toHaveProperty('sujet');
    expect(
      verifierUnMessageDeContact({ ...valide, sujet: 'toString' }),
    ).toHaveProperty('sujet');
  });

  test('un message vide est refusé', () => {
    expect(
      verifierUnMessageDeContact({ ...valide, message: '   ' }),
    ).toHaveProperty('message');
  });

  test(`un message de plus de ${LONGUEUR_MAXIMALE_D_UN_MESSAGE} caractères est refusé`, () => {
    expect(
      verifierUnMessageDeContact({
        ...valide,
        message: 'a'.repeat(LONGUEUR_MAXIMALE_D_UN_MESSAGE + 1),
      }),
    ).toHaveProperty('message');
  });

  test(`une adresse peut écrire ${MESSAGES_PAR_ADRESSE_PAR_JOUR} messages par jour, pas davantage`, () => {
    expect(
      peutEncoreEcrire('question', MESSAGES_PAR_ADRESSE_PAR_JOUR - 1),
    ).toBe(true);
    expect(peutEncoreEcrire('question', MESSAGES_PAR_ADRESSE_PAR_JOUR)).toBe(
      false,
    );
  });

  test('le signalement d’un abus n’est jamais limité', () => {
    expect(peutEncoreEcrire('abus', MESSAGES_PAR_ADRESSE_PAR_JOUR * 10)).toBe(
      true,
    );
  });

  test('un message contenant un caractère nul est refusé', () => {
    expect(
      verifierUnMessageDeContact({ ...valide, message: 'Bonjour\u0000' }),
    ).toHaveProperty('message');
  });

  test('une adresse démesurée est refusée sans bloquer la vérification', () => {
    const debut = Date.now();
    const email = 'a@' + '.'.repeat(200_000) + '@';
    expect(verifierUnMessageDeContact({ ...valide, email })).toHaveProperty(
      'email',
    );
    expect(Date.now() - debut).toBeLessThan(100);
  });
});
