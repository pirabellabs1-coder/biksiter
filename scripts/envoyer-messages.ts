/**
 * Vide la file sortante : courriels et SMS.
 *
 * À lancer périodiquement — une tâche toutes les minutes suffit au volume
 * attendu. Sans SMTP_URL (ou sans SMS_URL), le script montre ce qu'il aurait
 * envoyé sur ce canal et ne marque rien comme envoyé : c'est ce qui permet de
 * relire les messages en développement sans expédier quoi que ce soit à de
 * vraies personnes.
 *
 *   npm run bd:messages
 *   npm run bd:messages -- --a-blanc
 */

import process from 'node:process';

import nodemailer from 'nodemailer';
import { Pool } from 'pg';

/** Au-delà, le message est probablement mal formé ou l'adresse n'existe pas. */
const TENTATIVES_MAXIMALES = 5;
const PAR_PASSE = 50;

type EnAttente = {
  id: string;
  canal: 'courriel' | 'sms';
  destinataire: string;
  sujet: string;
  corps: string;
  tentatives: number;
};

function montrer(messages: readonly EnAttente[], canal: string): void {
  console.log(
    `${messages.length} ${canal}(s) en attente, affichés sans être envoyés ` +
      'ni marqués comme envoyés.\n',
  );
  for (const message of messages) {
    console.log('─'.repeat(70));
    console.log(`Canal  : ${message.canal}`);
    console.log(`À      : ${message.destinataire}`);
    console.log(`Sujet  : ${message.sujet}`);
    console.log('');
    console.log(message.corps);
  }
}

/**
 * L'envoi de SMS passe par une passerelle HTTP générique : la plupart des
 * opérateurs belges en proposent une, et une interface maison se remplace sans
 * toucher au reste du code.
 */
async function envoyerUnSms(destinataire: string, texte: string): Promise<void> {
  const passerelle = process.env.SMS_URL;
  if (!passerelle) {
    throw new Error('SMS_URL n’est pas défini.');
  }

  const reponse = await fetch(passerelle, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SMS_JETON
        ? { Authorization: `Bearer ${process.env.SMS_JETON}` }
        : {}),
    },
    body: JSON.stringify({ destinataire, texte }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!reponse.ok) {
    throw new Error(`La passerelle SMS a répondu ${reponse.status}.`);
  }
}

async function envoyer(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL n’est pas défini.');
    process.exitCode = 1;
    return;
  }

  const aBlanc = process.argv.includes('--a-blanc');
  const reserve = new Pool({ connectionString: url });

  try {
    const attente = await reserve.query<EnAttente>(
      `select id, canal, destinataire, sujet, corps, tentatives
         from message_sortant
        where envoye_le is null and tentatives < $1
        order by cree_le
        limit $2`,
      [TENTATIVES_MAXIMALES, PAR_PASSE],
    );

    if (attente.rowCount === 0) {
      console.log('Rien à envoyer.');
      return;
    }

    const courriels = attente.rows.filter((m) => m.canal === 'courriel');
    const sms = attente.rows.filter((m) => m.canal === 'sms');

    const smtp = process.env.SMTP_URL;
    const passerelle = process.env.SMS_URL;

    if ((aBlanc || !smtp) && courriels.length > 0) {
      montrer(courriels, 'courriel');
    }
    if ((aBlanc || !passerelle) && sms.length > 0) {
      montrer(sms, 'SMS');
    }

    const facteur = smtp ? nodemailer.createTransport(smtp) : null;
    const expediteur =
      process.env.COURRIEL_EXPEDITEUR ?? 'Bike Sitters <bonjour@bikesitters.be>';

    let envoyes = 0;
    let echoues = 0;

    for (const message of attente.rows) {
      const possible =
        !aBlanc &&
        ((message.canal === 'courriel' && facteur) ||
          (message.canal === 'sms' && passerelle));

      if (!possible) {
        continue;
      }

      try {
        if (message.canal === 'courriel' && facteur) {
          await facteur.sendMail({
            from: expediteur,
            to: message.destinataire,
            subject: message.sujet,
            // Texte brut uniquement : voir lib/courriel/modeles.ts.
            text: message.corps,
          });
        } else {
          await envoyerUnSms(message.destinataire, message.corps);
        }

        await reserve.query(
          'update message_sortant set envoye_le = now() where id = $1',
          [message.id],
        );
        envoyes += 1;
      } catch (erreur) {
        const motif = erreur instanceof Error ? erreur.message : String(erreur);
        await reserve.query(
          `update message_sortant
              set tentatives = tentatives + 1, derniere_erreur = $2
            where id = $1`,
          [message.id, motif.slice(0, 500)],
        );
        echoues += 1;
      }
    }

    if (envoyes > 0 || echoues > 0) {
      console.log(`${envoyes} envoyé(s), ${echoues} en échec.`);
    }
  } finally {
    await reserve.end();
  }
}

envoyer().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exitCode = 1;
});
