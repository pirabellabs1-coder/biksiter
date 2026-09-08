'use server';

import { revalidatePath } from 'next/cache';

import { baseConfiguree } from '@/lib/bd/client';
import { deposerUneCandidature } from '@/lib/depot/candidatures';
import { creerUnEmplacement } from '@/lib/depot/emplacements';
import { quartierParNom } from '@/lib/contenu/quartiers';
import { geocoder } from '@/lib/geocodage/geocodeur';
import {
  ERREUR_GENERALE,
  ressembleAUnEmail,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { RAYON_MINIMAL_DE_ZONE_METRES } from '@/lib/regles/adresse';
import {
  estUnAcces,
  estUnAncrage,
  estUnService,
  estUnVerrouillage,
  estUneIntemperie,
} from '@/lib/regles/caracteristiques';
import {
  EMPLACEMENTS_PAR_MEMBRE,
  estUnTypeEmplacementPrive,
} from '@/lib/regles/emplacements';
import { decisionDePublication } from '@/lib/regles/publication';
import { estUnTypeVelo } from '@/lib/regles/velos';
import { membreConnecte, membrePourLesRegles } from '@/lib/session';

/** Au-delà, ce n'est plus un emplacement chez quelqu'un, c'est un parking. */
const CAPACITE_MAXIMALE = 10;

function estUneChaine(valeur: FormDataEntryValue): valeur is string {
  return typeof valeur === 'string';
}

/**
 * Un seul formulaire pour deux situations, parce que c'est une seule action :
 * proposer un emplacement n'est pas un statut qu'on demande.
 *
 * - Un membre vérifié crée directement son emplacement, qui est publié.
 * - Tout le monde d'autre dépose une candidature, qui attend qu'une personne
 *   vérifie son identité (règle 2). Rien n'est publié dans ce cas.
 */
export async function proposerUnEmplacement(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'La base de données n’est pas branchée : rien ne peut être enregistré.',
      },
    };
  }

  const erreurs: Record<string, string> = {};
  const membre = await membreConnecte();

  const prenom = membre?.prenom ?? texte(donnees, 'prenom');
  if (prenom === '') {
    erreurs.prenom = 'Indiquez votre prénom.';
  }

  const email = membre?.email ?? texte(donnees, 'email');
  if (!ressembleAUnEmail(email)) {
    erreurs.email = 'Indiquez une adresse e-mail valide.';
  }

  const adresse = texte(donnees, 'adresse');
  if (adresse === '') {
    erreurs.adresse = 'Indiquez l’adresse du lieu. Elle ne sera jamais publiée.';
  }

  const nomDuQuartier = texte(donnees, 'quartier');
  const quartier = quartierParNom(nomDuQuartier);
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
  if (!Number.isInteger(capacite) || capacite < 1 || capacite > CAPACITE_MAXIMALE) {
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

  const precisionsSaisies = texte(donnees, 'precisions');
  const precisions = precisionsSaisies === '' ? null : precisionsSaisies;

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
    return { statut: 'erreur', erreurs };
  }

  // Le géocodage sert à poser le point exact, que la vue arrondira ensuite.
  // Une adresse hors de Bruxelles est refusée ici : c'est une règle de
  // territoire, pas un champ mal rempli.
  const situation = await geocoder(adresse);

  if (!situation.trouve && situation.motif === 'hors_zone') {
    return {
      statut: 'erreur',
      erreurs: {
        adresse:
          'Cette adresse est en Belgique mais hors de la région bruxelloise. Le réseau ne couvre pas encore votre commune.',
      },
    };
  }

  // Géocodeur muet ou adresse introuvable : on retombe sur le centre du
  // quartier. La zone devient plus floue, jamais plus précise — c'est le seul
  // sens dans lequel une approximation est acceptable ici.
  const position = situation.trouve
    ? situation.point
    : { latitude: quartier.latitude, longitude: quartier.longitude };

  // Un membre connecté et vérifié publie directement ; tout autre cas dépose
  // une candidature, qui attend le passage d'une personne (règle 2).
  if (membre) {
    const decision = decisionDePublication(await membrePourLesRegles());

    if (!decision.autorise && decision.motif === 'quota_atteint') {
      return {
        statut: 'erreur',
        erreurs: {
          [ERREUR_GENERALE]: `Vous proposez déjà ${EMPLACEMENTS_PAR_MEMBRE} emplacements, c’est le maximum. Retirez-en un pour en ajouter un autre.`,
        },
      };
    }

    if (decision.autorise) {
      await creerUnEmplacement({
        membreId: membre.id,
        reference: referenceLisible(quartier.nom, membre.prenom),
        type,
        quartier: quartier.nom,
        adresseExacte: adresse,
        latitude: position.latitude,
        longitude: position.longitude,
        rayonDeLaZone: RAYON_MINIMAL_DE_ZONE_METRES + 150,
        capacite,
        verrouillage,
        intemperie,
        acces,
        ancrage,
        services,
        velosAcceptes: velos,
        precisions,
        publie: true,
      });

      revalidatePath('/emplacements');
      revalidatePath('/mes-emplacements');

      return {
        statut: 'valide',
        message:
          'Votre emplacement est publié. Il apparaît en zone approximative : votre adresse reste chez vous jusqu’à ce que vous acceptiez une demande.',
      };
    }
  }

  await deposerUneCandidature({
    prenom,
    email,
    adresseExacte: adresse,
    type,
    quartier: quartier.nom,
    capacite,
    verrouillage,
    intemperie,
    acces,
    ancrage,
    services,
    velosAcceptes: velos,
    precisions,
  });

  return {
    statut: 'valide',
    message:
      'Votre candidature est enregistrée. Une personne la relit et vérifie votre identité avant toute publication : personne n’apparaît sur la carte sans être passé par là.',
  };
}

/**
 * Une référence lisible plutôt qu'un identifiant : elle se retrouve dans une
 * URL, dans un message de support, dans un e-mail.
 */
function referenceLisible(quartier: string, prenom: string): string {
  const sansAccent = (texte: string) =>
    texte
      .normalize('NFD')
      // Les signes diacritiques combinants, retirés après décomposition.
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const suffixe = Math.random().toString(36).slice(2, 6);
  return `${sansAccent(quartier)}-${sansAccent(prenom)}-${suffixe}`;
}
