import 'server-only';

import {
  VIOLATION_UNICITE,
  codeDErreurPostgres,
  dansUneTransaction,
  interroger,
  uneLigne,
} from '@/lib/bd/client';
import { mettreEnFile } from '@/lib/envois/file';
import { bienvenue } from '@/lib/courriel/modeles';
import type { EtatDeVerification } from '@/lib/regles/publication';
import { empreinteDuMotDePasse } from '@/lib/securite/mot-de-passe';

export type Membre = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  verification: EtatDeVerification;
};

export class EmailDejaPris extends Error {
  constructor() {
    super('Un compte existe déjà avec cette adresse.');
    this.name = 'EmailDejaPris';
  }
}

export class InvitationInvalide extends Error {
  constructor() {
    super('Ce code d’invitation n’existe pas ou a déjà servi.');
    this.name = 'InvitationInvalide';
  }
}

export async function membreParId(id: string): Promise<Membre | null> {
  return uneLigne<Membre>(
    'select id, prenom, nom, email, verification from membre where id = $1',
    [id],
  );
}

export async function membreParEmail(email: string): Promise<Membre | null> {
  return uneLigne<Membre>(
    `select id, prenom, nom, email, verification
       from membre where lower(email) = lower($1)`,
    [email],
  );
}

/** Renvoie l'empreinte seule : elle ne doit jamais voyager avec le reste. */
export async function empreinteDuMembre(email: string): Promise<{
  id: string;
  empreinte: string;
} | null> {
  return uneLigne<{ id: string; empreinte: string }>(
    'select id, empreinte from membre where lower(email) = lower($1)',
    [email],
  );
}

export type Inscription = {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  codeDInvitation: string;
};

/**
 * La création d'un compte consomme l'invitation dans la même transaction.
 * Sans cela, deux inscriptions simultanées avec le même code passeraient
 * toutes les deux.
 */
export async function creerLeMembre(inscription: Inscription): Promise<Membre> {
  const empreinte = await empreinteDuMotDePasse(inscription.motDePasse);

  try {
    return await dansUneTransaction(async (client) => {
      const invitation = await client.query<{
        code: string;
        prenomDeLInvitant: string;
      }>(
        `select i.code, m.prenom as "prenomDeLInvitant"
           from invitation i
           join membre m on m.id = i.emise_par
          where i.code = $1 and i.utilisee_par is null
          for update of i`,
        [inscription.codeDInvitation.toUpperCase()],
      );

      if (invitation.rowCount === 0) {
        throw new InvitationInvalide();
      }

      const cree = await client.query<Membre>(
        `insert into membre (prenom, nom, email, empreinte)
         values ($1, $2, $3, $4)
         returning id, prenom, nom, email, verification`,
        [inscription.prenom, inscription.nom, inscription.email, empreinte],
      );

      const membre = cree.rows[0];

      await client.query(
        `update invitation
            set utilisee_par = $1, utilisee_le = now()
          where code = $2`,
        [membre.id, invitation.rows[0].code],
      );

      await mettreEnFile(
        membre.email,
        bienvenue({
          prenom: membre.prenom,
          invitePar: invitation.rows[0].prenomDeLInvitant,
        }),
        { client, aPropos: `membre ${membre.id}` },
      );

      return membre;
    });
  } catch (erreur) {
    if (codeDErreurPostgres(erreur) === VIOLATION_UNICITE) {
      throw new EmailDejaPris();
    }
    throw erreur;
  }
}

/**
 * La vérification d'identité est posée par une personne, jamais par le code
 * applicatif : cette fonction est appelée depuis l'outil de modération.
 */
export async function enregistrerLaVerification(
  membreId: string,
  resultat: Extract<EtatDeVerification, 'verifiee' | 'refusee'>,
): Promise<void> {
  await interroger(
    `update membre
        set verification = $2,
            verifie_le = case when $2 = 'verifiee' then now() else null end
      where id = $1`,
    [membreId, resultat],
  );
}

export async function invitationsDisponibles(
  membreId: string,
): Promise<string[]> {
  const lignes = await interroger<{ code: string }>(
    `select code from invitation
      where emise_par = $1 and utilisee_par is null
      order by creee_le`,
    [membreId],
  );
  return lignes.map((ligne) => ligne.code);
}
