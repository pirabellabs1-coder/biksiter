/**
 * Montre la file sortante : courriels et SMS en attente.
 *
 * Le script n'envoie rien. L'envoi appartient à l'application
 * (lib/envois/expedition.ts), qui réserve chaque message avant de l'expédier :
 * un second expéditeur lancé à la main pourrait envoyer deux fois le même
 * message, ou vider d'un coup un arriéré de liens expirés.
 *
 *   npm run bd:messages
 */

import process from 'node:process';

import { Pool } from 'pg';

/** De quoi relire les derniers messages sans noyer le terminal. */
const PAR_PASSE = 50;

type EnAttente = {
  id: string;
  canal: 'courriel' | 'sms';
  destinataire: string;
  sujet: string;
  corps: string;
  tentatives: number;
  derniere_erreur: string | null;
};

async function montrer(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL n’est pas défini.');
    process.exitCode = 1;
    return;
  }

  const reserve = new Pool({ connectionString: url });

  try {
    const attente = await reserve.query<EnAttente>(
      `select id, canal, destinataire, sujet, corps, tentatives, derniere_erreur
         from message_sortant
        where envoye_le is null
        order by cree_le desc
        limit $1`,
      [PAR_PASSE],
    );

    if (attente.rowCount === 0) {
      console.log('Rien en attente.');
      return;
    }

    console.log(
      `${attente.rowCount} message(s) en attente, du plus récent au plus ancien.\n`,
    );
    for (const message of attente.rows) {
      console.log('─'.repeat(70));
      console.log(`Canal  : ${message.canal}`);
      console.log(`À      : ${message.destinataire}`);
      console.log(`Sujet  : ${message.sujet}`);
      if (message.tentatives > 0) {
        console.log(
          `Essais : ${message.tentatives} — ${message.derniere_erreur ?? ''}`,
        );
      }
      console.log('');
      console.log(message.corps);
    }
  } finally {
    await reserve.end();
  }
}

montrer().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exitCode = 1;
});
