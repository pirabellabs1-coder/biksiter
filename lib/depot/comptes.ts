import 'server-only';

import { adresseDuSite } from '@/lib/adresse-du-site';
import { dansUneTransaction, uneLigne } from '@/lib/bd/client';
import {
  confirmationDAdresse,
  nouveauMotDePasse,
} from '@/lib/courriel/modeles';
import { consommerUnJeton, emettreUnJeton } from '@/lib/depot/jetons';
import { lienDeConfirmation } from '@/lib/depot/membres';
import { mettreEnFile } from '@/lib/envois/file';
import type { EtatDeVerification } from '@/lib/regles/publication';
import { empreinteDuMotDePasse } from '@/lib/securite/mot-de-passe';

/**
 * Le compte d'un membre : l'adresse e-mail, le mot de passe, et où en sont
 * ses vérifications.
 */

export type EtatDuCompte = {
  email: string;
  emailVerifieLe: Date | null;
  telephone: string | null;
  telephoneVerifieLe: Date | null;
  verification: EtatDeVerification;
  pieceDeposeeLe: Date | null;
};

export async function etatDuCompte(
  membreId: string,
): Promise<EtatDuCompte | null> {
  return uneLigne<EtatDuCompte>(
    `select m.email,
            m.email_verifie_le     as "emailVerifieLe",
            m.telephone,
            m.telephone_verifie_le as "telephoneVerifieLe",
            m.verification,
            p.deposee_le           as "pieceDeposeeLe"
       from membre m
       left join piece_didentite p on p.membre_id = m.id
      where m.id = $1`,
    [membreId],
  );
}

/** Confirme l'adresse du membre à qui appartient le jeton. */
export async function confirmerLAdresse(jeton: string): Promise<boolean> {
  return dansUneTransaction(async (client) => {
    const membreId = await consommerUnJeton(
      jeton,
      'confirmation_email',
      client,
    );
    if (!membreId) {
      return false;
    }
    await client.query(
      `update membre
          set email_verifie_le = coalesce(email_verifie_le, now())
        where id = $1`,
      [membreId],
    );
    return true;
  });
}

export async function renvoyerLaConfirmation(membreId: string): Promise<void> {
  await dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      prenom: string;
      email: string;
      email_verifie_le: Date | null;
    }>('select prenom, email, email_verifie_le from membre where id = $1', [
      membreId,
    ]);
    const membre = rows[0];
    if (!membre || membre.email_verifie_le) {
      return;
    }
    const jeton = await emettreUnJeton(client, membreId, 'confirmation_email');
    await mettreEnFile(
      membre.email,
      confirmationDAdresse({
        prenom: membre.prenom,
        lien: lienDeConfirmation(jeton),
      }),
      { client, aPropos: `membre ${membreId}` },
    );
  });
}

/**
 * Le lien pour choisir un nouveau mot de passe.
 *
 * Rien ne dit à l'appelant si l'adresse existe : la page répond la même chose
 * dans les deux cas, et savoir qui est membre d'un réseau où l'on ouvre sa
 * porte n'est pas une information anodine.
 */
export async function demanderUnNouveauMotDePasse(
  email: string,
): Promise<void> {
  await dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      id: string;
      prenom: string;
      email: string;
    }>('select id, prenom, email from membre where lower(email) = lower($1)', [
      email,
    ]);
    const membre = rows[0];
    if (!membre) {
      return;
    }
    const jeton = await emettreUnJeton(
      client,
      membre.id,
      'nouveau_mot_de_passe',
    );
    await mettreEnFile(
      membre.email,
      nouveauMotDePasse({
        prenom: membre.prenom,
        lien: `${adresseDuSite()}/nouveau-mot-de-passe?jeton=${encodeURIComponent(jeton)}`,
      }),
      { client, aPropos: `membre ${membre.id}` },
    );
  });
}

/**
 * Change le mot de passe et ferme toutes les sessions ouvertes : si quelqu'un
 * d'autre connaissait l'ancien, il ne doit pas rester connecté. Ouvrir le lien
 * prouve aussi qu'on lit cette boîte, donc l'adresse est confirmée au passage.
 */
export async function choisirUnNouveauMotDePasse(
  jeton: string,
  motDePasse: string,
): Promise<string | null> {
  const empreinte = await empreinteDuMotDePasse(motDePasse);

  return dansUneTransaction(async (client) => {
    const membreId = await consommerUnJeton(
      jeton,
      'nouveau_mot_de_passe',
      client,
    );
    if (!membreId) {
      return null;
    }
    await client.query(
      `update membre
          set empreinte = $2,
              email_verifie_le = coalesce(email_verifie_le, now())
        where id = $1`,
      [membreId, empreinte],
    );
    await client.query('delete from session where membre_id = $1', [membreId]);
    return membreId;
  });
}
