import { contientUnCaractereNul, ressembleAUnEmail } from './comptes';

/**
 * Les messages envoyés depuis la page Contact.
 */

/** Les sujets proposés : ils répartissent les messages entre les bénévoles. */
export const SUJETS_DE_CONTACT = {
  question: 'Question générale',
  garde: 'Problème avec une garde',
  abus: 'Signaler un abus',
  presse: 'Presse',
} as const;

export type SujetDeContact = keyof typeof SUJETS_DE_CONTACT;

export function estUnSujetDeContact(valeur: string): valeur is SujetDeContact {
  return Object.hasOwn(SUJETS_DE_CONTACT, valeur);
}

/** Un message plus long se lit mal et se traite mieux par e-mail. */
export const LONGUEUR_MAXIMALE_D_UN_MESSAGE = 5000;

/**
 * Au-delà, les messages d'une même adresse sur vingt-quatre heures ne sont plus
 * enregistrés : une personne qui attend une réponse n'écrit pas six fois, et
 * les bénévoles qui lisent la boîte ne doivent pas être noyés.
 *
 * Le signalement d'un abus n'est jamais limité : quelqu'un pourrait sinon
 * écrire cinq fois avec l'adresse d'une personne pour l'empêcher de signaler
 * ce qu'elle subit.
 */
export const MESSAGES_PAR_ADRESSE_PAR_JOUR = 5;

export type ErreursDeContact = Partial<
  Record<'email' | 'sujet' | 'message', string>
>;

export function verifierUnMessageDeContact(saisie: {
  email: string;
  sujet: string;
  message: string;
}): ErreursDeContact {
  const erreurs: ErreursDeContact = {};

  if (!ressembleAUnEmail(saisie.email)) {
    erreurs.email =
      'Indiquez une adresse e-mail valide, pour que nous puissions vous répondre.';
  }
  if (!estUnSujetDeContact(saisie.sujet)) {
    erreurs.sujet =
      'Choisissez le sujet qui correspond le mieux à votre message.';
  }
  if (contientUnCaractereNul(saisie.message)) {
    erreurs.message =
      'Votre message contient un caractère qui ne peut pas être enregistré. Essayez de le retaper plutôt que de le coller.';
  } else if (saisie.message.trim() === '') {
    erreurs.message = 'Écrivez votre message.';
  } else if (saisie.message.length > LONGUEUR_MAXIMALE_D_UN_MESSAGE) {
    erreurs.message = `Votre message peut contenir jusqu’à ${LONGUEUR_MAXIMALE_D_UN_MESSAGE} caractères.`;
  }

  return erreurs;
}

export function peutEncoreEcrire(
  sujet: SujetDeContact,
  messagesDesDernieres24Heures: number,
): boolean {
  return (
    sujet === 'abus' ||
    messagesDesDernieres24Heures < MESSAGES_PAR_ADRESSE_PAR_JOUR
  );
}
