import { describe, expect, test } from 'vitest';

import {
  bornesDeLaPeriode,
  etatDesBadges,
  figureAuClassement,
  annulationImputableAuBikeSitter,
  fiabilite,
  ligneDuClassement,
  niveauPour,
  objectifsEnCours,
  rangsDuClassement,
  seriesSansAnnulation,
  type ActiviteDuBikeSitter,
} from './progression';

const debutant: ActiviteDuBikeSitter = {
  gardesTerminees: 0,
  gardesDeVeloElectrique: 0,
  reponsesRapides: 0,
  avisCinqEtoiles: 0,
  serieSansAnnulation: 0,
  meilleureSerieSansAnnulation: 0,
};

describe('le niveau suit les points gagnés, pas le solde', () => {
  test('un bike sitter sans points est nouveau', () => {
    expect(niveauPour(0).actuel.cle).toBe('nouveau');
  });

  test('quinze points gagnés font un bike sitter confirmé', () => {
    expect(niveauPour(15).actuel.cle).toBe('confirme');
  });

  test('le niveau suivant dit combien de points il manque', () => {
    const position = niveauPour(38);
    expect(position.suivant?.cle).toBe('confiance');
    expect(position.manquants).toBe(12);
    expect(position.avancement).toBeCloseTo(23 / 35);
  });

  test('au dernier niveau, il ne manque plus rien', () => {
    const position = niveauPour(500);
    expect(position.suivant).toBeNull();
    expect(position.manquants).toBe(0);
    expect(position.avancement).toBe(1);
  });
});

describe('les badges se gagnent par des gardes menées à terme', () => {
  test('la première garde terminée débloque le badge « Première garde »', () => {
    const badges = etatDesBadges({ ...debutant, gardesTerminees: 1 });
    expect(badges.find((b) => b.cle === 'premiere_garde')?.obtenu).toBe(true);
    expect(badges.find((b) => b.cle === 'dix_gardes')?.reste).toBe(9);
  });

  test('une annulation après une série de cinq ne retire pas « Zéro annulation »', () => {
    const badge = etatDesBadges({
      ...debutant,
      serieSansAnnulation: 0,
      meilleureSerieSansAnnulation: 6,
    }).find((b) => b.cle === 'zero_annulation');
    expect(badge?.obtenu).toBe(true);
  });

  test('les objectifs en cours vont du plus proche au plus lointain', () => {
    const objectifs = objectifsEnCours({
      ...debutant,
      gardesTerminees: 7,
      avisCinqEtoiles: 4,
    });
    expect(objectifs.map((o) => o.cle).slice(0, 2)).toEqual([
      'accueil_5_etoiles',
      'dix_gardes',
    ]);
    expect(objectifs.some((o) => o.cle === 'premiere_garde')).toBe(false);
  });
});

describe('seule une annulation du bike sitter interrompt une série', () => {
  test('la série actuelle repart de zéro après une annulation, la meilleure reste', () => {
    expect(
      seriesSansAnnulation(['menee', 'menee', 'menee', 'annulee', 'menee']),
    ).toEqual({ actuelle: 1, meilleure: 3 });
  });

  test('sans garde, pas de série', () => {
    expect(seriesSansAnnulation([])).toEqual({ actuelle: 0, meilleure: 0 });
  });
});

describe('ce qui compte contre la fiabilité d’un bike sitter', () => {
  test('un désistement du bike sitter compte contre lui', () => {
    expect(annulationImputableAuBikeSitter({ acteur: 'bike_sitter', geste: 'annuler' })).toBe(true);
  });

  test('une absence déclarée par le bike sitter n’est pas une annulation de sa part', () => {
    expect(annulationImputableAuBikeSitter({ acteur: 'bike_sitter', geste: 'absence' })).toBe(false);
  });

  test('une porte restée close quand le cycliste était là compte contre le bike sitter', () => {
    expect(
      annulationImputableAuBikeSitter({ acteur: 'cycliste', geste: 'personne_n_ouvre' }),
    ).toBe(true);
  });

  test('le désistement du cycliste et le refus d’une batterie ne comptent pas', () => {
    expect(annulationImputableAuBikeSitter({ acteur: 'cycliste', geste: 'annuler' })).toBe(false);
    expect(annulationImputableAuBikeSitter({ acteur: 'bike_sitter', geste: null })).toBe(false);
  });
});

