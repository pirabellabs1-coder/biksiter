'use server';

import {
  RIEN_N_EST_ENCORE_ENVOYE,
  ressembleAUnEmail,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';

/** Longueur minimale d'un mot de passe. On ne demande ni majuscule, ni
 *  chiffre, ni caractère spécial : ces règles produisent des mots de passe
 *  plus courts et plus faciles à deviner, pas l'inverse. */
const LONGUEUR_MINIMALE_DU_MOT_DE_PASSE = 12;

export async function creerLeCompte(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
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

  // Le mot de passe n'est ni journalisé, ni renvoyé, ni conservé ailleurs que
  // dans cette variable : il sera haché (argon2id) au moment de l'écriture.
  const motDePasse = texte(donnees, 'motDePasse');
  if (motDePasse.length < LONGUEUR_MINIMALE_DU_MOT_DE_PASSE) {
    erreurs.motDePasse = `Choisissez un mot de passe d’au moins ${LONGUEUR_MINIMALE_DU_MOT_DE_PASSE} caractères. Une phrase courte fait très bien l’affaire.`;
  }

  const code = texte(donnees, 'code');
  if (code === '') {
    erreurs.code =
      'Le réseau s’ouvre sur invitation : indiquez le code qu’un membre vous a transmis.';
  }

  if (donnees.get('conditions') !== 'acceptees') {
    erreurs.conditions = 'Vous devez accepter les conditions générales.';
  }

  if (Object.keys(erreurs).length > 0) {
    return { statut: 'erreur', erreurs };
  }

  // TODO(persistance) : vérifier le code d'invitation, créer le membre avec un
  // mot de passe haché, puis envoyer le message de confirmation de l'e-mail.
  return { statut: 'valide', message: RIEN_N_EST_ENCORE_ENVOYE };
}
