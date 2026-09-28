import { describe, expect, test } from 'vitest';

import {
  INVITATIONS_PAR_MEMBRE,
  codesAEmettre,
  formerUnCode,
  partDesInvitationsRestantes,
} from './invitations';

describe('les invitations d’un membre', () => {
  test('un membre sans code disponible a une jauge vide', () => {
    expect(partDesInvitationsRestantes(0)).toBe(0);
  });

  test('un membre qui a tous ses codes a une jauge pleine', () => {
    expect(partDesInvitationsRestantes(INVITATIONS_PAR_MEMBRE)).toBe(1);
  });

  test('deux codes sur cinq remplissent deux cinquièmes de la jauge', () => {
    expect(partDesInvitationsRestantes(2)).toBeCloseTo(2 / 5);
  });

  test('un code offert au-delà du quota ne fait pas déborder la jauge', () => {
    expect(partDesInvitationsRestantes(INVITATIONS_PAR_MEMBRE + 3)).toBe(1);
  });
});

describe('l’émission des codes d’invitation', () => {
  test('un membre qui n’a encore invité personne reçoit tout son quota', () => {
    expect(codesAEmettre({ disponibles: 0, invitesSansPremiereGarde: 0 })).toBe(
      INVITATIONS_PAR_MEMBRE,
    );
  });

  test('un invité sans première garde occupe une place du quota', () => {
    expect(codesAEmettre({ disponibles: 3, invitesSansPremiereGarde: 2 })).toBe(0);
    expect(codesAEmettre({ disponibles: 2, invitesSansPremiereGarde: 2 })).toBe(1);
  });

  test('on n’émet jamais au-delà du quota', () => {
    expect(codesAEmettre({ disponibles: 7, invitesSansPremiereGarde: 0 })).toBe(0);
  });

  test('un code d’invitation reprend le prénom sans accent, puis six caractères lisibles', () => {
    const code = formerUnCode('Élodie', new Uint8Array([0, 1, 2, 3, 4, 5]));
    expect(code).toBe('ELOD-ABCDEF');
    expect(code).toMatch(/^[A-Z0-9-]{6,20}$/);
  });

  test('un prénom court est complété, et un code n’a ni 0, ni O, ni 1, ni I', () => {
    const code = formerUnCode('Al', new Uint8Array([255, 200, 150, 100, 50, 25]));
    expect(code.startsWith('ALXX-')).toBe(true);
    expect(code.slice(5)).not.toMatch(/[01OI]/);
  });
});

