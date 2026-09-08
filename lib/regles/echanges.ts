/**
 * Les échanges autour d'un stationnement.
 *
 * Ce qui remplace le chat en temps réel, écarté parce qu'il crée une attente
 * de réponse que des bénévoles ne tiennent pas. Ici on écrit un message, il
 * part par courriel, et personne ne sait si l'autre l'a lu — pas d'accusé de
 * lecture, pas de « en train d'écrire », pas de délai de réponse affiché.
 * Rien qui permette de reprocher à quelqu'un d'avoir répondu le lendemain.
 */

export const LONGUEUR_MAXIMALE_DU_MESSAGE = 2000;

/**
 * On peut écrire dès la demande : un bike sitter a souvent une question avant
 * de répondre, et l'obliger à accepter pour la poser serait absurde.
 *
 * On peut encore écrire après la reprise : « j'ai retrouvé votre gant ».
 * Un stationnement refusé ou annulé, en revanche, se referme — laisser un fil
 * ouvert sur un refus, c'est inviter à le contester.
 */
export const ETATS_QUI_PERMETTENT_D_ECRIRE = [
  'demande',
  'accepte',
  'en_cours',
  'termine',
] as const;

export type EtatOuvertALaDiscussion =
  (typeof ETATS_QUI_PERMETTENT_D_ECRIRE)[number];

export function onPeutEcrire(etat: string): etat is EtatOuvertALaDiscussion {
  return (ETATS_QUI_PERMETTENT_D_ECRIRE as readonly string[]).includes(etat);
}

export type RefusDeMessage = 'vide' | 'trop_long' | 'etat_ferme';

export function refusDuMessage(
  corps: string,
  etat: string,
): RefusDeMessage | null {
  if (!onPeutEcrire(etat)) {
    return 'etat_ferme';
  }
  if (corps.trim() === '') {
    return 'vide';
  }
  if (corps.length > LONGUEUR_MAXIMALE_DU_MESSAGE) {
    return 'trop_long';
  }
  return null;
}
