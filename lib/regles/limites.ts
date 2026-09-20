/**
 * Les limites d'essais et d'envois.
 *
 * Elles protègent ce qui se devine (un code à quatre chiffres, un mot de
 * passe, un code d'invitation) et ce qui coûte (un SMS se paie). Une personne
 * de bonne foi ne les atteint jamais : on ne se trompe pas dix fois de mot de
 * passe en un quart d'heure, et un SMS qui n'arrive pas se redemande une ou
 * deux fois.
 */

export type NatureDeTentative =
  | 'code_sms_envoye'
  | 'code_sms_refuse'
  | 'connexion_refusee'
  | 'courriel_de_compte'
  | 'consultation_invitation'
  | 'inscription_refusee'
  | 'message_envoye'
  | 'demande_envoyee'
  | 'remise_refusee'
  | 'demande_modifiee'
  | 'prolongation_demandee';

export type Limite = {
  nature: NatureDeTentative;
  nombre: number;
  fenetreMinutes: number;
};

const HEURE = 60;
const JOUR = 24 * HEURE;

/** Codes SMS demandés par un membre, sur une heure. */
export const CODES_SMS_PAR_HEURE: Limite = {
  nature: 'code_sms_envoye',
  nombre: 3,
  fenetreMinutes: HEURE,
};

/** Codes SMS demandés par un membre, ou envoyés à un même numéro, sur un jour. */
export const CODES_SMS_PAR_JOUR: Limite = {
  nature: 'code_sms_envoye',
  nombre: 5,
  fenetreMinutes: JOUR,
};

/**
 * Codes SMS faux sur un jour, tous codes confondus. Sans ce cumul, redemander
 * un code remettrait les trois essais à zéro, et il suffirait de recommencer
 * pour essayer les dix mille combinaisons.
 */
export const CODES_SMS_REFUSES_PAR_JOUR: Limite = {
  nature: 'code_sms_refuse',
  nombre: 10,
  fenetreMinutes: JOUR,
};

/** Mots de passe refusés pour une même adresse, sur un quart d'heure. */
export const CONNEXIONS_REFUSEES: Limite = {
  nature: 'connexion_refusee',
  nombre: 10,
  fenetreMinutes: 15,
};

/** Liens envoyés à une même adresse (confirmation, mot de passe), sur une heure. */
export const COURRIELS_DE_COMPTE: Limite = {
  nature: 'courriel_de_compte',
  nombre: 3,
  fenetreMinutes: HEURE,
};

/** Codes d'invitation consultés depuis une même connexion, sur une heure. */
export const CONSULTATIONS_D_INVITATION: Limite = {
  nature: 'consultation_invitation',
  nombre: 30,
  fenetreMinutes: HEURE,
};

/** Inscriptions refusées avec un même code d'invitation, sur un jour. */
export const INSCRIPTIONS_REFUSEES: Limite = {
  nature: 'inscription_refusee',
  nombre: 5,
  fenetreMinutes: JOUR,
};

/**
 * Messages écrits par un membre, sur une heure. Largement assez pour
 * s'organiser ; au-delà, c'est une insistance que l'autre subit par e-mail.
 */
export const MESSAGES_PAR_HEURE: Limite = {
  nature: 'message_envoye',
  nombre: 30,
  fenetreMinutes: HEURE,
};

/** Demandes de garde envoyées par un membre, sur un jour. */
export const DEMANDES_PAR_JOUR: Limite = {
  nature: 'demande_envoyee',
  nombre: 10,
  fenetreMinutes: JOUR,
};

/**
 * Codes de remise refusés pour une même garde et une même remise, sur un jour.
 * Sans ce plafond, la régénération après trois essais permettrait d'essayer
 * les dix mille combinaisons en quelques minutes.
 */
export const REMISES_REFUSEES_PAR_JOUR: Limite = {
  nature: 'remise_refusee',
  nombre: 9,
  fenetreMinutes: JOUR,
};

/**
 * Modifications de demandes par un membre, sur un jour. Chacune prévient le
 * bike sitter : au-delà, ce n'est plus ajuster sa demande, c'est insister.
 */
export const MODIFICATIONS_DE_DEMANDE_PAR_JOUR: Limite = {
  nature: 'demande_modifiee',
  nombre: 5,
  fenetreMinutes: JOUR,
};

/** Demandes de prolongation pour une même garde, sur un jour. */
export const PROLONGATIONS_PAR_GARDE_ET_PAR_JOUR: Limite = {
  nature: 'prolongation_demandee',
  nombre: 3,
  fenetreMinutes: JOUR,
};

export function limiteAtteinte(tentatives: number, limite: Limite): boolean {
  return tentatives >= limite.nombre;
}
