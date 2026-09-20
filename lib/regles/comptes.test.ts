import { describe, expect, test } from 'vitest';

import {
  compteSupprimable,
  dureeDeValidite,
  erreurDeMotDePasse,
  LONGUEUR_MINIMALE_DU_MOT_DE_PASSE,
  nomModifiable,
  verifierLInscription,
} from './comptes';

const saisie = {
  prenom: 'Lucas',
  nom: 'Dubois',
  email: 'lucas@exemple.be',
  motDePasse: 'une phrase courte',
};

describe('la création d’un compte', () => {
  test('une inscription complète est acceptée', () => {
    expect(verifierLInscription(saisie)).toEqual({});
  });

  test('le prénom et le nom sont demandés', () => {
    const erreurs = verifierLInscription({ ...saisie, prenom: ' ', nom: '' });
    expect(erreurs).toHaveProperty('prenom');
    expect(erreurs).toHaveProperty('nom');
  });

  test('une adresse sans domaine est refusée', () => {
    expect(
      verifierLInscription({ ...saisie, email: 'lucas@exemple' }),
    ).toHaveProperty('email');
  });

  test(`un mot de passe de moins de ${LONGUEUR_MINIMALE_DU_MOT_DE_PASSE} caractères est refusé`, () => {
    expect(
      erreurDeMotDePasse('a'.repeat(LONGUEUR_MINIMALE_DU_MOT_DE_PASSE - 1)),
    ).not.toBeNull();
    expect(
      erreurDeMotDePasse('a'.repeat(LONGUEUR_MINIMALE_DU_MOT_DE_PASSE)),
    ).toBeNull();
  });

  test('aucune règle de composition n’est imposée au mot de passe', () => {
    expect(erreurDeMotDePasse('toutenminuscules')).toBeNull();
  });

  test('le lien pour changer de mot de passe vit moins longtemps que celui qui confirme une adresse', () => {
    expect(dureeDeValidite('nouveau_mot_de_passe')).toBeLessThan(
      dureeDeValidite('confirmation_email'),
    );
  });

  test('une adresse faite de longues suites de points reste vérifiée rapidement', () => {
    const debut = Date.now();
    expect(
      verifierLInscription({
        ...saisie,
        email: 'a@b' + '.b'.repeat(40_000) + '.',
      }),
    ).toHaveProperty('email');
    expect(Date.now() - debut).toBeLessThan(100);
  });

  test('une adresse courante est acceptée, sous-domaine compris', () => {
    expect(
      verifierLInscription({ ...saisie, email: 'prenom.nom@mail.exemple.be' }),
    ).toEqual({});
  });
});

describe('le compte du membre', () => {
  test('le nom ne se modifie plus une fois la pièce envoyée ou vérifiée', () => {
    expect(nomModifiable('absente')).toBe(true);
    expect(nomModifiable('refusee')).toBe(true);
    expect(nomModifiable('en_cours')).toBe(false);
    expect(nomModifiable('verifiee')).toBe(false);
  });

  test('un compte avec une garde en cours ou une demande en attente ne se supprime pas', () => {
    expect(compteSupprimable([])).toBe(true);
    expect(compteSupprimable(['termine', 'annule', 'refuse', 'expire'])).toBe(
      true,
    );
    for (const etat of [
      'demande',
      'accepte',
      'arrivee',
      'en_cours',
      'reprise_demandee',
      'litige',
    ]) {
      expect(compteSupprimable(['termine', etat])).toBe(false);
    }
  });
});
