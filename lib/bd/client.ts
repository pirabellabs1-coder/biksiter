import { Pool, type PoolClient, type QueryResultRow } from 'pg';

/**
 * L'accès à PostgreSQL.
 *
 * Une seule réserve de connexions pour tout le processus. En développement,
 * Next recharge les modules à chaque modification : sans le passage par
 * `globalThis`, chaque rechargement ouvrirait une réserve de plus et la base
 * finirait par refuser les connexions au bout d'une demi-heure de travail.
 */

declare global {
  var reserveBikeSitters: Pool | undefined;
}

export class BaseNonConfiguree extends Error {
  constructor() {
    super(
      'DATABASE_URL n’est pas défini : la base de données n’est pas branchée.',
    );
    this.name = 'BaseNonConfiguree';
  }
}

export function baseConfiguree(): boolean {
  return typeof process.env.DATABASE_URL === 'string'
    && process.env.DATABASE_URL.length > 0;
}

function entierDeLEnvironnement(nom: string, parDefaut: number): number {
  const valeur = Number.parseInt(process.env[nom] ?? '', 10);
  return Number.isFinite(valeur) && valeur > 0 ? valeur : parDefaut;
}

export function reserve(): Pool {
  if (!baseConfiguree()) {
    throw new BaseNonConfiguree();
  }

  if (!globalThis.reserveBikeSitters) {
    globalThis.reserveBikeSitters = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Réglables par l'environnement : un serveur de développement partagé
      // par plusieurs sessions de test a besoin de plus de connexions, et
      // d'un peu plus de patience envers un pooler distant.
      max: entierDeLEnvironnement('DATABASE_POOL_MAX', 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: entierDeLEnvironnement(
        'DATABASE_DELAI_CONNEXION_MS',
        5_000,
      ),
      // En production l'hébergeur impose TLS ; en local il n'y en a pas.
      // « requis » : TLS avec vérification stricte du certificat.
      // « chiffre » : TLS sans vérification (nécessaire avec le pooler Supabase,
      //   dont la chaîne n'est pas reconnue par l'autorité racine de Node).
      ssl:
        process.env.DATABASE_SSL === 'requis'
          ? { rejectUnauthorized: true }
          : process.env.DATABASE_SSL === 'chiffre'
            ? { rejectUnauthorized: false }
            : undefined,
    });
  }

  return globalThis.reserveBikeSitters;
}

/**
 * Toutes les valeurs passent par $1, $2… : il n'existe nulle part dans ce code
 * une requête construite par concaténation.
 */
export async function interroger<T extends QueryResultRow>(
  texte: string,
  valeurs: readonly unknown[] = [],
): Promise<T[]> {
  const resultat = await reserve().query<T>(texte, valeurs as unknown[]);
  return resultat.rows;
}

export async function uneLigne<T extends QueryResultRow>(
  texte: string,
  valeurs: readonly unknown[] = [],
): Promise<T | null> {
  const lignes = await interroger<T>(texte, valeurs);
  return lignes[0] ?? null;
}

/**
 * Une transaction, avec le retour en arrière garanti et la connexion rendue
 * quoi qu'il arrive.
 */
export async function dansUneTransaction<T>(
  travail: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await reserve().connect();
  try {
    await client.query('begin');
    const resultat = await travail(client);
    await client.query('commit');
    return resultat;
  } catch (erreur) {
    await client.query('rollback');
    throw erreur;
  } finally {
    client.release();
  }
}

/** Code d'erreur PostgreSQL d'une violation d'unicité. */
export const VIOLATION_UNICITE = '23505';
/** Violation d'une contrainte CHECK, ou d'un déclencheur qui en lève une. */
export const VIOLATION_CONTRAINTE = '23514';

export function codeDErreurPostgres(erreur: unknown): string | null {
  if (
    typeof erreur === 'object' &&
    erreur !== null &&
    'code' in erreur &&
    typeof (erreur as { code: unknown }).code === 'string'
  ) {
    return (erreur as { code: string }).code;
  }
  return null;
}
