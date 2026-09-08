import 'server-only';

import { dansUneTransaction, uneLigne } from '@/lib/bd/client';
import { mettreUnSmsEnFile } from '@/lib/envois/file';
import {
  CHIFFRES_DU_CODE,
  VALIDITE_DU_CODE_MINUTES,
  verifierLeCode,
  type ResultatDeSaisieTelephone,
} from '@/lib/regles/telephone';
import { empreinteDuJeton, nouveauCodeNumerique } from '@/lib/securite/jeton';

/**
 * La vérification d'un numéro de téléphone.
 *
 * On garde l'empreinte du code et non le code : dix minutes suffisent pour
 * qu'une fuite de la base serve à quelqu'un, et il n'y a aucune raison de
 * courir ce risque pour une valeur qu'on n'a jamais besoin de relire.
 */

export type EtatDuTelephone = {
  telephone: string | null;
  verifieLe: Date | null;
  codeEnvoyeLe: Date | null;
};

export async function etatDuTelephone(
  membreId: string,
): Promise<EtatDuTelephone> {
  const ligne = await uneLigne<EtatDuTelephone>(
    `select m.telephone,
            m.telephone_verifie_le as "verifieLe",
            c.emis_le              as "codeEnvoyeLe"
       from membre m
       left join code_telephone c on c.membre_id = m.id
      where m.id = $1`,
    [membreId],
  );

  return ligne ?? { telephone: null, verifieLe: null, codeEnvoyeLe: null };
}

/**
 * Envoyer un code remplace celui qui traînait : quelqu'un qui redemande un
 * code le fait parce que le premier n'est pas arrivé, et devoir choisir entre
 * deux codes ne l'aiderait pas.
 */
export async function envoyerUnCode(
  membreId: string,
  numero: string,
): Promise<void> {
  const code = nouveauCodeNumerique(CHIFFRES_DU_CODE);

  await dansUneTransaction(async (client) => {
    await client.query(
      `insert into code_telephone (membre_id, telephone, empreinte)
       values ($1, $2, $3)
       on conflict (membre_id) do update
          set telephone = excluded.telephone,
              empreinte = excluded.empreinte,
              emis_le = now(),
              essais_utilises = 0`,
      [membreId, numero, empreinteDuJeton(code)],
    );

    await mettreUnSmsEnFile(
      numero,
      `Bike Sitters : votre code est ${code}. Il vaut ${VALIDITE_DU_CODE_MINUTES} minutes. ` +
        'Si vous ne l’avez pas demandé, ignorez ce message.',
      { client, aPropos: `téléphone ${membreId}` },
    );
  });
}

/** Un échec de confirmation porte toujours un résultat d'échec — jamais un
 *  succès. Le type le dit pour éviter d'avoir à le revérifier partout. */
export type EchecDeSaisie = Extract<
  ResultatDeSaisieTelephone,
  { accepte: false }
>;

export type Confirmation =
  | { confirme: true; numero: string }
  | { confirme: false; resultat: EchecDeSaisie | null };

/**
 * La décision (bon code ? expiré ? combien d'essais reste-t-il ?) est prise
 * par lib/regles/telephone.ts ; ici on lit, on applique et on écrit.
 */
export async function confirmerLeNumero(
  membreId: string,
  saisie: string,
): Promise<Confirmation> {
  return dansUneTransaction(async (client) => {
    const trouve = await client.query<{
      telephone: string;
      empreinte: string;
      emis_le: Date;
      essais_utilises: number;
    }>(
      `select telephone, empreinte, emis_le, essais_utilises
         from code_telephone where membre_id = $1 for update`,
      [membreId],
    );

    if (trouve.rowCount === 0) {
      return { confirme: false, resultat: null };
    }

    const ligne = trouve.rows[0];
    const resultat = verifierLeCode(
      {
        emisLe: new Date(ligne.emis_le),
        essaisUtilises: ligne.essais_utilises,
      },
      empreinteDuJeton(saisie) === ligne.empreinte,
      new Date(),
    );

    if (resultat.accepte) {
      await client.query(
        `update membre
            set telephone = $2, telephone_verifie_le = now()
          where id = $1`,
        [membreId, ligne.telephone],
      );
      // Le code a servi : il n'a plus rien à faire là.
      await client.query('delete from code_telephone where membre_id = $1', [
        membreId,
      ]);
      return { confirme: true, numero: ligne.telephone };
    }

    if (resultat.motif === 'incorrect') {
      await client.query(
        `update code_telephone
            set essais_utilises = essais_utilises + 1
          where membre_id = $1`,
        [membreId],
      );
    }

    return { confirme: false, resultat };
  });
}
