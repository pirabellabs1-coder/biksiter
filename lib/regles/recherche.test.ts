import { describe, expect, test } from 'vitest';

import {
  basculer,
  correspond,
  ecrireLesFiltres,
  lireLesFiltres,
  placeLibre,
  SANS_FILTRE,
} from './recherche';

const GARAGE = {
  distance: 800,
  velosAcceptes: ['Ville', 'Cargo'],
  intemperie: 'interieur',
  ancrage: 'Ancrage mural',
};

describe('les filtres de recherche', () => {
  test('sans filtre, tout emplacement correspond', () => {
    expect(correspond(GARAGE, SANS_FILTRE)).toBe(true);
  });

  test('un emplacement plus loin que la distance choisie est écarté', () => {
    expect(correspond(GARAGE, { ...SANS_FILTRE, distanceMax: 500 })).toBe(
      false,
    );
    expect(correspond(GARAGE, { ...SANS_FILTRE, distanceMax: 1000 })).toBe(
      true,
    );
  });

  test('un emplacement qui n’accueille pas le vélo choisi est écarté', () => {
    expect(correspond(GARAGE, { ...SANS_FILTRE, typeVelo: 'Tandem' })).toBe(
      false,
    );
  });

  test('« à l’intérieur » écarte ce qui est dehors ou sous abri', () => {
    expect(
      correspond(
        { ...GARAGE, intemperie: 'abri' },
        { ...SANS_FILTRE, interieur: true },
      ),
    ).toBe(false);
  });

  test('cliquer deux fois sur un même choix le retire', () => {
    const une = basculer(SANS_FILTRE, 'distanceMax', 500);
    expect(une.distanceMax).toBe(500);
    expect(basculer(une, 'distanceMax', 500).distanceMax).toBeNull();
  });

  test('une valeur inconnue dans l’adresse est ignorée', () => {
    expect(
      lireLesFiltres({ distance: '42', velo: 'Fusée', interieur: '1' }, [
        'Ville',
      ]),
    ).toEqual({ ...SANS_FILTRE, interieur: true });
  });

  test('les filtres s’écrivent et se relisent à l’identique', () => {
    const filtres = {
      ...SANS_FILTRE,
      distanceMax: 1000,
      typeVelo: 'Ville',
      interieur: true,
      noteMin: 4,
      accessible: true,
    };
    expect(lireLesFiltres(ecrireLesFiltres(filtres), ['Ville'])).toEqual(
      filtres,
    );
  });
});

describe('les filtres des maquettes', () => {
  const NOTE = { ...GARAGE, type: 'Garage privé fermé', noteMoyenne: 4.6, acces: 'Plain-pied' };

  test('le filtre par note écarte un emplacement sans note ou en dessous du seuil', () => {
    expect(correspond(NOTE, { ...SANS_FILTRE, noteMin: 4.5 })).toBe(true);
    expect(correspond({ ...NOTE, noteMoyenne: 4.2 }, { ...SANS_FILTRE, noteMin: 4.5 })).toBe(false);
    expect(correspond({ ...NOTE, noteMoyenne: null }, { ...SANS_FILTRE, noteMin: 4 })).toBe(false);
  });

  test('le type d’espace, la compatibilité VAE et l’accès sans marche se filtrent', () => {
    expect(correspond(NOTE, { ...SANS_FILTRE, typeDEmplacement: 'Cave privative' })).toBe(false);
    expect(correspond(NOTE, { ...SANS_FILTRE, vae: true })).toBe(false);
    expect(correspond({ ...NOTE, velosAcceptes: ['Électrique'] }, { ...SANS_FILTRE, vae: true })).toBe(true);
    expect(correspond({ ...NOTE, acces: 'Escalier' }, { ...SANS_FILTRE, accessible: true })).toBe(false);
  });

  test('une note ou un type inconnus dans l’adresse sont ignorés', () => {
    const lus = lireLesFiltres({ note: '3', espace: 'Parking public' }, ['Ville']);
    expect(lus.noteMin).toBeNull();
    expect(lus.typeDEmplacement).toBeNull();
    expect(ecrireLesFiltres(lireLesFiltres({ note: '4.5', vae: '1' }, ['Ville']))).toEqual({
      note: '4.5',
      vae: '1',
    });
  });
});

describe('une place libre', () => {
  test('un emplacement complet, ou dont le bike sitter accueille ailleurs, n’a pas de place libre', () => {
    expect(placeLibre({ placesLibres: 1, occupeAilleurs: false })).toBe(true);
    expect(placeLibre({ placesLibres: 0, occupeAilleurs: false })).toBe(false);
    expect(placeLibre({ placesLibres: 2, occupeAilleurs: true })).toBe(false);
  });
});
