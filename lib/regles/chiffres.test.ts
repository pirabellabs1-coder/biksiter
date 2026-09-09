import { describe, expect, test } from 'vitest';

import { chiffresAAfficher, ecrireUnNombre } from './chiffres';

const RIEN = {
  gardesRealisees: 0,
  habitantsQuiAccueillent: 0,
  quartiersOuverts: 0,
};

describe('les chiffres affichés sont ceux qui existent', () => {
  test('un chiffre à zéro ne s’affiche pas', () => {
    const chiffres = chiffresAAfficher({
      ...RIEN,
      habitantsQuiAccueillent: 4,
      quartiersOuverts: 2,
    });

    expect(chiffres.map((chiffre) => chiffre.libelle)).toEqual([
      'habitants qui accueillent',
      'quartiers ouverts à Bruxelles',
    ]);
  });

  test('un réseau qui n’a rien fait n’affiche aucun chiffre', () => {
    // La page s'en sert pour ne pas dessiner le bandeau du tout : trois zéros
    // alignés diraient quelque chose de faux sur ce qui est en train de naître.
    expect(chiffresAAfficher(RIEN)).toEqual([]);
  });

  test('un chiffre n’est jamais arrondi', () => {
    const [chiffre] = chiffresAAfficher({ ...RIEN, gardesRealisees: 1287 });
    expect(chiffre.valeur).toBe('1 287');
  });
});

describe('les libellés s’accordent au nombre', () => {
  test('une seule garde s’écrit au singulier', () => {
    const [chiffre] = chiffresAAfficher({ ...RIEN, gardesRealisees: 1 });
    expect(chiffre.libelle).toBe('garde réalisée');
  });

  test('deux gardes s’écrivent au pluriel', () => {
    const [chiffre] = chiffresAAfficher({ ...RIEN, gardesRealisees: 2 });
    expect(chiffre.libelle).toBe('gardes réalisées');
  });
});

describe('un nombre s’écrit à la française', () => {
  test('les milliers sont séparés par une espace fine insécable', () => {
    // Une espace ordinaire laisserait « 3 » seul en fin de ligne.
    expect(ecrireUnNombre(3480)).toBe('3 480');
    expect(ecrireUnNombre(1234567)).toBe('1 234 567');
  });

  test('en dessous de mille, rien n’est ajouté', () => {
    expect(ecrireUnNombre(0)).toBe('0');
    expect(ecrireUnNombre(999)).toBe('999');
  });
});
