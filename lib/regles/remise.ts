/**
 * Règle 5 — le vélo ne change d'état qu'avec un code.
 *
 * Celui qui remet le vélo détient le code, celui qui le reçoit le saisit.
 * Quatre chiffres, parce qu'on doit pouvoir se les dicter à voix haute dans
 * une cave sans réseau, avec des gants. Le QR code et le Bluetooth ont été
 * écartés pour cette raison précise — ne pas les reproposer.
 *
 * Trois essais, puis le code est régénéré et redonné à celui qui remet.
 */

export const VALIDITE_CODE_HEURES = 6;
export const ESSAIS_PAR_CODE = 3;

const HEURE_EN_MS = 60 * 60 * 1000;

export type Code = {
  chiffres: string;
  emisLe: Date;
  essaisUtilises: number;
};

export type ResultatDeSaisie =
  | { accepte: true }
  | { accepte: false; motif: 'expire' }
  | { accepte: false; motif: 'epuise' }
  | {
      accepte: false;
      motif: 'incorrect';
      essaisRestants: number;
      aRegenerer: boolean;
    };

export function codeEncoreValide(code: Code, maintenant: Date): boolean {
  const age = maintenant.getTime() - code.emisLe.getTime();
  return age < VALIDITE_CODE_HEURES * HEURE_EN_MS;
}

export function essaisRestants(code: Code): number {
  return Math.max(0, ESSAIS_PAR_CODE - code.essaisUtilises);
}

/**
 * L'expiration est vérifiée avant les essais : un code périmé ne consomme pas
 * d'essai, sinon attendre suffirait à bloquer une remise.
 */
export function saisirLeCode(
  code: Code,
  saisie: string,
  maintenant: Date,
): ResultatDeSaisie {
  if (!codeEncoreValide(code, maintenant)) {
    return { accepte: false, motif: 'expire' };
  }

  if (essaisRestants(code) === 0) {
    return { accepte: false, motif: 'epuise' };
  }

  if (saisie === code.chiffres) {
    return { accepte: true };
  }

  const restants = essaisRestants(code) - 1;
  return {
    accepte: false,
    motif: 'incorrect',
    essaisRestants: restants,
    aRegenerer: restants === 0,
  };
}
