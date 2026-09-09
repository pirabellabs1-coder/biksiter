import { TYPES_VELO, type TypeVelo } from './velos';

/**
 * Les maillons.
 *
 * Ce sont des remerciements, pas une monnaie et pas un score.
 *
 * Le CLAUDE.md avait écarté « points, badges, niveaux » en notant qu'ils
 * fonctionnent entre inconnus et pas entre voisins — et en précisant de ne pas
 * les reproposer « sans raison nouvelle ». La raison nouvelle est arrivée : des
 * commerçants de quartier veulent remercier ceux qui accueillent, et il faut
 * bien une unité pour dire ce que couvre un contrôle vélo.
 *
 * La règle 3, elle, ne bouge pas. Un maillon n'ordonne personne :
 *   - le solde n'apparaît que sur son propre profil ;
 *   - rien, nulle part, ne trie ni ne filtre les membres par leur solde ;
 *   - un cycliste qui n'accueille jamais n'a pas de solde, et ce n'est pas un
 *     manque : faire garder son vélo ne coûte rien et n'en consomme aucun.
 *
 * Le jour où un écran classerait des membres par maillons, c'est cet écran
 * qu'il faudrait retirer, pas cette règle.
 */

/** Un maillon par jour entamé : ce qui compte est la place immobilisée. */
export const MAILLONS_PAR_JOUR = 1;

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
  const facteur = estEncombrant(garde.typeVelo) ? 2 : 1;
  return jours * MAILLONS_PAR_JOUR * facteur;
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
