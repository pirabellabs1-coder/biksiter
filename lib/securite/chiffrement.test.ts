import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { chiffrer, cleValide, dechiffrer } from './chiffrement';

const CLE_DE_TEST = 'a'.repeat(64);

describe('une pièce d’identité n’est jamais stockée en clair', () => {
  beforeEach(() => {
    process.env.CLE_DES_PIECES = CLE_DE_TEST;
  });

  afterEach(() => {
    delete process.env.CLE_DES_PIECES;
  });

  test('ce qui est chiffré se relit à l’identique', () => {
    const clair = Buffer.from('carte d’identité de Manoelle', 'utf8');
    expect(dechiffrer(chiffrer(clair)).toString('utf8')).toBe(
      clair.toString('utf8'),
    );
  });

  test('le contenu chiffré ne laisse rien lire du document', () => {
    const clair = Buffer.from('rue Malibran 12, 1050 Ixelles', 'utf8');
    const coffre = chiffrer(clair);
    expect(coffre.contenu.toString('utf8')).not.toContain('Malibran');
  });

  test('deux chiffrements du même document ne se ressemblent pas', () => {
    // Un vecteur d'initialisation neuf à chaque fois : sans cela, deux pièces
    // identiques se reconnaîtraient dans la base sans aucune clé.
    const clair = Buffer.from('même document', 'utf8');
    const premier = chiffrer(clair);
    const second = chiffrer(clair);

    expect(premier.vecteur.equals(second.vecteur)).toBe(false);
    expect(premier.contenu.equals(second.contenu)).toBe(false);
  });

  test('un document altéré en base refuse de se déchiffrer', () => {
    const coffre = chiffrer(Buffer.from('document intact', 'utf8'));
    coffre.contenu[0] ^= 0xff;

    expect(() => dechiffrer(coffre)).toThrow();
  });

  test('une étiquette d’authentification remplacée refuse de se déchiffrer', () => {
    const coffre = chiffrer(Buffer.from('document intact', 'utf8'));
    coffre.etiquette[0] ^= 0xff;

    expect(() => dechiffrer(coffre)).toThrow();
  });
});

describe('sans clé, le dépôt est fermé plutôt qu’en clair', () => {
  test('chiffrer sans clé lève au lieu de stocker le document tel quel', () => {
    delete process.env.CLE_DES_PIECES;
    expect(() => chiffrer(Buffer.from('pièce', 'utf8'))).toThrow(
      /CLE_DES_PIECES/,
    );
  });

  test('une clé mal formée est refusée', () => {
    process.env.CLE_DES_PIECES = 'trop-courte';
    expect(() => chiffrer(Buffer.from('pièce', 'utf8'))).toThrow(
      /32 octets en hexadécimal/,
    );
    delete process.env.CLE_DES_PIECES;
  });

  test('une clé de zéros n’est pas une clé', () => {
    expect(cleValide('0'.repeat(64))).toBe(false);
    expect(cleValide(CLE_DE_TEST)).toBe(true);
  });
});
