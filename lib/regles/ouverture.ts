/**
 * Quand un quartier est prêt à ouvrir.
 *
 * Le site promet partout la même chose : « un quartier ouvre quand il compte
 * assez de bike sitters pour qu'un cycliste y trouve une place à chaque fois ».
 * Tant que ce « assez » restait un mot, personne ne pouvait le vérifier. Il est
 * ici, en un seul nombre.
 *
 * Ce sont les bike sitters qui comptent, jamais les cyclistes : un quartier
 * plein de gens qui cherchent une place et vide de gens qui en offrent n'est
 * pas près d'ouvrir, il est près de décevoir. Ouvrir trop tôt revient à
 * promettre une place qui n'existe pas, et c'est la seule promesse que ce
 * réseau ne peut pas se permettre de casser.
 *
 * Le seuil n'est pas une vérité : c'est un choix, et il se change ici, sur une
 * ligne. Cinq bike sitters, chacun pouvant proposer jusqu'à deux emplacements,
 * font une dizaine de places — assez pour qu'une demande trouve preneur même
 * quand deux personnes sont absentes et qu'une troisième refuse.
 */

export const BIKE_SITTERS_POUR_OUVRIR = 5;

/** En dessous, il n'y a rien à décider ; au-dessus, il y a quelqu'un à appeler. */
export const BIKE_SITTERS_POUR_Y_PENSER = 3;

export type MaturiteDUnQuartier = 'pret' | 'bientot' | 'trop-tot';

export function maturiteDUnQuartier(bikeSitters: number): MaturiteDUnQuartier {
  if (bikeSitters >= BIKE_SITTERS_POUR_OUVRIR) {
    return 'pret';
  }
  if (bikeSitters >= BIKE_SITTERS_POUR_Y_PENSER) {
    return 'bientot';
  }
  return 'trop-tot';
}

/**
 * Combien de bike sitters manquent encore.
 *
 * Utilisé pour l'administration seulement. On ne l'affiche jamais à un membre :
 * « il manque deux personnes dans votre quartier » transforme une attente en
 * dette, et personne n'a contracté celle-là.
 */
export function bikeSittersManquants(bikeSitters: number): number {
  return Math.max(0, BIKE_SITTERS_POUR_OUVRIR - bikeSitters);
}
