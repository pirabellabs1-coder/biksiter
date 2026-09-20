import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

import { textesDuCentreDAide } from '../contenu/aide';
import { SECTIONS_DES_CONDITIONS, textesDesSections } from '../contenu/conditions';
import { textesDeLaFaq } from '../contenu/faq';
import { textesDesRegles } from '../contenu/regles';
import { REGLAGES_D_AFFICHAGE } from '../regles/accessibilite';
import { CATEGORIES_D_OFFRE } from '../regles/catalogue';
import {
  BADGES,
  FILTRES_DU_JOURNAL,
  NIVEAUX,
  PERIODES_DU_CLASSEMENT,
} from '../regles/progression';
import { PHRASES } from './phrases';
import { PHRASES_DE_L_ESPACE } from './phrases-de-l-espace';
import { PHRASES_DES_MAQUETTES } from './phrases-des-maquettes';
import { PHRASES_DU_SITE } from './phrases-du-site';

/**
 * Chaque texte écrit en français dans un écran existe en néerlandais et en
 * anglais. Sans ce test, une phrase oubliée s'affiche en français au milieu
 * d'un écran traduit, et personne ne s'en aperçoit avant un visiteur.
 */

const RACINES = [
  'app/(reseau)',
  'components/site',
  'components/membre',
  'components/app',
  'app/global-not-found.tsx',
];

function fichiers(chemin: string): string[] {
  const complet = path.join(process.cwd(), chemin);
  if (statSync(complet).isFile()) {
    return [complet];
  }
  return readdirSync(complet, { recursive: true, encoding: 'utf8' })
    .filter((nom) => /\.tsx?$/.test(nom))
    .map((nom) => path.join(complet, nom));
}

const CHAINE = String.raw`'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"`;
const APPEL = new RegExp(String.raw`\bp\(\s*(?:${CHAINE})\s*[,)]`, 'g');
const TERNAIRE = new RegExp(
  String.raw`\bp\(\s*[^()]*?\?\s*(?:${CHAINE})\s*:\s*(?:${CHAINE})`,
  'g',
);

function textesDesEcrans(): string[] {
  const textes = new Set<string>();
  for (const fichier of RACINES.flatMap(fichiers)) {
    const source = readFileSync(fichier, 'utf8');
    for (const trouve of [
      ...source.matchAll(APPEL),
      ...source.matchAll(TERNAIRE),
    ]) {
      for (const groupe of trouve.slice(1)) {
        if (groupe) {
          textes.add(groupe.replace(/\\(['"])/g, '$1'));
        }
      }
    }
  }
  // Les listes fermées dont les écrans affichent les libellés par p(variable).
  for (const texte of [
    ...NIVEAUX.map((n) => n.titre),
    ...BADGES.flatMap((b) => [b.titre, b.description]),
    ...PERIODES_DU_CLASSEMENT.map((x) => x.titre),
    ...FILTRES_DU_JOURNAL.map((f) => f.titre),
    ...CATEGORIES_D_OFFRE.map((c) => c.titre),
    ...REGLAGES_D_AFFICHAGE.flatMap((r) => [r.titre, r.description]),
    ...textesDuCentreDAide(),
    ...textesDeLaFaq(),
    ...textesDesRegles(),
    ...textesDesSections(SECTIONS_DES_CONDITIONS),
  ]) {
    textes.add(texte);
  }
  return [...textes];
}

function traduit(texte: string, langue: 'nl' | 'en'): boolean {
  return Boolean(
    PHRASES_DU_SITE[langue][texte] ??
    PHRASES_DE_L_ESPACE[langue][texte] ??
    PHRASES_DES_MAQUETTES[langue][texte] ??
    PHRASES[langue][texte.replaceAll('’', "'")],
  );
}

describe('la traduction des écrans', () => {
  const textes = textesDesEcrans();

  test('les écrans contiennent bien des textes à traduire', () => {
    expect(textes.length).toBeGreaterThan(100);
  });

  test('chaque texte d’un écran existe en néerlandais', () => {
    expect(textes.filter((texte) => !traduit(texte, 'nl'))).toEqual([]);
  });

  test('chaque texte d’un écran existe en anglais', () => {
    expect(textes.filter((texte) => !traduit(texte, 'en'))).toEqual([]);
  });

  test('une traduction garde les emplacements de la phrase française', () => {
    const emplacements = (texte: string) =>
      [...texte.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const langue of ['nl', 'en'] as const) {
      for (const [francais, traduction] of Object.entries({
        ...PHRASES_DU_SITE[langue],
        ...PHRASES_DE_L_ESPACE[langue],
        ...PHRASES_DES_MAQUETTES[langue],
      })) {
        expect(emplacements(traduction), francais).toEqual(
          emplacements(francais),
        );
      }
    }
  });
});
