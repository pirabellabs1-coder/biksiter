import { FUSEAU } from '@/lib/temps';

/**
 * Les formats de date des maquettes : « 18 SEPT », « 14h00–18h00 »,
 * « 4 heures ». Tout est lu à l'heure de Bruxelles, où se passent les gardes.
 */

const JOUR = new Intl.DateTimeFormat('fr-BE', {
  timeZone: FUSEAU,
  day: '2-digit',
});

const MOIS = new Intl.DateTimeFormat('fr-BE', {
  timeZone: FUSEAU,
  month: 'numeric',
});

/**
 * Les abréviations françaises des mois. Couper « sept. » à trois lettres
 * donnait « SEP », qui se lit en anglais.
 */
const MOIS_ABREGES = [
  'JANV',
  'FÉVR',
  'MARS',
  'AVR',
  'MAI',
  'JUIN',
  'JUIL',
  'AOÛT',
  'SEPT',
  'OCT',
  'NOV',
  'DÉC',
] as const;

const HEURE = new Intl.DateTimeFormat('fr-BE', {
  timeZone: FUSEAU,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function jourDuMois(instant: Date): string {
  return JOUR.format(instant);
}

/** « SEPT », « DÉC » : le mois abrégé, comme sur la pastille de date. */
export function moisAbrege(instant: Date): string {
  return MOIS_ABREGES[Number(MOIS.format(instant)) - 1] ?? '';
}

/** « 14h00 » : l'heure telle qu'on la dit, pas telle qu'on l'écrit en base. */
export function heure(instant: Date): string {
  return HEURE.format(instant).replace(':', 'h');
}

export function creneau(debut: Date, fin: Date): string {
  return `${heure(debut)}–${heure(fin)}`;
}

/**
 * La durée comptée, arrondie à l'heure supérieure : une garde de 3 h 10 se
 * dit « 4 heures » sur la carte, comme dans les maquettes.
 */
export function dureeEnHeures(debut: Date, fin: Date): number {
  return Math.max(1, Math.ceil((fin.getTime() - debut.getTime()) / 3_600_000));
}

export function duree(debut: Date, fin: Date): string {
  const heures = dureeEnHeures(debut, fin);
  return heures === 1 ? '1 heure' : `${heures} heures`;
}
