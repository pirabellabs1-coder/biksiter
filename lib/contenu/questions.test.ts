import { readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

import { SECTIONS_DES_CONDITIONS } from './conditions';
import { RUBRIQUES_DE_LA_FAQ } from './faq';
import { rubriquesAffichees, sansAccents } from './questions';

const sansTraduction = (texte: string, valeurs?: Record<string, unknown>) =>
  texte.replace(/\{(\w+)\}/g, (_, cle: string) => String(valeurs?.[cle] ?? ''));

describe('les questions fréquentes', () => {
  test('une recherche sans accents trouve une réponse accentuée', () => {
    expect(sansAccents('Vélo ÉLECTRIQUE')).toBe('velo electrique');
    const trouvees = rubriquesAffichees(RUBRIQUES_DE_LA_FAQ, sansTraduction, 'velo electrique');
    expect(trouvees.flatMap((r) => r.questions.map((q) => q.question))).toContain(
      'Quels vélos sont acceptés ?',
    );
  });

  test('une recherche sans résultat ne garde aucune rubrique', () => {
    expect(rubriquesAffichees(RUBRIQUES_DE_LA_FAQ, sansTraduction, 'zzzz')).toEqual([]);
  });

  test('les chiffres des réponses viennent des règles, jamais d’un texte figé', () => {
    const reponses = rubriquesAffichees(RUBRIQUES_DE_LA_FAQ, sansTraduction, '').flatMap((r) =>
      r.questions.map((q) => q.reponse),
    );
    for (const reponse of reponses) {
      expect(reponse).not.toMatch(/\{\w+\}/);
    }
  });

  test('les liens de la FAQ ne mènent qu’à des pages ouvertes sans compte', () => {
    const pagesPubliques = readdirSync(path.join(process.cwd(), 'app/(reseau)/(public)'), {
      withFileTypes: true,
    })
      .filter((entree) => entree.isDirectory())
      .map((entree) => `/${entree.name}`);
    const liens = RUBRIQUES_DE_LA_FAQ.flatMap((r) => r.questions.flatMap((q) => q.lien?.href ?? []));
    expect(liens.length).toBeGreaterThan(0);
    for (const lien of liens) {
      expect(pagesPubliques).toContain(lien);
    }
  });
});

describe('les conditions d’utilisation', () => {
  test('chaque section a une clé unique, pour qu’un lien puisse l’ouvrir', () => {
    const cles = SECTIONS_DES_CONDITIONS.map((s) => s.cle);
    expect(new Set(cles).size).toBe(cles.length);
  });

  test('les valeurs d’une section remplissent toutes ses accolades', () => {
    for (const section of SECTIONS_DES_CONDITIONS) {
      for (const paragraphe of section.paragraphes) {
        expect(sansTraduction(paragraphe, section.valeurs)).not.toMatch(/\{\w+\}|undefined/);
        for (const [, cle] of paragraphe.matchAll(/\{(\w+)\}/g)) {
          expect(section.valeurs).toHaveProperty(cle!);
        }
      }
    }
  });
});
