import { describe, expect, test } from 'vitest';

import {
  CODES_SMS_PAR_HEURE,
  CODES_SMS_PAR_JOUR,
  CODES_SMS_REFUSES_PAR_JOUR,
  CONNEXIONS_REFUSEES,
  limiteAtteinte,
  MODIFICATIONS_DE_DEMANDE_PAR_JOUR,
  PROLONGATIONS_PAR_GARDE_ET_PAR_JOUR,
  REMISES_REFUSEES_PAR_JOUR,
} from './limites';
import { ESSAIS_PAR_CODE } from './remise';
import { ESSAIS_PAR_CODE_TELEPHONE } from './telephone';

describe('les limites d’essais et d’envois', () => {
  test('la limite est atteinte au nombre fixé, pas avant', () => {
    expect(limiteAtteinte(2, CODES_SMS_PAR_HEURE)).toBe(false);
    expect(limiteAtteinte(3, CODES_SMS_PAR_HEURE)).toBe(true);
  });

  test('on ne peut pas demander plus de codes SMS par jour que par heure multiplié par vingt-quatre', () => {
    expect(CODES_SMS_PAR_JOUR.nombre).toBeLessThan(
      CODES_SMS_PAR_HEURE.nombre * 24,
    );
  });

  test('redemander des codes ne permet pas d’essayer plus de dix combinaisons par jour', () => {
    const essaisSansCumul =
      CODES_SMS_PAR_JOUR.nombre * ESSAIS_PAR_CODE_TELEPHONE;
    expect(CODES_SMS_REFUSES_PAR_JOUR.nombre).toBeLessThan(essaisSansCumul);
    expect(CODES_SMS_REFUSES_PAR_JOUR.nombre).toBeLessThanOrEqual(10);
  });

  test('une personne qui se trompe quelques fois de mot de passe n’est pas bloquée', () => {
    expect(limiteAtteinte(5, CONNEXIONS_REFUSEES)).toBe(false);
  });

  test('règle 5 — les codes de remise refusés sont plafonnés à trois régénérations par jour', () => {
    expect(REMISES_REFUSEES_PAR_JOUR.nombre).toBe(ESSAIS_PAR_CODE * 3);
  });

  test('une demande se modifie quelques fois par jour, pas en boucle', () => {
    expect(limiteAtteinte(4, MODIFICATIONS_DE_DEMANDE_PAR_JOUR)).toBe(false);
    expect(limiteAtteinte(5, MODIFICATIONS_DE_DEMANDE_PAR_JOUR)).toBe(true);
  });

  test('une même garde ne reçoit pas plus de trois demandes de prolongation par jour', () => {
    expect(limiteAtteinte(3, PROLONGATIONS_PAR_GARDE_ET_PAR_JOUR)).toBe(true);
  });
});
