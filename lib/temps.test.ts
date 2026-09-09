import { describe, expect, test } from 'vitest';

import { instantABruxelles, jourABruxelles } from './temps';

describe('les heures saisies sont des heures de Bruxelles', () => {
  test('une heure d’été est lue avec deux heures d’avance sur UTC', () => {
    const instant = instantABruxelles('2026-07-15', '14:00');
    expect(instant?.toISOString()).toBe('2026-07-15T12:00:00.000Z');
  });

  test('une heure d’hiver est lue avec une heure d’avance sur UTC', () => {
    const instant = instantABruxelles('2026-01-15', '14:00');
    expect(instant?.toISOString()).toBe('2026-01-15T13:00:00.000Z');
  });

  test('une saisie qui n’a pas la bonne forme ne donne pas d’instant', () => {
    expect(instantABruxelles('15/07/2026', '14:00')).toBeNull();
    expect(instantABruxelles('2026-07-15', '14h')).toBeNull();
  });
});

describe('le jour proposé par défaut est celui de Bruxelles', () => {
  test('juste avant minuit à Bruxelles, on est encore le même jour', () => {
    // 21h30 UTC en été, c'est 23h30 à Bruxelles : toujours le 15.
    expect(jourABruxelles(new Date('2026-07-15T21:30:00Z'))).toBe('2026-07-15');
  });

  test('après minuit à Bruxelles, le jour a changé même si UTC l’ignore', () => {
    // 22h30 UTC en été, c'est 00h30 le lendemain à Bruxelles. Un serveur qui
    // lirait sa propre horloge proposerait la veille pendant deux heures.
    expect(jourABruxelles(new Date('2026-07-15T22:30:00Z'))).toBe('2026-07-16');
  });
});
