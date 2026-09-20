import 'server-only';

import { dansUneTransaction } from '@/lib/bd/client';
import { messageDeContactRecu } from '@/lib/courriel/modeles';
import { mettreEnFile } from '@/lib/envois/file';
import {
  peutEncoreEcrire,
  SUJETS_DE_CONTACT,
  type SujetDeContact,
} from '@/lib/regles/contact';

export type ResultatDuMessage = 'enregistre' | 'trop_de_messages';

export async function enregistrerUnMessageDeContact(message: {
  email: string;
  sujet: SujetDeContact;
  message: string;
}): Promise<ResultatDuMessage> {
  return dansUneTransaction(async (client) => {
    // Le comptage et l'écriture se font sous un verrou propre à l'adresse :
    // sans lui, des envois simultanés passeraient tous sous la limite.
    await client.query('select pg_advisory_xact_lock(hashtext(lower($1)))', [
      message.email,
    ]);
    const { rows } = await client.query<{ combien: number }>(
      `select count(*)::int as combien
         from message_de_contact
        where lower(email) = lower($1)
          and recu_le > now() - interval '24 hours'`,
      [message.email],
    );

    if (!peutEncoreEcrire(message.sujet, rows[0]?.combien ?? 0)) {
      return 'trop_de_messages';
    }

    await client.query(
      `insert into message_de_contact (email, sujet, message)
       values ($1, $2, $3)`,
      [message.email, message.sujet, message.message],
    );

    // Les modérateurs sont prévenus dans la même transaction : un message
    // enregistré ne peut pas rester dans une table que personne ne regarde.
    const moderateurs = await client.query<{ email: string }>(
      'select email from membre where moderateur',
    );
    for (const { email } of moderateurs.rows) {
      await mettreEnFile(
        email,
        messageDeContactRecu({
          sujet: SUJETS_DE_CONTACT[message.sujet],
          email: message.email,
          message: message.message,
        }),
        { client, aPropos: 'message de contact' },
      );
    }
    return 'enregistre';
  });
}
