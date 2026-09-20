import { TYPES_VELO, type TypeVelo } from './velos';

/**
 * Les maillons — les « points » de l'interface.
 *
 * Ils remercient une garde menée à son terme, jamais une acceptation : c'est
 * le garde-fou de la règle 3, qui intègre désormais points, badges, niveaux et
 * classement. Le calcul suit la place immobilisée, pas la valeur du vélo.
 *
 * Un cycliste qui n'accueille jamais n'a pas de solde, et ce n'est pas un
 * manque : faire garder son vélo ne coûte rien et n'en consomme aucun.
 */

/**
 * Le barème : une garde menée à terme vaut cinq points, et chaque jour entamé
 * au-delà du premier en ajoute un. Ce qui compte est la place immobilisée.
 */
export const POINTS_PAR_GARDE = 5;
export const POINTS_PAR_JOUR_SUPPLEMENTAIRE = 1;

/**
 * Les vélos qui prennent la place de deux.
 *
 * Un cargo ne se range pas comme un vélo de ville : il condamne souvent le
 * reste de l'emplacement. Le remerciement suit l'encombrement, pas la valeur
 * du vélo — un vélo électrique à trois mille euros ne vaut pas plus qu'un
 * vieux vélo de ville.
 */
export const VELOS_ENCOMBRANTS: readonly TypeVelo[] = [
  'Cargo',
  'Longtail',
  'Tandem',
  'Avec remorque',
];

export function estEncombrant(velo: TypeVelo): boolean {
  return VELOS_ENCOMBRANTS.includes(velo);
}

const JOUR_EN_MS = 24 * 60 * 60 * 1000;

/**
 * Un jour entamé est un jour dû : quelqu'un qui garde un vélo de neuf heures
 * du matin à minuit a bien immobilisé sa place pour la journée.
 */
export function joursEntames(debut: Date, fin: Date): number {
  const duree = fin.getTime() - debut.getTime();
  if (duree <= 0) {
    return 0;
  }
  return Math.max(1, Math.ceil(duree / JOUR_EN_MS));
}

export function maillonsPourUneGarde(garde: {
  debut: Date;
  fin: Date;
  typeVelo: TypeVelo;
}): number {
  const jours = joursEntames(garde.debut, garde.fin);
  if (jours === 0) {
    return 0;
  }
  const points = POINTS_PAR_GARDE + (jours - 1) * POINTS_PAR_JOUR_SUPPLEMENTAIRE;
  return estEncombrant(garde.typeVelo) ? points * 2 : points;
}

/**
 * Un maillon n'est acquis qu'à la reprise du vélo, et retenu tant qu'une garde
 * est contestée. On ne remercie pas pour une garde qui s'est mal passée avant
 * de savoir ce qui s'est passé.
 */
export type EtatDuMaillon = 'acquis' | 'en_attente' | 'annule';

export function etatApresLaGarde(garde: {
  etat: string;
  conteste: boolean;
}): EtatDuMaillon | null {
  if (garde.etat !== 'termine') {
    return null;
  }
  return garde.conteste ? 'en_attente' : 'acquis';
}

export type Solde = {
  acquis: number;
  enAttente: number;
};

/** Ce qu'on peut dépenser : les maillons acquis, jamais ceux en attente. */
export function soldeDisponible(solde: Solde): number {
  return Math.max(0, solde.acquis);
}

/**
 * Un membre qui n'a jamais accueilli n'a pas de solde à montrer.
 *
 * Ce n'est pas zéro affiché en gris avec une barre de progression : c'est
 * l'absence de la carte. Un cycliste ne doit pas lire son profil comme un
 * échec.
 */
export function leSoldeSAffiche(gardesAccueillies: number): boolean {
  return gardesAccueillies > 0;
}

/** Garde-fou : la liste des vélos encombrants ne contient que de vrais types. */
export function listeDesEncombrantsCoherente(): boolean {
  return VELOS_ENCOMBRANTS.every((velo) =>
    (TYPES_VELO as readonly string[]).includes(velo),
  );
}
