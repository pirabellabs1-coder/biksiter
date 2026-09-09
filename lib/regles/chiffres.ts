/**
 * Ce qu'on a le droit d'afficher comme chiffre.
 *
 * Une association qui avance un chiffre doit pouvoir dire d'où il vient. Deux
 * conséquences, portées ici plutôt que dans la page :
 *
 * 1. Un chiffre à zéro ne s'affiche pas. « 0 garde réalisée » sur une page
 *    d'accueil n'est pas de la transparence, c'est un aveu mal placé : le
 *    silence dit la même chose sans décourager la personne qui lit.
 * 2. Rien n'est arrondi vers le haut, ni « plus de », ni « près de ». Le
 *    nombre est celui de la base, écrit tel quel.
 *
 * Ce qu'on n'affiche pas du tout, et qui figurait sur la maquette : « aucun
 * vélo volé pendant une garde ». Rien dans le produit n'enregistre d'incident,
 * donc personne ici ne peut l'affirmer — et c'est exactement la phrase qu'il
 * ne faut pas avoir à retirer un jour.
 */

export type Chiffre = {
  valeur: string;
  libelle: string;
};

export type MesuresDuReseau = {
  gardesRealisees: number;
  habitantsQuiAccueillent: number;
  quartiersOuverts: number;
};

/** L'espace fine insécable des milliers, en typographie française. */
const ESPACE_FINE_INSECABLE = ' ';

export function ecrireUnNombre(nombre: number): string {
  return String(nombre).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ESPACE_FINE_INSECABLE,
  );
}

/**
 * Les libellés sont écrits aux deux nombres : « 1 quartier ouvert » et
 * « 9 quartiers ouverts » ne s'écrivent pas pareil, et un réseau qui démarre
 * passe forcément par le singulier.
 */
const LIBELLES: readonly {
  cle: keyof MesuresDuReseau;
  singulier: string;
  pluriel: string;
}[] = [
  {
    cle: 'gardesRealisees',
    singulier: 'garde réalisée',
    pluriel: 'gardes réalisées',
  },
  {
    cle: 'habitantsQuiAccueillent',
    singulier: 'habitant qui accueille',
    pluriel: 'habitants qui accueillent',
  },
  {
    cle: 'quartiersOuverts',
    singulier: 'quartier ouvert à Bruxelles',
    pluriel: 'quartiers ouverts à Bruxelles',
  },
];

export function chiffresAAfficher(mesures: MesuresDuReseau): Chiffre[] {
  return LIBELLES.filter(({ cle }) => mesures[cle] > 0).map(
    ({ cle, singulier, pluriel }) => ({
      valeur: ecrireUnNombre(mesures[cle]),
      libelle: mesures[cle] === 1 ? singulier : pluriel,
    }),
  );
}
