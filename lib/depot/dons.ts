import 'server-only';

import { dansUneTransaction } from '@/lib/bd/client';
import { donAnnonce } from '@/lib/courriel/modeles';
import { mettreEnFile } from '@/lib/envois/file';
import {
  communicationStructuree,
  peutEncoreAnnoncerUnDon,
} from '@/lib/regles/dons';

/**
 * Les dons.
 *
 * Rien de bancaire n'entre ici : ni numéro de carte, ni mandat, ni jeton d'un
 * prestataire. On enregistre une intention et la communication structurée qui
 * permettra de rapprocher le virement quand il arrivera sur le compte.
 */

export type DonAnnonce =
  | { resultat: 'annonce'; communication: string }
  | { resultat: 'trop_de_dons' };

export async function annoncerUnDon(don: {
  prenom: string | null;
  email: string | null;
  montant: number | null;
  /** Le compte où le virement doit arriver. L'appelant a vérifié qu'il existe. */
  iban: string;
}): Promise<DonAnnonce> {
  return dansUneTransaction(async (client) => {
    // Le comptage et l'écriture se font sous un verrou propre à l'adresse :
    // sans lui, des envois simultanés passeraient tous sous la limite.
    // Un don anonyme n'ouvre pas de canal d'envoi et ne bénéficie pas du
    // même verrou — la limite y est portée par le rythme des annonces
    // enregistrées côté serveur (voir count ci-dessous).
    if (don.email) {
      await client.query('select pg_advisory_xact_lock(hashtext(lower($1)))', [
        don.email,
      ]);
      const { rows } = await client.query<{ combien: number }>(
        `select count(*)::int as combien
           from don
          where email is not null
            and lower(email) = lower($1)
            and annonce_le > now() - interval '24 hours'`,
        [don.email],
      );
      if (!peutEncoreAnnoncerUnDon(rows[0]?.combien ?? 0)) {
        return { resultat: 'trop_de_dons' } as const;
      }
    }

    // La séquence garantit que deux dons annoncés à la même seconde ne
    // reçoivent pas la même communication — sans quoi ils deviendraient
    // impossibles à distinguer sur l'extrait de compte.
    const numero = await client.query<{ numero: string }>(
      "select nextval('don_numero')::text as numero",
    );

    const communication = communicationStructuree(
      Number(numero.rows[0].numero),
    );

    await client.query(
      `insert into don (prenom, email, montant_annonce, communication)
       values ($1, $2, $3, $4)`,
      [don.prenom, don.email, don.montant, communication],
    );

    if (don.email) {
      await mettreEnFile(
        don.email,
        donAnnonce({
          prenom: don.prenom,
          montant: don.montant,
          communication,
          iban: don.iban,
        }),
        { client, aPropos: 'don' },
      );
    }

    return { resultat: 'annonce', communication } as const;
  });
}
