/**
 * Le territoire couvert.
 *
 * Le réseau est bruxellois. Un emplacement géocodé hors de la Région n'est pas
 * une erreur de saisie à corriger silencieusement : c'est une adresse qu'on ne
 * peut pas accueillir, et il vaut mieux le dire que de publier un point à
 * Anvers sur une carte de Bruxelles.
 *
 * Les bornes sont volontairement un peu larges : mieux vaut accepter une
 * commune limitrophe qu'un refus incompréhensible pour quelqu'un qui habite à
 * cinquante mètres de la frontière régionale.
 */

export type PointGeographique = {
  latitude: number;
  longitude: number;
};

/** Région de Bruxelles-Capitale, avec une marge de quelques kilomètres. */
export const BORNES_DE_BRUXELLES = {
  latitudeMinimale: 50.75,
  latitudeMaximale: 50.94,
  longitudeMinimale: 4.21,
  longitudeMaximale: 4.51,
} as const;

export function estDansLaZoneCouverte(point: PointGeographique): boolean {
  return (
    point.latitude >= BORNES_DE_BRUXELLES.latitudeMinimale &&
    point.latitude <= BORNES_DE_BRUXELLES.latitudeMaximale &&
    point.longitude >= BORNES_DE_BRUXELLES.longitudeMinimale &&
    point.longitude <= BORNES_DE_BRUXELLES.longitudeMaximale
  );
}

/** Le centre de la zone, pour cadrer une carte quand il n'y a rien à montrer. */
export const CENTRE_DE_BRUXELLES: PointGeographique = {
  latitude: 50.8465,
  longitude: 4.3517,
};
