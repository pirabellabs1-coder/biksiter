/**
 * Le désistement.
 *
 * Un stationnement annulé moins de deux heures avant le dépôt est un
 * désistement tardif. Deux heures, et non douze : une garde de trois heures
 * décidée le matin ne peut pas s'annuler douze heures à l'avance, et le seuil
 * rangeait parmi les désistements des annulations parfaitement normales.
 *
 * Ce que le tardif ne déclenche pas : ni pénalité, ni note, ni score. La
 * règle 3 interdit tout classement entre membres. Il sert seulement à écrire
 * un message différent — s'excuser auprès du bike sitter plutôt que le
 * prévenir — et à repérer un membre qui se désiste systématiquement, ce que
 * décide un humain, pas un compteur.
 */

export const SEUIL_DESISTEMENT_TARDIF_HEURES = 2;

const HEURE_EN_MS = 60 * 60 * 1000;

export function heuresAvantLeDepot(debut: Date, annuleLe: Date): number {
  return (debut.getTime() - annuleLe.getTime()) / HEURE_EN_MS;
}

export function estUnDesistementTardif(debut: Date, annuleLe: Date): boolean {
  return heuresAvantLeDepot(debut, annuleLe) < SEUIL_DESISTEMENT_TARDIF_HEURES;
}
