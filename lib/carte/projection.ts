/**
 * Placer des zones d'accueil sur une carte figurée.
 *
 * Les centres reçus sont déjà arrondis par la vue `emplacement_visible`
 * (maille d'environ 500 mètres) : aucune position exacte n'arrive jusqu'ici,
 * et rien ici ne pourrait en retrouver une.
 */

export type CentreDeZone = {
  latitude: number;
  longitude: number;
};

export type ZonePlacee = {
  /** Distance au bord gauche, en pourcentage de la largeur. */
  gauche: number;
  /** Distance au bord haut, en pourcentage de la hauteur. */
  haut: number;
};

/** Marge autour des zones, pour qu'aucune tache ne touche le bord. */
const MARGE = 0.16;

function etendue(valeurs: readonly number[]) {
  const minimum = Math.min(...valeurs);
  const amplitude = Math.max(...valeurs) - minimum;
  return { minimum, amplitude };
}

export function placerLesZones(zones: readonly CentreDeZone[]): ZonePlacee[] {
  const horizontal = etendue(zones.map((z) => z.longitude));
  const vertical = etendue(zones.map((z) => z.latitude));

  // Une seule zone, ou toutes au même endroit : elle se place au centre.
  const part = (valeur: number, axe: { minimum: number; amplitude: number }) =>
    axe.amplitude === 0 ? 0.5 : (valeur - axe.minimum) / axe.amplitude;

  return zones.map((zone) => ({
    gauche: (MARGE + part(zone.longitude, horizontal) * (1 - 2 * MARGE)) * 100,
    // La latitude croît vers le nord, l'écran vers le bas.
    haut: (MARGE + (1 - part(zone.latitude, vertical)) * (1 - 2 * MARGE)) * 100,
  }));
}
