/**
 * Le numéro de téléphone, et le code qu'on y envoie.
 *
 * Le SMS est le seul usage du téléphone dans ce produit : il sert à vérifier
 * qu'on joint bien la personne, et à rien d'autre. Les rappels de
 * stationnement passent par courriel — le coût par message en Belgique rend
 * un SMS de rappel déraisonnable pour une association.
 *
 * On n'accepte que les mobiles : un code envoyé sur une ligne fixe n'arrive
 * nulle part, et il vaut mieux le dire au moment de la saisie que laisser
 * quelqu'un attendre un SMS qui ne viendra jamais.
 */

export const VALIDITE_DU_CODE_MINUTES = 10;
export const ESSAIS_PAR_CODE_TELEPHONE = 3;
/** Assez long pour qu'on ne le devine pas, assez court pour le retenir. */
export const CHIFFRES_DU_CODE = 6;

const MINUTE_EN_MS = 60 * 1000;

/**
 * Ramène un numéro belge à sa forme internationale.
 *
 * Les gens écrivent leur numéro de six façons — 0470 12 34 56, +32 470/123.456,
 * 0032470123456. Toutes veulent dire la même chose, et refuser l'une d'elles
 * n'apprend rien à personne.
 */
export function normaliserLeNumero(saisie: string): string | null {
  const chiffres = saisie.replace(/[\s./()-]/g, '');

  let national: string;

  if (/^\+32[1-9][0-9]{7,8}$/.test(chiffres)) {
    national = chiffres.slice(3);
  } else if (/^0032[1-9][0-9]{7,8}$/.test(chiffres)) {
    national = chiffres.slice(4);
  } else if (/^0[1-9][0-9]{7,8}$/.test(chiffres)) {
    national = chiffres.slice(1);
  } else {
    return null;
  }

  return `+32${national}`;
}

/** Les mobiles belges commencent par 4 et comptent neuf chiffres en tout. */
export function estUnMobileBelge(numeroNormalise: string): boolean {
  return /^\+324[0-9]{8}$/.test(numeroNormalise);
}

export type RefusDeNumero = 'illisible' | 'pas_un_mobile';

export type LectureDuNumero =
  | { valide: true; numero: string }
  | { valide: false; motif: RefusDeNumero };

export function lireLeNumero(saisie: string): LectureDuNumero {
  const numero = normaliserLeNumero(saisie);

  if (!numero) {
    return { valide: false, motif: 'illisible' };
  }
  if (!estUnMobileBelge(numero)) {
    return { valide: false, motif: 'pas_un_mobile' };
  }
  return { valide: true, numero };
}

export type CodeTelephone = {
  emisLe: Date;
  essaisUtilises: number;
};

export function codeEncoreValide(
  code: CodeTelephone,
  maintenant: Date,
): boolean {
  const age = maintenant.getTime() - code.emisLe.getTime();
  return age < VALIDITE_DU_CODE_MINUTES * MINUTE_EN_MS;
}

export function essaisRestants(code: CodeTelephone): number {
  return Math.max(0, ESSAIS_PAR_CODE_TELEPHONE - code.essaisUtilises);
}

export type ResultatDeSaisieTelephone =
  | { accepte: true }
  | { accepte: false; motif: 'expire' | 'epuise' }
  | { accepte: false; motif: 'incorrect'; essaisRestants: number };

/**
 * L'expiration passe avant les essais : un code périmé n'en consomme pas,
 * sinon attendre suffirait à bloquer quelqu'un.
 */
export function verifierLeCode(
  code: CodeTelephone,
  correspond: boolean,
  maintenant: Date,
): ResultatDeSaisieTelephone {
  if (!codeEncoreValide(code, maintenant)) {
    return { accepte: false, motif: 'expire' };
  }
  if (essaisRestants(code) === 0) {
    return { accepte: false, motif: 'epuise' };
  }
  if (correspond) {
    return { accepte: true };
  }
  return {
    accepte: false,
    motif: 'incorrect',
    essaisRestants: essaisRestants(code) - 1,
  };
}