describe('la fiabilité', () => {
  test('la fiabilité est la part des gardes acceptées menées à terme', () => {
    expect(fiabilite(24, 1)).toBe(96);
  });

  test('sans garde aboutie, la fiabilité ne s’affiche pas', () => {
    expect(fiabilite(0, 0)).toBeNull();
  });
});

describe('règle 3 — le classement', () => {
  test('on n’apparaît dans le classement que si on l’a choisi', () => {
    const membre = {
      apparaitAuClassement: false,
      supprime: false,
      suspendu: false,
      points: 40,
    };
    expect(figureAuClassement(membre)).toBe(false);
    expect(figureAuClassement({ ...membre, apparaitAuClassement: true })).toBe(
      true,
    );
  });

  test('un compte suspendu ou supprimé n’apparaît pas, ni un membre sans point sur la période', () => {
    const membre = {
      apparaitAuClassement: true,
      supprime: false,
      suspendu: false,
      points: 40,
    };
    expect(figureAuClassement({ ...membre, suspendu: true })).toBe(false);
    expect(figureAuClassement({ ...membre, supprime: true })).toBe(false);
    expect(figureAuClassement({ ...membre, points: 0 })).toBe(false);
  });

  test('un classement ne montre jamais l’adresse ni le quartier', () => {
    const source = {
      id: 'a',
      prenom: 'Sofia',
      initiale: 'M',
      verifie: true,
      points: 12,
      gardes: 15,
      fiabilite: 98,
      note: 4.8,
      quartier: 'Ixelles',
      adresse: 'rue du Test 1',
      nom: 'Martin',
    };
    const ligne = ligneDuClassement(source);
    expect(ligne).not.toHaveProperty('quartier');
    expect(ligne).not.toHaveProperty('adresse');
    expect(ligne).not.toHaveProperty('nom');
    expect(ligne).not.toHaveProperty('id');
    expect(ligne.prenom).toBe('Sofia');
  });

  test('à égalité de points, même rang, et le suivant saute d’autant', () => {
    const rangs = rangsDuClassement([
      { id: 'a', points: 10 },
      { id: 'b', points: 12 },
      { id: 'c', points: 10 },
      { id: 'd', points: 8 },
    ]);
    expect(rangs.map((r) => [r.id, r.rang])).toEqual([
      ['b', 1],
      ['a', 2],
      ['c', 2],
      ['d', 4],
    ]);
  });
});

describe('les périodes du classement se comptent en jours de Bruxelles', () => {
  // Le lundi 14 septembre 2026 à 23 h 30 à Bruxelles, soit 21 h 30 UTC.
  const lundiSoir = new Date('2026-09-14T21:30:00Z');

  test('la semaine va du lundi au dimanche', () => {
    const { premierJour, dernierJour } = bornesDeLaPeriode(
      'semaine',
      lundiSoir,
    );
    expect([premierJour, dernierJour]).toEqual(['2026-09-14', '2026-09-20']);
  });

  test('le mois va du premier au dernier jour', () => {
    const { premierJour, dernierJour } = bornesDeLaPeriode('mois', lundiSoir);
    expect([premierJour, dernierJour]).toEqual(['2026-09-01', '2026-09-30']);
  });

  test('le jour commence à minuit à Bruxelles, pas à minuit UTC', () => {
    const peuApresMinuit = new Date('2026-09-14T22:30:00Z'); // 00 h 30 le 15 à Bruxelles
    const { debut, premierJour } = bornesDeLaPeriode('jour', peuApresMinuit);
    expect(premierJour).toBe('2026-09-15');
    expect(debut.toISOString()).toBe('2026-09-14T22:00:00.000Z');
  });

  test('un dimanche appartient à la semaine commencée le lundi précédent', () => {
    const dimanche = new Date('2026-09-20T10:00:00Z');
    expect(bornesDeLaPeriode('semaine', dimanche).premierJour).toBe(
      '2026-09-14',
    );
  });
});
