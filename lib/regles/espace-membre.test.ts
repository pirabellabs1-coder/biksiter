import { describe, expect, test } from 'vitest';

import {
  CRITERES,
  motifsDeLAvis,
  onPeutEncoreDeposer,
  publieSeulLe,
} from './avis-de-garde';
import {
  AUTEUR_DU_CONSTAT,
  codeEmissible,
  constatPossible,
  estUnEtatDeclarable,
  estUnRangDePhoto,
  leRetourEstMoinsBon,
  motifsDuConstat,
  noteDuConstat,
  photosDuConstatVisibles,
  refusDeLaSaisie,
  refusPourLaBatteriePossible,
  retirerLesCaracteresDeControle,
  titreDeLaPhoto,
} from './constat';
import {
  distanceArrondie,
  distanceEnMetres,
  libelleDeDistance,
} from './distance';
import { dansLaPlage, minutesDAttente, presence } from './notifications';

const JOUR = 24 * 60 * 60 * 1000;

describe('le constat d’état', () => {
  const complet = {
    rangs: [0, 1],
    etat: 'ok',
    note: '',
    electrique: false,
    batterieVerifiee: false,
  };

  test('un constat demande les photos des deux côtés du vélo et un état', () => {
    expect(motifsDuConstat({ ...complet, rangs: [0], etat: '' })).toEqual([
      'Ajoutez les photos du côté gauche et du côté droit du vélo.',
      "Indiquez l'état constaté.",
    ]);
    expect(motifsDuConstat(complet)).toEqual([]);
  });

  test('les photos de l’avant et des dégâts existants sont facultatives', () => {
    expect(motifsDuConstat({ ...complet, rangs: [2, 3] })).toContain(
      'Ajoutez les photos du côté gauche et du côté droit du vélo.',
    );
    expect(motifsDuConstat({ ...complet, rangs: [0, 1, 3] })).toEqual([]);
    expect(estUnRangDePhoto(3)).toBe(true);
    expect(estUnRangDePhoto(4)).toBe(false);
  });

  test('un défaut visible se décrit', () => {
    expect(motifsDuConstat({ ...complet, etat: 'defaut', note: ' ' })).toContain(
      'Décrivez le défaut constaté.',
    );
  });

  test('pour un vélo électrique, le cycliste confirme avoir vérifié la batterie', () => {
    expect(motifsDuConstat({ ...complet, electrique: true })).toContain(
      'Confirmez que la batterie ne présente aucun signe inquiétant.',
    );
    expect(
      motifsDuConstat({ ...complet, electrique: true, batterieVerifiee: true }),
    ).toEqual([]);
  });

  test('une batterie inquiétante ne se déclare pas soi-même : le bike sitter refuse le vélo', () => {
    expect(estUnEtatDeclarable('batterie')).toBe(false);
    expect(estUnEtatDeclarable('usure')).toBe(true);
  });

  test('un vélo rendu en moins bon état qu’au dépôt est signalé aux deux', () => {
    expect(leRetourEstMoinsBon('ok', 'defaut')).toBe(true);
    expect(leRetourEstMoinsBon('ok', 'ok')).toBe(false);
    expect(leRetourEstMoinsBon('usure', 'ok')).toBe(false);
    expect(leRetourEstMoinsBon(null, 'defaut')).toBe(false);
  });

  test('la description ne se garde qu’avec un défaut déclaré', () => {
    expect(noteDuConstat('ok', 'Rayure sur le cadre')).toBeNull();
    expect(noteDuConstat('defaut', '  Rayure sur le cadre ')).toBe('Rayure sur le cadre');
    expect(noteDuConstat('defaut', '   ')).toBeNull();
    expect(retirerLesCaracteresDeControle('a\u0000b\nc')).toBe('ab\nc');
  });

  test('les photos d’un constat restent visibles quatorze jours après la fin de la garde', () => {
    const maintenant = new Date('2026-09-30T12:00:00Z');
    const ilYA = (jours: number) => new Date(maintenant.getTime() - jours * JOUR);
    expect(photosDuConstatVisibles({ etat: 'en_cours', clotureLe: null }, maintenant)).toBe(true);
    expect(photosDuConstatVisibles({ etat: 'termine', clotureLe: ilYA(13) }, maintenant)).toBe(true);
    expect(photosDuConstatVisibles({ etat: 'termine', clotureLe: ilYA(14) }, maintenant)).toBe(true);
    expect(photosDuConstatVisibles({ etat: 'termine', clotureLe: ilYA(15) }, maintenant)).toBe(false);
    expect(photosDuConstatVisibles({ etat: 'annule', clotureLe: ilYA(20) }, maintenant)).toBe(false);
    expect(photosDuConstatVisibles({ etat: 'termine', clotureLe: null }, maintenant)).toBe(false);
  });

  test('pendant un litige, les photos restent visibles aux deux membres', () => {
    expect(
      photosDuConstatVisibles({ etat: 'litige', clotureLe: null }, new Date()),
    ).toBe(true);
  });

  test('chaque photo dit ce qu’elle montre', () => {
    expect(titreDeLaPhoto(0)).toBe('Côté gauche');
    expect(titreDeLaPhoto(9)).toBe('Photo du vélo');
  });
});

