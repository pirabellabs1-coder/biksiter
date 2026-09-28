import {
  minutesDe,
  type Creneau,
} from '@/lib/regles/creneau';

/**
 * Ce que la liste des résultats et la fiche d'un emplacement ont besoin de
 * savoir — et rien de plus.
 *
 * L'adresse exacte n'y figure pas, et ne peut donc pas partir vers le
 * navigateur : avant acceptation, un cycliste voit une zone, une distance et
 * un temps de marche, jamais une rue ni un point sur un plan.
 */
export type BikeSitterAffiche = {
  reference: string;
  nom: string;
  titre: string;
  espace: string;
  velosAcceptes: readonly string[];
  places: number;
  acces: string;
  quartier: string;
  /** « À 280 m de votre destination » : la distance se lit en toutes lettres. */
  zone: string;
  distanceKm: number;
  marche: string;
  note: number | null;
  nombreDAvis: number;
  gardesMenees: number;
  identiteVerifiee: boolean;
  aDeLaPlace: boolean;
  /** Le bike sitter s'est dit disponible tout de suite (garde dans l'heure). */
  disponibleMaintenant: boolean;
  /** Le barème du bike sitter, en centimes par tranche. Sans barème : gratuit. */
  tarifs: readonly number[] | null;
  /** La première photo du lieu, ou null : jamais une image d'ambiance. */
  photo: string | null;
  bikeSitterId: string;
  prenom: string;
  /** La version de la photo de profil du bike sitter, ou null. */
  photoDuBikeSitter: string | null;
  /** Position de la pastille sur le plan, en pourcentage. Approximative. */
  x: number;
  y: number;
  /** Le centre de la zone, arrondi en base. Jamais le point exact. */
  latitude: number | null;
  longitude: number | null;
  ferme: boolean;
  abrite: boolean;
  ancrage: boolean;
};

/** Les douze photos d'ambiance de la maquette, servies depuis notre origine. */
const PHOTOS = Array.from(
  { length: 12 },
  (_, rang) => `/images/maquette-img-${rang + 1}.webp`,
);

export function photoDeLEspace(rang: number): string {
  return PHOTOS[Math.abs(rang) % PHOTOS.length];
}

/**
 * Où poser la pastille sur le plan.
 *
 * Elle se calcule à partir du rang et de la distance, jamais des coordonnées
 * réelles : un plan à l'échelle rendrait l'adresse devinable, ce que la règle
 * interdit avant acceptation. Le cercle d'environ trois cents mètres dessiné
 * par la feuille de style dit la même chose à l'écran.
 */
export function positionApproximative(
  rang: number,
  distanceKm: number,
): { x: number; y: number } {
  const angle = (rang * 137.5 * Math.PI) / 180;
  const rayon = Math.min(34, 8 + distanceKm * 16);
  return {
    x: Math.round((52 + Math.cos(angle) * rayon) * 10) / 10,
    y: Math.round((44 + Math.sin(angle) * rayon) * 10) / 10,
  };
}

/** « À 280 m » ou « À 1,1 km » : sous le kilomètre, on compte en mètres. */
export function distanceEcrite(distanceKm: number): string {
  if (distanceKm < 1) return `À ${Math.round(distanceKm * 100) * 10} m`;
  return `À ${distanceKm.toFixed(1).replace('.', ',')} km`;
}

/** Le temps de marche, à quinze kilomètres-heure… à pied, quatre et demi. */
export function tempsDeMarche(distanceKm: number): string {
  return `${Math.max(1, Math.round((distanceKm / 4.5) * 60))} min`;
}

/** Les heures entamées par le créneau cherché : une garde d'une heure et dix se paie deux. */
export function heuresEntamees(creneau: Creneau): number {
  const depot = minutesDe(creneau.heureDepot);
  const reprise =
    minutesDe(creneau.heureReprise) +
    (creneau.jourReprise > creneau.jourDepot ? 24 * 60 : 0);
  return Math.max(1, Math.ceil((reprise - depot) / 60));
}
