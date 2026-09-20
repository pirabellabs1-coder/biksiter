import { cookies } from 'next/headers';

import {
  type Cle,
  estUneLangue,
  type Langue,
  type Phraseur,
  phraseur,
  traduire,
} from './traduction';

export { LANGUES, type Cle, type Langue } from './traduction';

/**
 * La langue de l'interface.
 *
 * Bruxelles est bilingue, et l'anglais couvre les résidents internationaux :
 * trois langues au lancement. Le français est la source ; ce qui n'est pas
 * traduit reste en français.
 */
export const NOMS_DES_LANGUES: Record<Langue, string> = {
  fr: 'Français',
  nl: 'Nederlands',
  en: 'English',
};

/** Le témoin où la langue choisie est gardée. */
export const TEMOIN_DE_LANGUE = 'langue';

/** Le français tant que la personne n'a pas choisi une autre langue. */
export async function langueCourante(): Promise<Langue> {
  const choisie = (await cookies()).get(TEMOIN_DE_LANGUE)?.value;
  return estUneLangue(choisie) ? choisie : 'fr';
}

export type Textes = {
  langue: Langue;
  /** Un texte du dictionnaire, par sa clé. */
  t: (cle: Cle) => string;
  /** Un texte écrit en français dans l'écran, traduit s'il est connu. */
  p: Phraseur;
};

/** Les outils de traduction d'une page, qui connaissent déjà la langue. */
export async function textes(): Promise<Textes> {
  const langue = await langueCourante();
  return {
    langue,
    t: (cle) => traduire(cle, langue),
    p: phraseur(langue),
  };
}
