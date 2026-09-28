import { cookies, headers } from 'next/headers';

import { laLangueChoisieSApplique } from './espaces';
import {
  type Cle,
  estUneLangue,
  type Langue,
  type Phraseur,
  phraseur,
  traduire,
} from './traduction';

export {
  LANGUES,
  NOMS_DES_LANGUES,
  type Cle,
  type Langue,
} from './traduction';

/** Le témoin où la langue choisie est gardée. */
export const TEMOIN_DE_LANGUE = 'langue';

/** Le français tant que la personne n'a pas choisi une autre langue. */
export async function langueCourante(): Promise<Langue> {
  // L'adresse de la page vient du middleware ; sans elle (une action, un
  // e-mail), la langue choisie s'applique.
  const chemin = (await headers()).get('x-chemin');
  if (chemin !== null && !laLangueChoisieSApplique(chemin)) return 'fr';
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
