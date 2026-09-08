/**
 * Vide la file d'attente des courriels.
 *
 * À lancer périodiquement (une tâche planifiée toutes les minutes suffit
 * largement au volume attendu). Sans SMTP_URL, le script montre ce qu'il
 * aurait envoyé et ne marque rien comme envoyé : c'est ce qui permet de
 * relire les messages en développement sans expédier quoi que ce soit à de
 * vraies personnes.
 *
 *   npm run bd:courriels
 *   npm run bd:courriels -- --a-blanc
 */

import process from 'node:process';

import nodemailer from 'nodemailer';
import { Pool } from 'pg';

/** Au-delà, un message est probablement mal formé ou l'adresse n'existe pas. */
const TENTATIVES_MAXIMALES = 5;
const PAR_PASSE = 50;

type EnAttente = {
  id: string;
  destinataire: string;
  sujet: string;
  corps: string;
  tentatives: number;
};

async function envoyer(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL n’est pas défini.');
    process.exitCode = 1;
    return;
  }

  const aBlanc =
    process.argv.includes('--a-blanc') || !process.env.SMTP_URL;

  const reserve = new Pool({ connectionString: url });

  try {
    const attente = await reserve.query<EnAttente>(
      `select id, destinataire, sujet, corps, tentatives
         from courriel
        where envoye_le is null
          and tentatives < $1
        order by cree_le
        limit $2`,
      [TENTATIVES_MAXIMALES, PAR_PASSE],
    );

    if (attente.rowCount === 0) {
      console.log('Rien à envoyer.');
      return;
    }

    if (aBlanc) {
      console.log(
        `SMTP_URL n’est pas défini : ${attente.rowCount} message(s) en attente,\n` +
          'affichés ici sans être envoyés ni marqués comme envoyés.\n',
      );
      for (const message of attente.rows) {
        console.log('─'.repeat(70));
        console.log(`À      : ${message.destinataire}`);
        console.log(`Sujet  : ${message.sujet}`);
        console.log('');
        console.log(message.corps);
      }
      return;
    }

    const facteur = nodemailer.createTransport(process.env.SMTP_URL);
    const expediteur =
      process.env.COURRIEL_EXPEDITEUR ?? 'Bike Sitters <bonjour@bikesitters.be>';

    let envoyes = 0;
    let echoues = 0;

    for (const message of attente.rows) {
      try {
        await facteur.sendMail({
          from: expediteur,
          to: message.destinataire,
          subject: message.sujet,
          // Texte brut uniquement : voir lib/courriel/modeles.ts.
          text: message.corps,
        });
        await reserve.query(
          'update courriel set envoye_le = now() where id = $1',
          [message.id],
        );
        envoyes += 1;
      } catch (erreur) {
        const motif = erreur instanceof Error ? erreur.message : String(erreur);
        await reserve.query(
          `update courriel
              set tentatives = tentatives + 1, derniere_erreur = $2
            where id = $1`,
          [message.id, motif.slice(0, 500)],
        );
        echoues += 1;
      }
    }

    console.log(`${envoyes} envoyé(s), ${echoues} en échec.`);
  } finally {
    await reserve.end();
  }
}

envoyer().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exitCode = 1;
});
