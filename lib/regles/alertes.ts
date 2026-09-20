import { distanceEnMetres, RAYON_DE_RECHERCHE_METRES, type Point } from './distance';

/**
 * Les alertes de recherche.
 *
 * Quand une recherche ne trouve rien, le membre peut demander à être prévenu
 * dès qu'un lieu ouvre près de l'endroit cherché. Une alerte prévient une
 * seule fois, et ne sonne plus pour un jour déjà passé.
 */

export type AlerteAPrevenir = Point & {
  membreId: string;
  jour: string | null;
  prevenueLe: Date | null;
};

export function alerteConcernee(
  alerte: AlerteAPrevenir,
  lieu: Point & { bikeSitterId: string },
  aujourdhui: string,
): boolean {
  if (alerte.prevenueLe !== null) return false;
  // On ne prévient pas quelqu'un de l'ouverture de son propre lieu.
  if (alerte.membreId === lieu.bikeSitterId) return false;
  if (alerte.jour !== null && alerte.jour < aujourdhui) return false;
  return distanceEnMetres(alerte, lieu) <= RAYON_DE_RECHERCHE_METRES;
}
