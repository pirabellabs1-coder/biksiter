/**
 * Le désistement.
 *
 * Un stationnement annulé moins de douze heures avant le dépôt est un
 * désistement tardif : le bike sitter s'était organisé pour rien.
 *
 * Ce que le tardif ne déclenche pas : ni pénalité, ni note, ni score. La
 * règle 3 interdit tout classement entre membres. Il sert seulement à écrire
 * un message différent — s'excuser auprès du bike sitter plutôt que le
 * prévenir — et à repérer un membre qui se désiste systématiquement, ce que
 * décide un humain, pas un compteur.
 */

export const SEUIL_DESISTEMENT_TARDIF_HEURES = 12;

const HEURE_EN_MS = 60 * 60 * 1000;

export function heuresAvantLeDepot(debut: Date, annuleLe: Date): number {
  return (debut.getTime() - annuleLe.getTime()) / HEURE_EN_MS;
}

export function estUnDesistementTardif(debut: Date, annuleLe: Date): boolean {
  return heuresAvantLeDepot(debut, annuleLe) < SEUIL_DESISTEMENT_TARDIF_HEURES;
}
