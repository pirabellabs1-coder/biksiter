import { quartierParNom, type Quartier } from '@/lib/contenu/quartiers';
import {
  estUnAcces,
  estUnAncrage,
  estUnService,
  estUnVerrouillage,
  estUneIntemperie,
  type Acces,
  type Ancrage,
  type Intemperie,
  type Service,
  type Verrouillage,
} from '@/lib/regles/caracteristiques';
import {
  estUnTypeEmplacementPrive,
  type TypeEmplacementPrive,
} from '@/lib/regles/emplacements';
import { estUnTypeVelo, type TypeVelo } from '@/lib/regles/velos';

import { ressembleAUnEmail, texte } from './etat';

/**
 * La lecture d'un formulaire d'emplacement.
 *
 * Décrire un emplacement et le corriger posent exactement les mêmes questions,
 * et doivent donc appliquer exactement les mêmes règles. Cette fonction est le
 * seul endroit qui les applique — deux copies auraient divergé au premier
 * ajout de champ.
 *
 * Elle ne touche ni au réseau ni à la base : le géocodage et l'écriture
 * viennent après, dans l'action qui l'appelle.
 */

/** Au-delà, ce n'est plus un emplacement chez quelqu'un, c'est un parking. */
export const CAPACITE_MAXIMALE = 10;

export type ChampsDEmplacement = {
  prenom: string;
  email: string;
  adresse: string;
  quartier: Quartier;
  type: TypeEmplacementPrive;
  capacite: number;
  verrouillage: Verrouillage;
  intemperie: Intemperie;
  acces: Acces;
  ancrage: Ancrage;
  services: Service[];
  velosAcceptes: TypeVelo[];
  precisions: string | null;
};

export type LectureDUnEmplacement =
  | { valide: true; champs: ChampsDEmplacement }
  | { valide: false; erreurs: Record<string, string> };

function estUneChaine(valeur: FormDataEntryValue): valeur is string {
  return typeof valeur === 'string';
}

export function lireLesChampsDEmplacement(
  donnees: FormData,
  identite: { prenom: string; email: string } | null,
): LectureDUnEmplacement {
  const erreurs: Record<string, string> = {};

  // Un membre connecté n'a pas à ressaisir son identité ; un visiteur si.
  const prenom = identite?.prenom ?? texte(donnees, 'prenom');
  if (prenom === '') {
    erreurs.prenom = 'Indiquez votre prénom.';
  }

  const email = identite?.email ?? texte(donnees, 'email');
  if (!ressembleAUnEmail(email)) {
    erreurs.email = 'Indiquez une adresse e-mail valide.';
  }

  const adresse = texte(donnees, 'adresse');
  if (adresse === '') {
    erreurs.adresse =
      'Indiquez l’adresse du lieu. Elle restera confidentielle.';
  }

  const quartier = quartierParNom(texte(donnees, 'quartier'));
  if (!quartier) {
    erreurs.quartier = 'Choisissez le quartier le plus proche dans la liste.';
  }

  // Règle 1 : un type hors liste n'est pas un champ mal rempli, c'est un
  // emplacement qui n'a pas sa place ici.
  const type = texte(donnees, 'type');
  if (!estUnTypeEmplacementPrive(type)) {
    erreurs.type = 'Choisissez un type d’emplacement dans la liste.';
  }

  const capacite = Number.parseInt(texte(donnees, 'capacite'), 10);
  if (
    !Number.isInteger(capacite) ||
    capacite < 1 ||
    capacite > CAPACITE_MAXIMALE
  ) {
    erreurs.capacite = `Indiquez un nombre de vélos entre 1 et ${CAPACITE_MAXIMALE}.`;
  }

  const verrouillage = texte(donnees, 'verrouillage');
  if (!estUnVerrouillage(verrouillage)) {
    erreurs.verrouillage = 'Indiquez comment l’emplacement se ferme.';
  }

  const intemperie = texte(donnees, 'intemperie');
  if (!estUneIntemperie(intemperie)) {
    erreurs.intemperie = 'Indiquez si le vélo est à l’abri.';
  }

  const acces = texte(donnees, 'acces');
  if (!estUnAcces(acces)) {
    erreurs.acces = 'Indiquez comment accéder au lieu avec le vélo.';
  }

  const ancrage = texte(donnees, 'ancrage');
  if (!estUnAncrage(ancrage)) {
    erreurs.ancrage = 'Indiquez à quoi le vélo peut être attaché.';
  }

  const velos = donnees.getAll('velos').filter(estUneChaine);
  if (velos.length === 0) {
    erreurs.velos =
      'Cochez au moins un type de vélo que vous pouvez accueillir.';
  } else if (!velos.every(estUnTypeVelo)) {
    erreurs.velos = 'Un des types de vélo cochés n’est pas reconnu.';
  }

  const services = donnees.getAll('services').filter(estUneChaine);
  if (!services.every(estUnService)) {
    erreurs.services = 'Un des services cochés n’est pas reconnu.';
  }

  if (
    Object.keys(erreurs).length > 0 ||
    !quartier ||
    !estUnTypeEmplacementPrive(type) ||
    !estUnVerrouillage(verrouillage) ||
    !estUneIntemperie(intemperie) ||
    !estUnAcces(acces) ||
    !estUnAncrage(ancrage) ||
    !velos.every(estUnTypeVelo) ||
    !services.every(estUnService)
  ) {
    return { valide: false, erreurs };
  }

  const precisions = texte(donnees, 'precisions');

  return {
    valide: true,
    champs: {
      prenom,
      email,
      adresse,
      quartier,
      type,
      capacite,
      verrouillage,
      intemperie,
      acces,
      ancrage,
      services,
      velosAcceptes: velos,
      precisions: precisions === '' ? null : precisions,
    },
  };
}
