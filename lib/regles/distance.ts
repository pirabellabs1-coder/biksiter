/**
 * La distance entre un lieu cherché et la zone d'un emplacement.
 *
 * Règle 4 : elle se calcule depuis le centre de la zone, jamais depuis la
 * position exacte, et elle s'arrondit. Une distance exacte, recalculée depuis
 * trois points de recherche différents, suffirait à retrouver la maison.
 */

export type Point = { latitude: number; longitude: number };

const RAYON_DE_LA_TERRE_METRES = 6_371_000;

export function distanceEnMetres(a: Point, b: Point): number {
  const rad = (degres: number) => (degres * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * RAYON_DE_LA_TERRE_METRES * Math.asin(Math.sqrt(h));
}

/** Arrondie à la centaine de mètres, jamais moins de cent. */
export function distanceArrondie(metres: number): number {
  return Math.max(100, Math.round(metres / 100) * 100);
}

/** « 400 m », « 1,2 km ». */
export function libelleDeDistance(metres: number): string {
  const arrondie = distanceArrondie(metres);
  if (arrondie < 1000) return `${arrondie} m`;
  return `${(arrondie / 1000).toFixed(1).replace('.', ',')} km`;
}

/** Les filtres de distance proposés. */
export const DISTANCES = [
  { metres: 500, libelle: 'moins de 500 m' },
  { metres: 1000, libelle: "moins d'1 km" },
  { metres: 2000, libelle: 'moins de 2 km' },
] as const;

/** Sans filtre, la recherche porte sur trois kilomètres autour du lieu. */
export const RAYON_DE_RECHERCHE_METRES = 3000;
