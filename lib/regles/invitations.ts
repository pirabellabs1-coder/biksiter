/**
 * Les invitations.
 *
 * Pendant les deux premiers mois, on n'entre qu'avec le code d'un membre.
 * C'est ce qui permet de connaître, une par une, les personnes qui gardent
 * les vélos du quartier. Le quota est volontairement petit : on répond un peu
 * de la personne qu'on fait entrer.
 */

/** Ce qu'un membre peut faire entrer de personnes en même temps. */
export const INVITATIONS_PAR_MEMBRE = 5;

/** Passé ce délai, un code non utilisé s'éteint. */
export const VALIDITE_D_UNE_INVITATION_JOURS = 30;

/**
 * La part du quota encore disponible, entre 0 et 1.
 *
 * Elle sert à dessiner la jauge. Un quota dépassé — un code offert en plus,
 * par exemple — ne la fait pas déborder.
 */
export function partDesInvitationsRestantes(disponibles: number): number {
  if (INVITATIONS_PAR_MEMBRE <= 0) return 0;
  const restantes = Math.max(0, disponibles);
  return Math.min(1, restantes / INVITATIONS_PAR_MEMBRE);
}

/**
 * Combien de codes émettre pour qu'un membre retrouve son quota.
 *
 * Le quota compte les codes encore disponibles et les personnes invitées qui
 * n'ont pas encore mené leur première garde : c'est quand l'invité a fait ses
 * preuves que l'invitation est « rendue ». Rien n'est émis au-delà du quota.
 */
export function codesAEmettre(situation: {
  disponibles: number;
  invitesSansPremiereGarde: number;
}): number {
  return Math.max(
    0,
    INVITATIONS_PAR_MEMBRE -
      Math.max(0, situation.disponibles) -
      Math.max(0, situation.invitesSansPremiereGarde),
  );
}

/** Les caractères d'un code : sans 0/O ni 1/I, qu'on confond en les dictant. */
const ALPHABET_DES_CODES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Les caractères tirés au hasard d'un code. Le préfixe (le prénom) se
 * devine : seuls ces six-là protègent le code, soit 32⁶ possibilités, assez
 * pour qu'on ne tombe pas dessus en essayant, avec la limite par connexion.
 */
export const CARACTERES_ALEATOIRES_D_UN_CODE = 6;

/**
 * Un code d'invitation lisible : les quatre premières lettres du prénom de
 * l'invitant, sans accent, puis six caractères tirés au hasard —
 * « KARI-7K2MQX ». `octets` vient d'un générateur aléatoire sûr.
 */
export function formerUnCode(prenom: string, octets: Uint8Array): string {
  const debut =
    prenom
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 4) || 'BIKE';
  const fin = Array.from(octets.slice(0, CARACTERES_ALEATOIRES_D_UN_CODE), (octet) =>
    ALPHABET_DES_CODES.charAt(octet % ALPHABET_DES_CODES.length),
  ).join('');
  return `${debut.padEnd(4, 'X')}-${fin}`;
}
