import { describe, expect, test } from 'vitest';

import {
  DERNIERE_REPRISE_MINUTES,
  DERNIER_DEPOT_MINUTES,
  PREMIER_DEPOT_MINUTES,
  depotsPossibles,
  heureDuLendemain,
  heureFrancaise,
  libelleDeLaReprise,
  reprisesPossibles,
} from './creneau';

describe('les heures de dépôt', () => {
  test('un dépôt se choisit par quart d’heure', () => {
    const creneaux = depotsPossibles(false, 0);
    expect(creneaux[1]! - creneaux[0]!).toBe(15);
  });

  test('on ne dépose pas avant six heures du matin', () => {
    expect(depotsPossibles(false, 0)[0]).toBe(PREMIER_DEPOT_MINUTES);
  });

  test('on ne dépose pas après vingt-deux heures', () => {
    const creneaux = depotsPossibles(false, 0);
    expect(creneaux.at(-1)).toBe(DERNIER_DEPOT_MINUTES);
  });

  test('le jour même, un créneau déjà passé n’est plus proposé', () => {
    // Il est 10h07 : le premier dépôt possible est 10h15, pas 10h00.
    const creneaux = depotsPossibles(true, 10 * 60 + 7);
    expect(creneaux[0]).toBe(10 * 60 + 15);
  });

  test('le jour même, on ne remonte jamais avant six heures', () => {
    expect(depotsPossibles(true, 2 * 60)[0]).toBe(PREMIER_DEPOT_MINUTES);
  });
});

describe('les heures de reprise', () => {
  test('une garde dure au moins une heure', () => {
    expect(reprisesPossibles(10 * 60)[0]).toBe(11 * 60);
  });

  test('une reprise se choisit d’heure en heure', () => {
    const reprises = reprisesPossibles(10 * 60);
    expect(reprises[1]! - reprises[0]!).toBe(60);
  });

  test('une reprise ne va pas au-delà de six heures le lendemain', () => {
    const reprises = reprisesPossibles(10 * 60);
    expect(reprises.at(-1)).toBeLessThanOrEqual(DERNIERE_REPRISE_MINUTES);
  });

  test('un dépôt trop tardif ne laisse aucune reprise possible', () => {
    expect(reprisesPossibles(DERNIERE_REPRISE_MINUTES)).toEqual([]);
  });
});

describe('l’écriture des heures', () => {
  test('l’heure se lit « 14h00 »', () => {
    expect(heureFrancaise('14:00')).toBe('14h00');
  });

  test('au-delà de minuit, la reprise dit « demain »', () => {
    expect(libelleDeLaReprise(26 * 60)).toBe('02h00 (demain)');
  });

  test('avant minuit, la reprise ne dit rien de plus', () => {
    expect(libelleDeLaReprise(18 * 60)).toBe('18h00');
  });

  test('les minutes au-delà de la journée retombent sur l’heure du lendemain', () => {
    expect(heureDuLendemain(25 * 60 + 30)).toBe('01:30');
  });
});
