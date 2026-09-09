import { describe, expect, test } from 'vitest';

import type { Creneau } from './capacite';
import {
  HEURE_DE_FERMETURE,
  HEURE_DOUVERTURE,
  friseDuJour,
  heureDuSegment,
  partDuSegment,
  resteDeLaPlace,
} from './disponibilite';

/** Le 8 septembre 2026, dans le fuseau du serveur qui exécute le test. */
function ce8Septembre(heure: number, minutes = 0): Date {
  const instant = new Date(2026, 8, 8);
  instant.setHours(heure, minutes, 0, 0);
  return instant;
}

const LE_JOUR = ce8Septembre(0);

function creneau(debut: number, fin: number): Creneau {
  return { debut: ce8Septembre(debut), fin: ce8Septembre(fin) };
}

describe('la frise montre ce qui est libre, sans dire qui occupe', () => {
  test('une journée sans stationnement est libre d’un bout à l’autre', () => {
    const frise = friseDuJour(LE_JOUR, [], 1);

    expect(frise).toHaveLength(1);
    expect(frise[0].libre).toBe(true);
    expect(frise[0].debutEnMinutes).toBe(0);
    expect(frise[0].finEnMinutes).toBe(
      (HEURE_DE_FERMETURE - HEURE_DOUVERTURE) * 60,
    );
  });

  test('une garde de la matinée découpe la journée en trois', () => {
    // Pris de 9h à 12h sur une place unique : libre avant, pris, libre après.
    const frise = friseDuJour(LE_JOUR, [creneau(9, 12)], 1);

    expect(frise.map((s) => s.libre)).toEqual([true, false, true]);
  });

  test('la marge de trente minutes ferme la place avant et après la garde', () => {
    const frise = friseDuJour(LE_JOUR, [creneau(9, 12)], 1);
    const pris = frise.find((s) => !s.libre);

    // 9h moins la marge, c'est 8h30 — soit 90 minutes après l'ouverture.
    expect(heureDuSegment(pris?.debutEnMinutes ?? -1)).toBe('08:30');
    // 12h plus la marge, c'est 12h30.
    expect(heureDuSegment(pris?.finEnMinutes ?? -1)).toBe('12:30');
  });

  test('un emplacement de deux places reste libre avec une seule garde', () => {
    const frise = friseDuJour(LE_JOUR, [creneau(9, 12)], 2);

    expect(frise).toHaveLength(1);
    expect(frise[0].libre).toBe(true);
  });

  test('deux gardes simultanées ferment un emplacement de deux places', () => {
    const frise = friseDuJour(LE_JOUR, [creneau(9, 12), creneau(10, 11)], 2);

    expect(frise.some((s) => !s.libre)).toBe(true);
  });

  test('une journée entièrement prise ne laisse aucun segment libre', () => {
    const frise = friseDuJour(LE_JOUR, [creneau(6, 23)], 1);

    expect(resteDeLaPlace(frise)).toBe(false);
  });

  test('une garde de la veille ne ferme pas la journée', () => {
    const veille: Creneau = {
      debut: new Date(2026, 8, 7, 9),
      fin: new Date(2026, 8, 7, 18),
    };
    expect(resteDeLaPlace(friseDuJour(LE_JOUR, [veille], 1))).toBe(true);
  });
});

describe('la frise se pose en CSS sans calcul dans le composant', () => {
  test('les parts des segments font un tout', () => {
    const frise = friseDuJour(LE_JOUR, [creneau(9, 12)], 1);
    const total = frise.reduce((somme, s) => somme + partDuSegment(s), 0);

    expect(total).toBeCloseTo(1, 6);
  });

  test('les heures affichées encadrent la journée utile', () => {
    expect(heureDuSegment(0)).toBe('07:00');
    expect(heureDuSegment((HEURE_DE_FERMETURE - HEURE_DOUVERTURE) * 60)).toBe(
      '22:00',
    );
  });
});
