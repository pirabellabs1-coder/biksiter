/**
 * Applique les migrations qui manquent, dans l'ordre des noms de fichiers.
 *
 * Chaque migration passe dans sa propre transaction : ou bien elle s'applique
 * entièrement et s'inscrit dans `migration_appliquee`, ou bien la base reste
 * exactement dans l'état où elle était.
 *
 *   npm run bd:migrer
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { Pool } from 'pg';

const DOSSIER = path.join(process.cwd(), 'migrations');

async function migrer(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      'DATABASE_URL n’est pas défini.\n' +
        'Copiez .env.example en .env.local, puis lancez « docker compose up -d ».',
    );
    process.exitCode = 1;
    return;
  }

  const reserve = new Pool({ connectionString: url });

  try {
    await reserve.query(`
      create table if not exists migration_appliquee (
        nom           text primary key,
        appliquee_le  timestamptz not null default now()
      )
    `);

    const dejaFaites = new Set(
      (
        await reserve.query<{ nom: string }>('select nom from migration_appliquee')
      ).rows.map((ligne) => ligne.nom),
    );

    const fichiers = (await readdir(DOSSIER))
      .filter((nom) => nom.endsWith('.sql'))
      .sort();

    const aFaire = fichiers.filter((nom) => !dejaFaites.has(nom));

    if (aFaire.length === 0) {
      console.log(`Base à jour — ${fichiers.length} migration(s) déjà appliquée(s).`);
      return;
    }

    for (const nom of aFaire) {
      const sql = await readFile(path.join(DOSSIER, nom), 'utf8');
      const client = await reserve.connect();
      try {
        await client.query('begin');
        await client.query(sql);
        await client.query('insert into migration_appliquee (nom) values ($1)', [
          nom,
        ]);
        await client.query('commit');
        console.log(`  appliquée : ${nom}`);
      } catch (erreur) {
        await client.query('rollback');
        console.error(`  ÉCHEC : ${nom}`);
        throw erreur;
      } finally {
        client.release();
      }
    }

    console.log(`${aFaire.length} migration(s) appliquée(s).`);
  } finally {
    await reserve.end();
  }
}

migrer().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exitCode = 1;
});
