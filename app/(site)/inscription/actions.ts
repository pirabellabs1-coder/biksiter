'use server';

import { redirect } from 'next/navigation';

import { baseConfiguree } from '@/lib/bd/client';
import {
  EmailDejaPris,
  InvitationInvalide,
  creerLeMembre,
} from '@/lib/depot/membres';
import { ouvrirUneSession } from '@/lib/depot/sessions';
import {
  ERREUR_GENERALE,
  ressembleAUnEmail,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { poserLeCookieDeSession } from '@/lib/session';

/**
 * Douze caractères, et rien d'autre comme exigence.
 *
 * Imposer une majuscule, un chiffre et un caractère spécial produit des mots
 * de passe plus courts et plus prévisibles, pas l'inverse. Une phrase dont on
 * se souvient vaut mieux qu'un mot compliqué qu'on note sur un papier.
 */
const LONGUEUR_MINIMALE_DU_MOT_DE_PASSE = 12;

export async function creerLeCompte(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'La base de données n’est pas branchée : aucun compte ne peut être créé.',
      },
    };
  }

  const erreurs: Record<string, string> = {};

  const prenom = texte(donnees, 'prenom');
  if (prenom === '') {
    erreurs.prenom = 'Indiquez votre prénom.';
  }

  const nom = texte(donnees, 'nom');
  if (nom === '') {
    erreurs.nom = 'Indiquez votre nom.';
  }

  const email = texte(donnees, 'email');
  if (!ressembleAUnEmail(email)) {
    erreurs.email = 'Indiquez une adresse e-mail valide.';
  }

  // Le mot de passe ne quitte jamais cette fonction : il est haché avant
  // d'atteindre la base, et n'est ni journalisé, ni renvoyé au client.
  const motDePasse = texte(donnees, 'motDePasse');
  if (motDePasse.length < LONGUEUR_MINIMALE_DU_MOT_DE_PASSE) {
    erreurs.motDePasse = `Choisissez un mot de passe d’au moins ${LONGUEUR_MINIMALE_DU_MOT_DE_PASSE} caractères. Une phrase courte fait très bien l’affaire.`;
  }

  const code = texte(donnees, 'code');
  if (code === '') {
    erreurs.code =
      'Pendant son lancement, le réseau s’ouvre sur invitation : indiquez le code transmis par un membre.';
  }

  if (donnees.get('conditions') !== 'acceptees') {
    erreurs.conditions =
      'Merci d’accepter les conditions générales pour continuer.';
  }

  if (Object.keys(erreurs).length > 0) {
    return { statut: 'erreur', erreurs };
  }

  let membreId: string;

  try {
    const membre = await creerLeMembre({
      prenom,
      nom,
      email,
      motDePasse,
      codeDInvitation: code,
    });
    membreId = membre.id;
  } catch (erreur) {
    if (erreur instanceof InvitationInvalide) {
      return {
        statut: 'erreur',
        erreurs: {
          code: 'Ce code d’invitation n’existe pas, ou il a déjà servi.',
        },
      };
    }
    if (erreur instanceof EmailDejaPris) {
      return {
        statut: 'erreur',
        erreurs: {
          email:
            'Un compte existe déjà avec cette adresse : vous pouvez vous connecter.',
        },
      };
    }
    throw erreur;
  }

  await poserLeCookieDeSession(await ouvrirUneSession(membreId));

  // Le compte existe, mais il n'est pas encore vérifié : la suite du chemin
  // est la vérification d'identité, pas la carte.
  redirect('/inscription/verification');
}
