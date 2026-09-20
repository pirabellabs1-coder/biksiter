import 'server-only';

import type { PoolClient } from 'pg';

import { interroger, uneLigne } from '@/lib/bd/client';
import { dureeDeValidite, type UsageDeJeton } from '@/lib/regles/comptes';
import { empreinteDuJeton, nouveauJeton } from '@/lib/securite/jeton';

/**
 * Les liens à usage unique envoyés par courriel.
 *
 * Émettre un jeton efface ceux du même usage encore inutilisés : quelqu'un qui
 * redemande un lien le fait parce que le premier n'est pas arrivé, et un
 * ancien lien qui traîne dans une boîte n'a pas à rester valable.
 */
export async function emettreUnJeton(
  client: PoolClient,
  membreId: string,
  usage: UsageDeJeton,
): Promise<string> {
  const jeton = nouveauJeton();

  await client.query(
    `delete from jeton_a_usage_unique
      where membre_id = $1 and usage = $2 and utilise_le is null`,
    [membreId, usage],
  );
  await client.query(
    `insert into jeton_a_usage_unique (empreinte, membre_id, usage, expire_le)
     values ($1, $2, $3, now() + ($4 || ' milliseconds')::interval)`,
    [empreinteDuJeton(jeton), membreId, usage, String(dureeDeValidite(usage))],
  );

  return jeton;
}

/** Le membre à qui appartient un jeton encore valable, sans le consommer. */
export async function membreDuJeton(
  jeton: string,
  usage: UsageDeJeton,
): Promise<string | null> {
  const ligne = await uneLigne<{ membre_id: string }>(
    `select membre_id from jeton_a_usage_unique
      where empreinte = $1 and usage = $2
        and utilise_le is null and expire_le > now()`,
    [empreinteDuJeton(jeton), usage],
  );
  return ligne?.membre_id ?? null;
}

/**
 * Consomme un jeton. Une seule requête décide et marque : deux clics
 * simultanés sur le même lien ne peuvent pas passer tous les deux.
 */
export async function consommerUnJeton(
  jeton: string,
  usage: UsageDeJeton,
  client?: PoolClient,
): Promise<string | null> {
  const requete = `update jeton_a_usage_unique
                      set utilise_le = now()
                    where empreinte = $1 and usage = $2
                      and utilise_le is null and expire_le > now()
                returning membre_id`;
  const valeurs = [empreinteDuJeton(jeton), usage];

  if (client) {
    const { rows } = await client.query<{ membre_id: string }>(
      requete,
      valeurs,
    );
    return rows[0]?.membre_id ?? null;
  }
  const [ligne] = await interroger<{ membre_id: string }>(requete, valeurs);
  return ligne?.membre_id ?? null;
}
