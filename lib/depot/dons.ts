import 'server-only';

import { dansUneTransaction } from '@/lib/bd/client';
import { donAnnonce } from '@/lib/courriel/modeles';
import { mettreEnFile } from '@/lib/envois/file';
import { communicationStructuree } from '@/lib/regles/dons';

/**
 * Les dons.
 *
 * Rien de bancaire n'entre ici : ni numéro de carte, ni mandat, ni jeton d'un
 * prestataire. On enregistre une intention et la communication structurée qui
 * permettra de rapprocher le virement quand il arrivera sur le compte.
 */

export type DonAnnonce = {
  communication: string;
};

export async function annoncerUnDon(don: {
  prenom: string | null;
  email: string | null;
  montant: number | null;
}): Promise<DonAnnonce> {
  return dansUneTransaction(async (client) => {
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
        }),
        { client, aPropos: 'don' },
      );
    }

    return { communication };
  });
}
