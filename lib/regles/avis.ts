/**
 * Les avis.
 *
 * Du texte, et rien que du texte.
 *
 * Le CLAUDE.md avait écarté « les notes en étoiles sur un emplacement » en
 * disant que la note appartient à la personne. Cette règle-là tient : il n'y a
 * ni étoile, ni score, ni moyenne, ni « recommandé par 92 % ». Un emplacement
 * noté deviendrait un emplacement classé, et la règle 3 l'interdit.
 *
 * Ce qui est permis, et que les maquettes demandent : lire ce que quelqu'un a
 * écrit après y avoir laissé son vélo. Un avis se rattache donc à une garde
 * terminée — on ne parle que de ce qu'on a vécu, et une seule fois.
 */

export const LONGUEUR_MAXIMALE_DE_LAVIS = 1000;

/**
 * On n'écrit qu'après la reprise du vélo. Avant, il n'y a rien à raconter ;
 * et un avis écrit pendant la garde pèserait sur la personne qui l'héberge.
 */
export const ETAT_QUI_PERMET_UN_AVIS = 'termine';

export type RefusDAvis =
  | 'vide'
  | 'trop_long'
  | 'garde_non_terminee'
  | 'pas_le_cycliste'
  | 'deja_ecrit';

export function refusDeLAvis(avis: {
  corps: string;
  etatDeLaGarde: string;
  estLeCycliste: boolean;
  dejaEcrit: boolean;
}): RefusDAvis | null {
  if (!avis.estLeCycliste) {
    return 'pas_le_cycliste';
  }
  if (avis.etatDeLaGarde !== ETAT_QUI_PERMET_UN_AVIS) {
    return 'garde_non_terminee';
  }
  if (avis.dejaEcrit) {
    return 'deja_ecrit';
  }
  if (avis.corps.trim() === '') {
    return 'vide';
  }
  if (avis.corps.length > LONGUEUR_MAXIMALE_DE_LAVIS) {
    return 'trop_long';
  }
  return null;
}
