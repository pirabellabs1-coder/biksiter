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

import { ETATS_CLOS, JOURS_D_ACCES_AUX_PHOTOS } from '../lib/regles/constat';
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

    // Les photos d'un constat ne s'affichent plus quatorze jours après la
    // clôture de la garde : elles peuvent montrer l'entrée d'une habitation, et
    // plus personne n'a à les regarder. Une garde en litige n'est pas close, ses
    // photos restent. Une garde close sans date connue est laissée de côté :
    // on n'efface pas sur une date qu'on ignore.
    const photos = await reserve.query(
      `delete from photo_de_constat p
        using constat c, stationnement s
        where c.id = p.constat_id
          and s.id = c.stationnement_id
          and s.etat = any($1::text[])
          and (select max(ev.fait_le) from evenement_de_garde ev
                where ev.stationnement_id = s.id and ev.etape = any($1::text[]))
              < now() - ($2 || ' days')::interval
        returning p.id`,
      [ETATS_CLOS, String(JOURS_D_ACCES_AUX_PHOTOS)],
    );

    const sessions = await reserve.query(
      'delete from session where expire_le <= now() returning empreinte_du_jeton',
    );

    // Les essais comptés ne servent que sur leur fenêtre, d'un jour au plus.
    const tentatives = await reserve.query(
      `delete from tentative where faite_le < now() - interval '2 days'
       returning nature`,
    );

    // Un lien expiré ou déjà utilisé n'a plus rien à protéger.
    const jetons = await reserve.query(
      `delete from jeton_a_usage_unique
        where expire_le <= now() or utilise_le is not null
        returning empreinte`,
    );

    // Les messages partis restent trois mois : de quoi répondre à « je n'ai
    // rien reçu », pas de quoi constituer une archive de correspondance.
    const courriels = await reserve.query(
      `delete from message_sortant
        where envoye_le is not null
          and envoye_le <= now() - interval '90 days'
        returning id`,
    );

    console.log(`Pièces d’identité supprimées : ${pieces.rowCount}`);
    console.log(
      `Photos de constat supprimées après ${JOURS_D_ACCES_AUX_PHOTOS} jours : ${photos.rowCount}`,
    );
    console.log(`Essais comptés supprimés : ${tentatives.rowCount}`);
    console.log(`Liens à usage unique supprimés : ${jetons.rowCount}`);
    console.log(`Sessions expirées supprimées : ${sessions.rowCount}`);
    console.log(`Messages envoyés supprimés après 90 jours : ${courriels.rowCount}`);
  } finally {
    await reserve.end();
  }
}

purger().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exitCode = 1;
});
