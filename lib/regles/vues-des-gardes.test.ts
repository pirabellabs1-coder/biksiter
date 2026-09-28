import { describe, expect, test } from 'vitest';

import type { EtatDeGarde } from './garde';
import { VUES_DES_GARDES, vueDeLEtat } from './vues-des-gardes';

const TOUS_LES_ETATS: readonly EtatDeGarde[] = [
  'demande',
  'accepte',
  'arrivee',
  'en_cours',
  'reprise_demandee',
  'termine',
  'refuse',
  'annule',
  'expire',
  'litige',
];

describe('les trois vues de « Mes gardes »', () => {
  test('« Mes gardes » se lit en trois vues : à venir, demandes, terminées', () => {
    expect(VUES_DES_GARDES.map((v) => v.cle)).toEqual([
      'avenir',
      'demandes',
      'terminees',
    ]);
  });

  test('chaque état de garde tombe dans une vue, et une seule', () => {
    for (const etat of TOUS_LES_ETATS) {
      const vues = VUES_DES_GARDES.filter((v) =>
        (v.etats as readonly EtatDeGarde[]).includes(etat),
      );
      expect(vues).toHaveLength(1);
    }
  });

  test('une garde acceptée se lit dans « À venir »', () => {
    expect(vueDeLEtat('accepte')).toBe('avenir');
  });

  test('une demande refusée reste dans « Demandes »', () => {
    expect(vueDeLEtat('refuse')).toBe('demandes');
  });

  test('une garde annulée se lit avec les gardes terminées', () => {
    expect(vueDeLEtat('annule')).toBe('terminees');
  });

  test('un signalement en examen reste dans « À venir »', () => {
    expect(vueDeLEtat('litige')).toBe('avenir');
  });
});
