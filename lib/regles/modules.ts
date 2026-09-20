/**
 * Les réglages du réseau qui s'activent ou non.
 *
 * Ils deviendront des réglages de l'administration, enregistrés en base.
 */

/** Le module « vélos volés » : fermé tant que l'administration ne l'ouvre pas. */
export const MODULE_VOLS_ACTIF = false;

/**
 * Ouverture des inscriptions : quand `false`, quiconque peut créer un compte
 * et rentre directement dans son espace. Quand `true`, on entre sur
 * invitation d'un membre et le formulaire pointe vers une liste d'attente.
 */
export const INSCRIPTION_SUR_INVITATION = false;