describe('les avis après une garde', () => {
  const fin = new Date('2026-09-01T12:00:00Z');

  test('un avis se dépose dans les quatorze jours qui suivent la garde', () => {
    expect(onPeutEncoreDeposer(fin, new Date(fin.getTime() + 13 * JOUR))).toBe(
      true,
    );
    expect(onPeutEncoreDeposer(fin, new Date(fin.getTime() + 15 * JOUR))).toBe(
      false,
    );
  });

  test('un avis resté seul se publie au bout de sept jours', () => {
    expect(publieSeulLe(fin).getTime() - fin.getTime()).toBe(7 * JOUR);
  });

  test('la note générale est obligatoire', () => {
    expect(
      motifsDeLAvis({
        note: 0,
        criteres: {},
        texte: '',
        sens: 'cycliste_vers_bike_sitter',
      }),
    ).toContain('Donnez une note générale.');
  });

  test('les critères suivent le sens de l’avis', () => {
    expect(CRITERES.cycliste_vers_bike_sitter).toContain('Qualité du lieu');
    expect(
      motifsDeLAvis({
        note: 4,
        criteres: { Ponctualité: 5 },
        texte: '',
        sens: 'cycliste_vers_bike_sitter',
      }),
    ).toHaveLength(1);
  });
});

describe('la distance affichée', () => {
  test('règle 4 — la distance s’arrondit à la centaine de mètres', () => {
    expect(distanceArrondie(438)).toBe(400);
    expect(distanceArrondie(12)).toBe(100);
    expect(libelleDeDistance(1234)).toBe('1,2 km');
  });

  test('la distance entre deux points de Bruxelles est cohérente', () => {
    const flagey = { latitude: 50.828, longitude: 4.372 };
    const central = { latitude: 50.8456, longitude: 4.3572 };
    const metres = distanceEnMetres(flagey, central);
    expect(metres).toBeGreaterThan(2000);
    expect(metres).toBeLessThan(2600);
  });
});

describe('les heures de tranquillité et la présence', () => {
  test('une plage à cheval sur minuit couvre la nuit', () => {
    expect(dansLaPlage('23:30', '22:00', '07:00')).toBe(true);
    expect(dansLaPlage('06:59', '22:00', '07:00')).toBe(true);
    expect(dansLaPlage('07:00', '22:00', '07:00')).toBe(false);
  });

  test('une notification de nuit attend la fin de la plage, sauf urgence', () => {
    expect(minutesDAttente('23:00', { de: '22:00', a: '07:00' }, false)).toBe(
      480,
    );
    expect(minutesDAttente('23:00', { de: '22:00', a: '07:00' }, true)).toBe(0);
    expect(minutesDAttente('12:00', { de: '22:00', a: '07:00' }, false)).toBe(
      0,
    );
  });

  test('la présence reste approximative', () => {
    const maintenant = new Date('2026-09-14T12:00:00Z');
    expect(
      presence(new Date(maintenant.getTime() - 5 * 60000), maintenant)?.texte,
    ).toBe('En ligne');
    expect(
      presence(new Date(maintenant.getTime() - 3 * 3600000), maintenant),
    ).toEqual({
      enLigne: false,
      texte: 'Vu il y a {n} h',
      valeurs: { n: 3 },
    });
  });
});

