/**
 * La capacité d'un emplacement dans le temps.
 *
 * Deux stationnements ne peuvent pas se toucher : il faut trente minutes entre
 * la reprise d'un vélo et le dépôt du suivant. Ce n'est pas une marge
 * technique, c'est le temps réel qu'il faut à un bike sitter pour être
 * disponible deux fois de suite sans courir.
 */

export const MARGE_ENTRE_STATIONNEMENTS_MINUTES = 30;

/**
 * Les états d'une garde qui occupent une place chez le bike sitter.
 *
 * Une demande en attente n'occupe rien : elle attend une réponse. Une garde en
 * litige occupe encore la place, puisque le vélo y est toujours. C'est la
 * seule liste à consulter pour savoir si une place est prise — celle du
 * retrait d'un lieu (`emplacements.ts`) répond à une autre question.
 */
export const ETATS_QUI_OCCUPENT_UNE_PLACE = [
  'accepte',
  'arrivee',
  'en_cours',
  'reprise_demandee',
  'litige',
] as const;

const MINUTE_EN_MS = 60 * 1000;

export type Creneau = {
  debut: Date;
  fin: Date;
};

export function dureeEnMinutes(creneau: Creneau): number {
  return (creneau.fin.getTime() - creneau.debut.getTime()) / MINUTE_EN_MS;
}

/**
 * Vrai si les deux créneaux se chevauchent une fois la marge appliquée de part
 * et d'autre du créneau déjà accepté.
 */
export function seChevauchent(existant: Creneau, demande: Creneau): boolean {
  const marge = MARGE_ENTRE_STATIONNEMENTS_MINUTES * MINUTE_EN_MS;
  const debutBloque = existant.debut.getTime() - marge;
  const finBloquee = existant.fin.getTime() + marge;

  return demande.debut.getTime() < finBloquee && demande.fin.getTime() > debutBloque;
}

/**
 * Un emplacement peut accueillir plusieurs vélos à la fois ; la place est
 * libre tant que le nombre de stationnements qui se chevauchent reste sous la
 * capacité annoncée.
 */
export function laPlaceEstLibre(
  demande: Creneau,
  dejaAcceptes: readonly Creneau[],
  capacite: number,
): boolean {
  const simultanes = dejaAcceptes.filter((existant) =>
    seChevauchent(existant, demande),
  ).length;

  return simultanes < capacite;
}

/**
 * Le plus grand nombre de vélos présents en même temps parmi les
 * stationnements déjà acceptés.
 *
 * Sert à répondre à une question qui se pose quand un bike sitter corrige sa
 * fiche : peut-il annoncer moins de places qu'il n'en a déjà promis ?
 */
export function affluenceMaximale(acceptes: readonly Creneau[]): number {
  return acceptes.reduce((maximum, creneau) => {
    const simultanes = acceptes.filter(
      (autre) => autre === creneau || seChevauchent(autre, creneau),
    ).length;
    return Math.max(maximum, simultanes);
  }, 0);
}

/**
 * Réduire la capacité ne peut pas déloger un vélo déjà accepté : le bike
 * sitter s'est engagé, et le cycliste s'est organisé. Il peut baisser sa
 * capacité pour l'avenir, jamais en dessous de ce qu'il a déjà promis.
 */
export function capaciteSuffisante(
  acceptes: readonly Creneau[],
  nouvelleCapacite: number,
): boolean {
  return nouvelleCapacite >= affluenceMaximale(acceptes);
}
