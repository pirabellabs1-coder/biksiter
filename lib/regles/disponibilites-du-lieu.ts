import {
  DELAIS_DE_REPONSE,
  DUREES_MAX_HEURES,
  estUnJour,
  estUneHeure,
  minutesDe,
} from './creneau';

/**
 * Les disponibilités d'un lieu, telles que le bike sitter les règle : ses jours
 * d'accueil, sa plage horaire, la durée qu'il accepte, son délai de réponse et
 * ses fermetures exceptionnelles.
 *
 * Sans jour d'accueil, un lieu reste un brouillon : il ne sort dans aucune
 * recherche.
 */

export type DisponibilitesDuLieu = {
  jours: number[];
  ouverture: string;
  fermeture: string;
  dureeMaxHeures: number;
  delaiDeReponse: string;
  fermetures: string[];
};

/** Assez pour des vacances ou des travaux ; au-delà, mieux vaut mettre en pause. */
export const FERMETURES_MAXIMALES = 30;

export function motifsDesDisponibilites(d: DisponibilitesDuLieu): string[] {
  const motifs: string[] = [];
  if (d.jours.length === 0 || !d.jours.every((j) => Number.isInteger(j) && j >= 0 && j <= 6)) {
    motifs.push('Choisissez au moins un jour d’accueil.');
  }
  if (!estUneHeure(d.ouverture) || !estUneHeure(d.fermeture)) {
    motifs.push('Indiquez une plage horaire.');
  } else if (minutesDe(d.ouverture) >= minutesDe(d.fermeture)) {
    motifs.push('L’heure de fin doit suivre l’heure de début.');
  }
  if (!Object.hasOwn(DUREES_MAX_HEURES, String(d.dureeMaxHeures))) {
    motifs.push('Choisissez la durée que vous acceptez.');
  }
  if (!Object.hasOwn(DELAIS_DE_REPONSE, d.delaiDeReponse)) {
    motifs.push('Indiquez votre délai de réponse.');
  }
  if (d.fermetures.length > FERMETURES_MAXIMALES || !d.fermetures.every(estUnJour)) {
    motifs.push('Une date de fermeture n’est pas valable.');
  }
  return motifs;
}
