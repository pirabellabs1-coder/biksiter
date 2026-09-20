/**
 * Les réglages du réseau qui s'activent ou non.
 *
 * Ils deviendront des réglages de l'administration, enregistrés en base.
 */

/** Le module « vélos volés » : fermé tant que l'administration ne l'ouvre pas. */
export const MODULE_VOLS_ACTIF = false;

/**
 * Pendant le lancement, on entre dans le réseau sur invitation d'un membre :
 * c'est ce qui fait grandir un quartier assez dense pour qu'un cycliste y
 * trouve une place.
 */
export const INSCRIPTION_SUR_INVITATION = true;