describe('le moment du constat', () => {
  test('le cycliste photographie son vélo aux deux remises', () => {
    expect(AUTEUR_DU_CONSTAT.depot).toBe('cycliste');
    expect(AUTEUR_DU_CONSTAT.reprise).toBe('cycliste');
  });

  test('le constat de dépôt se fait devant la porte, une fois l’arrivée signalée', () => {
    expect(constatPossible('depot', { etat: 'arrivee' })).toBe(true);
    expect(constatPossible('depot', { etat: 'accepte' })).toBe(false);
  });

  test('une fois le vélo remis, le constat de dépôt ne se fait plus', () => {
    for (const etat of ['en_cours', 'reprise_demandee', 'termine', 'litige', 'annule']) {
      expect(constatPossible('depot', { etat })).toBe(false);
    }
  });

  test('le constat de reprise se fait après la demande de reprise, avant la clôture', () => {
    expect(constatPossible('reprise', { etat: 'reprise_demandee' })).toBe(true);
    expect(constatPossible('reprise', { etat: 'en_cours' })).toBe(false);
    expect(constatPossible('reprise', { etat: 'termine' })).toBe(false);
    expect(constatPossible('depot', { etat: 'demande' })).toBe(false);
  });

  test('règle 5 — le code d’une remise ne se saisit qu’après les photos, par celui qui reçoit le vélo', () => {
    const depot = { phase: 'depot', etat: 'arrivee', acteur: 'bike_sitter', constatEtabli: true } as const;
    expect(refusDeLaSaisie(depot)).toBeNull();
    expect(refusDeLaSaisie({ ...depot, constatEtabli: false })).toBe('photos_d_abord');
    expect(refusDeLaSaisie({ ...depot, acteur: 'cycliste' })).toBe('code_a_montrer');
    expect(refusDeLaSaisie({ ...depot, etat: 'en_cours' })).toBe('garde_changee');

    const reprise = { phase: 'reprise', etat: 'reprise_demandee', acteur: 'cycliste', constatEtabli: false } as const;
    expect(refusDeLaSaisie(reprise)).toBe('photos_d_abord');
    expect(refusDeLaSaisie({ ...reprise, constatEtabli: true })).toBeNull();
  });

  test('règle 5 — au dépôt, le code du cycliste attend ses photos', () => {
    const depot = { phase: 'depot', etat: 'arrivee', acteur: 'cycliste', constatEtabli: false } as const;
    expect(codeEmissible(depot)).toBe(false);
    expect(codeEmissible({ ...depot, constatEtabli: true })).toBe(true);
    expect(codeEmissible({ ...depot, acteur: 'bike_sitter', constatEtabli: true })).toBe(false);
    // À la reprise, le bike sitter montre son code pendant que le cycliste photographie.
    expect(
      codeEmissible({ phase: 'reprise', etat: 'reprise_demandee', acteur: 'bike_sitter', constatEtabli: false }),
    ).toBe(true);
  });

  test('seul le bike sitter refuse un vélo électrique pour sa batterie, à l’arrivée', () => {
    const garde = { etat: 'arrivee', typeVelo: 'Électrique' };
    expect(refusPourLaBatteriePossible('bike_sitter', garde)).toBe(true);
    expect(refusPourLaBatteriePossible('cycliste', garde)).toBe(false);
    expect(refusPourLaBatteriePossible('bike_sitter', { ...garde, typeVelo: 'Ville' })).toBe(false);
    expect(refusPourLaBatteriePossible('bike_sitter', { ...garde, etat: 'en_cours' })).toBe(false);
  });
});
