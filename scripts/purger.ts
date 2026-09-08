/**
 * Applique les promesses de conservation.
 *
 * À lancer une fois par jour. Ce script existe parce que la page de
 * vérification dit à chaque membre que sa pièce est supprimée « au plus tard
 * après sept jours, même si personne ne l'a regardée » : une promesse qu'on
 * écrit sur un site doit avoir un exécutant.
 *
 *   npm run bd:purger
 */

import process from 'node:process';

import { Pool } from 'pg';

import { CONSERVATION_MAXIMALE_JOURS } from '../lib/regles/pieces';

async function purger(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL n’est pas défini.');
    process.exitCode = 1;
    return;
  }

  const reserve = new Pool({ connectionString: url });

  try {
    const pieces = await reserve.query(
      `delete from piece_didentite
        where relue_le is not null
           or deposee_le <= now() - ($1 || ' days')::interval
        returning id`,
      [String(CONSERVATION_MAXIMALE_JOURS)],
    );

    const sessions = await reserve.query(
      'delete from session where expire_le <= now() returning empreinte_du_jeton',
    );

    // Les messages partis restent trois mois : de quoi répondre à « je n'ai
    // rien reçu », pas de quoi constituer une archive de correspondance.
    const courriels = await reserve.query(
      `delete from courriel
        where envoye_le is not null
          and envoye_le <= now() - interval '90 days'
        returning id`,
    );

    console.log(`Pièces d’identité supprimées : ${pieces.rowCount}`);
    console.log(`Sessions expirées supprimées : ${sessions.rowCount}`);
    console.log(`Courriels envoyés archivés puis supprimés : ${courriels.rowCount}`);
  } finally {
    await reserve.end();
  }
}

purger().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exitCode = 1;
});
