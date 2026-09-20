import { describe, expect, test } from 'vitest';

import { MESSAGES } from './messages';
import { PHRASES } from './phrases';
import { phraseur, traduire, traduireTexte } from './traduction';

describe('la traduction de l’interface', () => {
  test('une clé est rendue dans la langue demandée', () => {
    expect(traduire('ld.how', 'fr')).toBe('Comment ça marche');
    expect(traduire('ld.how', 'nl')).toBe('Hoe het werkt');
  });

  test('chaque clé française existe en néerlandais et en anglais', () => {
    const francaises = Object.keys(MESSAGES.fr).sort();
    expect(Object.keys(MESSAGES.nl).sort()).toEqual(francaises);
    expect(Object.keys(MESSAGES.en).sort()).toEqual(francaises);
  });

  test('un texte français reste tel quel en français', () => {
    expect(traduireTexte('Accueil', 'fr')).toBe('Accueil');
  });

  test('une phrase connue est traduite entière', () => {
    expect(traduireTexte('Accueil', 'nl')).toBe('Start');
  });

  test('un libellé assemblé est traduit morceau par morceau', () => {
    expect(traduireTexte('3 emplacements', 'nl')).toBe('3 plekken');
  });

  test('un mot n’est pas remplacé à l’intérieur d’un mot plus long', () => {
    const texte = 'centre-ville';
    expect(traduireTexte(texte, 'nl')).not.toMatch(/Stad/);
  });

  test('les textes propres au site priment sur le dictionnaire général', () => {
    expect(traduireTexte('Signaler un abus', 'nl')).toBe('Misbruik melden');
  });

  test('l’apostrophe typographique retrouve la phrase écrite avec l’apostrophe droite', () => {
    const [francais, neerlandais] = Object.entries(PHRASES.nl).find(([cle]) =>
      cle.includes("'"),
    )!;
    expect(traduireTexte(francais.replaceAll("'", '’'), 'nl')).toBe(
      neerlandais,
    );
  });

  test('un texte inconnu reste en français plutôt qu’à moitié traduit', () => {
    const phrase =
      'Une phrase entièrement inconnue du dictionnaire, assez longue pour ne pas être découpée.';
    expect(traduireTexte(phrase, 'en')).toBe(phrase);
  });

  test('une phrase à emplacements se traduit entière, puis reçoit ses valeurs', () => {
    expect(phraseur('fr')('{prenom} vous invite', { prenom: 'Aïcha' })).toBe(
      'Aïcha vous invite',
    );
    expect(phraseur('nl')('{prenom} vous invite', { prenom: 'Aïcha' })).toBe(
      'Aïcha nodigt u uit',
    );
  });
});
