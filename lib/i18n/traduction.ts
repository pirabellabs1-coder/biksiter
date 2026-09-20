import { MESSAGES } from './messages';
import { MOTS, PHRASES } from './phrases';
import { PHRASES_DE_L_ESPACE } from './phrases-de-l-espace';
import { PHRASES_DES_MAQUETTES } from './phrases-des-maquettes';
import { PHRASES_DU_SITE } from './phrases-du-site';

/**
 * La traduction, sans rien savoir de la requête : c'est ce qui la rend
 * testable, et utilisable aussi bien dans une page que dans un e-mail.
 */

export const LANGUES = ['fr', 'nl', 'en'] as const;
export type Langue = (typeof LANGUES)[number];

export type Cle = keyof (typeof MESSAGES)['fr'];

export function estUneLangue(valeur: string | undefined): valeur is Langue {
  return (LANGUES as readonly string[]).includes(valeur ?? '');
}

/** Un texte identifié par sa clé. Une clé absente retombe sur le français. */
export function traduire(cle: Cle, langue: Langue): string {
  const dans = MESSAGES[langue] as Record<string, string>;
  return dans[cle] ?? MESSAGES.fr[cle] ?? cle;
}

type Segment = readonly [RegExp, string, number];
const segmentsParLangue = new Map<Langue, readonly Segment[]>();

const echapper = (texte: string) =>
  texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Les morceaux à remplacer, du plus long au plus court : un fragment court ne
 * doit pas venir casser un fragment long qui le contient.
 */
function segmentsDe(langue: 'nl' | 'en'): readonly Segment[] {
  const deja = segmentsParLangue.get(langue);
  if (deja) {
    return deja;
  }

  const table = MOTS[langue];
  const segments = Object.keys(table)
    .sort((a, b) => b.length - a.length)
    .map((fragment): Segment => {
      // Bornes de mot, trait d'union compris : sans elles, « Ville » se
      // remplacerait dans « centre-ville », et « jour » dans « journal ».
      const avant = /^[a-zà-ÿ]/i.test(fragment) ? '(?<![a-zà-ÿ-])' : '';
      const apres = /[a-zà-ÿ]$/i.test(fragment) ? '(?![a-zà-ÿ-])' : '';
      return [
        new RegExp(avant + echapper(fragment) + apres, 'gi'),
        table[fragment] ?? fragment,
        fragment.length,
      ];
    });

  segmentsParLangue.set(langue, segments);
  return segments;
}

/**
 * Un texte écrit en français dans un écran, dans la langue demandée.
 *
 * D'abord la phrase entière. À défaut, les morceaux reconnus — ce qui sert
 * aux libellés assemblés à l'exécution (« 3 vélos · 400 m »). Sur une phrase
 * longue, seuls les fragments longs s'appliquent : un mot isolé remplacé au
 * milieu d'une phrase française donnerait une phrase à moitié traduite, et
 * une phrase entièrement française se lit mieux.
 */
export function traduireTexte(texte: string, langue: Langue): string {
  if (langue === 'fr') {
    return texte;
  }

  const brut = texte.trim();
  if (!brut) {
    return texte;
  }

  // Le dictionnaire est écrit avec l'apostrophe droite, les écrans avec
  // l'apostrophe typographique : les deux désignent la même phrase.
  const entiere =
    PHRASES_DU_SITE[langue][brut] ??
    PHRASES_DE_L_ESPACE[langue][brut] ??
    PHRASES_DES_MAQUETTES[langue][brut] ??
    PHRASES[langue][brut.replaceAll('’', "'")];
  if (entiere) {
    return texte.replace(brut, entiere);
  }

  const seuil = brut.length > 60 ? 25 : 0;
  let resultat = brut;
  for (const [expression, remplacement, taille] of segmentsDe(langue)) {
    if (taille >= seuil) {
      resultat = resultat.replace(expression, remplacement);
    }
  }
  return texte.replace(brut, resultat);
}

export type ValeursDUnePhrase = Readonly<Record<string, string | number>>;

/**
 * Traduit une phrase, puis y place les valeurs connues à l'exécution.
 *
 * La phrase se traduit entière, avec ses emplacements (« {prenom} vous
 * invite ») : traduire des morceaux autour d'une valeur donnerait l'ordre des
 * mots du français dans les autres langues.
 */
export type Phraseur = (texte: string, valeurs?: ValeursDUnePhrase) => string;

export function phraseur(langue: Langue): Phraseur {
  return (texte, valeurs) => {
    const traduit = traduireTexte(texte, langue);
    if (!valeurs) {
      return traduit;
    }
    return traduit.replace(/\{(\w+)\}/g, (tout, cle: string) =>
      Object.hasOwn(valeurs, cle) ? String(valeurs[cle]) : tout,
    );
  };
}
