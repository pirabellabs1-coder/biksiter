'use server';

import {
  RIEN_N_EST_ENCORE_ENVOYE,
  ressembleAUnEmail,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import {
  estUnAcces,
  estUnAncrage,
  estUnService,
  estUnVerrouillage,
  estUneIntemperie,
} from '@/lib/regles/caracteristiques';
import { estUnTypeEmplacementPrive } from '@/lib/regles/emplacements';
import { estUnTypeVelo } from '@/lib/regles/velos';

/** Le nombre de vélos qu'un particulier peut raisonnablement caser chez lui.
 *  Au-delà, ce n'est plus un emplacement, c'est un parking. */
const CAPACITE_MAXIMALE = 10;

export async function proposerUnEmplacement(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const erreurs: Record<string, string> = {};

  const prenom = texte(donnees, 'prenom');
  if (prenom === '') {
    erreurs.prenom = 'Indiquez votre prénom.';
  }

  const email = texte(donnees, 'email');
  if (!ressembleAUnEmail(email)) {
    erreurs.email = 'Indiquez une adresse e-mail valide.';
  }

  const adresse = texte(donnees, 'adresse');
  if (adresse === '') {
    erreurs.adresse = 'Indiquez l’adresse du lieu. Elle ne sera jamais publiée.';
  }

  // Règle 1 : la liste des types est la règle. Un type hors liste n'est pas
  // un champ mal rempli, c'est un emplacement qui n'a pas sa place ici.
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
    erreurs.acces = 'Indiquez le chemin à faire avec le vélo à la main.';
  }

  const ancrage = texte(donnees, 'ancrage');
  if (!estUnAncrage(ancrage)) {
    erreurs.ancrage = 'Indiquez à quoi le vélo peut être attaché.';
  }

  const velos = donnees.getAll('velos').filter(estUneChaine);
  if (velos.length === 0) {
    erreurs.velos = 'Cochez au moins un type de vélo que vous pouvez accueillir.';
  } else if (!velos.every(estUnTypeVelo)) {
    erreurs.velos = 'Un des types de vélo cochés n’existe pas.';
  }

  const services = donnees.getAll('services').filter(estUneChaine);
  if (!services.every(estUnService)) {
    erreurs.services = 'Un des services cochés n’existe pas.';
  }

  if (Object.keys(erreurs).length > 0) {
    return { statut: 'erreur', erreurs };
  }

  // TODO(persistance) : enregistrer la candidature, puis la mettre dans la
  // file de vérification humaine. Règle 2 — rien n'est publié avant ce
  // passage par une personne.
  return { statut: 'valide', message: RIEN_N_EST_ENCORE_ENVOYE };
}

function estUneChaine(valeur: FormDataEntryValue): valeur is string {
  return typeof valeur === 'string';
}
