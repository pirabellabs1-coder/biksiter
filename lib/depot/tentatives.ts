import 'server-only';

import type { PoolClient } from 'pg';

import { interroger, reserve } from '@/lib/bd/client';
import { limiteAtteinte, type Limite } from '@/lib/regles/limites';
import { empreinteDuJeton } from '@/lib/securite/jeton';

/**
 * Le compte des essais. La clé est hachée avant d'arriver en base : on compte
 * des adresses et des numéros sans les conserver.
 */

function empreinte(cle: string): string {
  return empreinteDuJeton(cle.trim().toLowerCase());
}

/**
 * Appelées pendant une transaction, ces fonctions reçoivent son client : une
 * seconde connexion attendrait le pool pendant que la première tient un verrou,
 * et une rafale de requêtes suffirait à l'épuiser.
 */
export async function limiteDejaAtteinte(
  limite: Limite,
  cle: string,
  client?: Pick<PoolClient, 'query'>,
): Promise<boolean> {
  const { rows } = await (client ?? reserve()).query<{ combien: number }>(
    `select count(*)::int as combien
       from tentative
      where nature = $1 and cle = $2
        and faite_le > now() - ($3 || ' minutes')::interval`,
    [limite.nature, empreinte(cle), String(limite.fenetreMinutes)],
  );
  return limiteAtteinte(rows[0]?.combien ?? 0, limite);
}

export async function noterUneTentative(
  nature: Limite['nature'],
  cle: string,
  client?: Pick<PoolClient, 'query'>,
): Promise<void> {
  await (client ?? reserve()).query(
    'insert into tentative (nature, cle) values ($1, $2)',
    [nature, empreinte(cle)],
  );
}

/** À passer périodiquement : la plus longue fenêtre compte un jour. */
export async function purgerLesTentatives(): Promise<number> {
  const lignes = await interroger<{ nature: string }>(
    `delete from tentative where faite_le < now() - interval '2 days'
     returning nature`,
  );
  return lignes.length;
}
