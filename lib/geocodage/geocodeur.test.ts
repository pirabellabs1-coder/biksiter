import { describe, expect, test } from 'vitest';

import { estDansLaZoneCouverte } from '@/lib/regles/territoire';

import { geocoder } from './geocodeur';

/**
 * Ces vérifications appellent un service extérieur : elles ne tournent que si
 * on le demande, pour qu'une panne de réseau ou une coupure chez OpenStreetMap
 * ne fasse pas échouer la suite de tests de quelqu'un qui travaille sur autre
 * chose.
 *
 *   VERIFIER_LE_GEOCODAGE=1 npm test
 */
const avecLeReseau = process.env.VERIFIER_LE_GEOCODAGE === '1';

describe('le géocodage d’une adresse bruxelloise', () => {
  test('une adresse vide n’est pas envoyée au service', async () => {
    expect(await geocoder('   ')).toEqual({ trouve: false, motif: 'introuvable' });
  });

  test.skipIf(!avecLeReseau)(
    'une adresse d’Ixelles est trouvée, et dans la zone couverte',
    async () => {
      const resultat = await geocoder('rue Maria Malibran 12, 1050 Ixelles');

      expect(resultat.trouve).toBe(true);
      if (resultat.trouve) {
        expect(estDansLaZoneCouverte(resultat.point)).toBe(true);
        expect(resultat.point.latitude).toBeCloseTo(50.829, 2);
        expect(resultat.point.longitude).toBeCloseTo(4.372, 2);
      }
    },
    20_000,
  );

  test.skipIf(!avecLeReseau)(
    'une adresse belge hors de Bruxelles est refusée pour le territoire',
    async () => {
      const resultat = await geocoder('Grote Markt 1, 2000 Antwerpen');

      expect(resultat).toEqual({ trouve: false, motif: 'hors_zone' });
    },
    20_000,
  );

  test.skipIf(!avecLeReseau)(
    'une adresse qui n’existe pas est déclarée introuvable',
    async () => {
      const resultat = await geocoder(
        'rue du Vélo Imaginaire 99999, 1000 Bruxelles',
      );

      expect(resultat.trouve).toBe(false);
    },
    20_000,
  );
});
