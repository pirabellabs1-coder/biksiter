import { describe, expect, test } from 'vitest';

import { cheminDeRetour } from './retour';

describe('le retour après la connexion', () => {
  test('un chemin du site est accepté, requête comprise', () => {
    expect(cheminDeRetour('/recherche?lieu=Ixelles&de=16:00')).toBe(
      '/recherche?lieu=Ixelles&de=16:00',
    );
  });

  test('une adresse vers un autre site est refusée', () => {
    expect(cheminDeRetour('https://exemple.com')).toBeNull();
    expect(cheminDeRetour('//exemple.com/connexion')).toBeNull();
    expect(cheminDeRetour('/\\exemple.com')).toBeNull();
    expect(cheminDeRetour('javascript:alert(1)')).toBeNull();
  });

  test('un encodage détourné ou un caractère invisible est refusé', () => {
    expect(cheminDeRetour('/\t/exemple.com')).toBeNull();
    expect(cheminDeRetour('/%E3%80%82')).toBe('/%E3%80%82');
    expect(cheminDeRetour('/。')).toBeNull();
    expect(cheminDeRetour('/ espace')).toBeNull();
  });

  test('on ne revient ni sur le lien de démonstration ni sur une route technique', () => {
    expect(cheminDeRetour('/lien-demo?jeton=abc')).toBeNull();
    expect(cheminDeRetour('/api/envois')).toBeNull();
    expect(cheminDeRetour('/demandes')).toBe('/demandes');
  });

  test('une valeur vide, trop longue ou qui n’est pas un texte est ignorée', () => {
    expect(cheminDeRetour('')).toBeNull();
    expect(cheminDeRetour(`/${'a'.repeat(600)}`)).toBeNull();
    expect(cheminDeRetour(null)).toBeNull();
  });
});
