import 'server-only';

import { baseConfiguree, interroger } from '@/lib/bd/client';
import type { CentreDeZone } from '@/lib/carte/projection';

/**
 * Ce que les pages publiques montrent du réseau.
 *
 * Tout ce qui décrit le réseau est compté ou lu dans la base : aucun chiffre
 * du réseau n'est écrit à la main. Ces
 * lectures habillent une page sans en être le sujet ; une base momentanément
 * injoignable ne doit pas faire tomber la première page que voit un visiteur.
 * Seule une base injoignable est absorbée : une requête fausse ou un schéma
 * absent remontent normalement.
 */

async function siLaBaseRepond<T>(lecture: () => Promise<T>, aDefaut: T) {
  if (!baseConfiguree()) {
    return aDefaut;
  }
  try {
    return await lecture();
  } catch (erreur) {
    if (baseInjoignable(erreur)) {
      return aDefaut;
    }
    throw erreur;
  }
}

/** Les codes d'une base qu'on ne joint pas, par opposition à une requête fausse. */
const CODES_D_INJOIGNABILITE = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  // PostgreSQL démarre ou s'arrête.
  '57P01',
  '57P03',
]);

function baseInjoignable(erreur: unknown): boolean {
  if (typeof erreur !== 'object' || erreur === null) {
    return false;
  }
  if ('code' in erreur && typeof erreur.code === 'string') {
    return CODES_D_INJOIGNABILITE.has(erreur.code);
  }
  // pg-pool signale un délai de connexion dépassé sans code.
  return (
    'message' in erreur &&
    typeof erreur.message === 'string' &&
    erreur.message.includes('timeout exceeded when trying to connect')
  );
}

/** Les emplacements publiés ces sept derniers jours. */
export function emplacementsOuvertsCesSeptJours(): Promise<number> {
  return siLaBaseRepond(async () => {
    const [ligne] = await interroger<{ combien: number }>(
      `select count(*)::int as combien
         from emplacement
        where publie
          and cree_le >= now() - interval '7 days'`,
    );
    return ligne?.combien ?? 0;
  }, 0);
}

export type ZoneOuverte = CentreDeZone & { emplacements: number };

/**
 * Les zones où au moins un emplacement est publié.
 *
 * Lu dans `emplacement_visible` (règle 4) : des centres de maille, jamais une
 * position. Deux emplacements de la même maille ne font qu'une zone.
 */
export function zonesOuvertes(): Promise<ZoneOuverte[]> {
  return siLaBaseRepond(
    () =>
      interroger<ZoneOuverte>(
        `select latitude_de_zone::float8  as latitude,
                longitude_de_zone::float8 as longitude,
                count(*)::int             as emplacements
           from emplacement_visible
          group by latitude_de_zone, longitude_de_zone
          order by latitude_de_zone desc, longitude_de_zone`,
      ),
    [],
  );
}

export type ChiffresDeLaCommunaute = {
  emplacements: number;
  stationnementsTermines: number;
};

export function chiffresDeLaCommunaute(): Promise<ChiffresDeLaCommunaute> {
  return siLaBaseRepond(
    async () => {
      const [ligne] = await interroger<ChiffresDeLaCommunaute>(
        `select
           (select count(*) from emplacement where publie)::int as emplacements,
           (select count(*) from stationnement where etat = 'termine')::int
             as "stationnementsTermines"`,
      );
      return ligne ?? { emplacements: 0, stationnementsTermines: 0 };
    },
    { emplacements: 0, stationnementsTermines: 0 },
  );
}
