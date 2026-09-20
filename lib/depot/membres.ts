import 'server-only';

import {
  VIOLATION_UNICITE,
  codeDErreurPostgres,
  dansUneTransaction,
  interroger,
  uneLigne,
} from '@/lib/bd/client';
import { mettreEnFile } from '@/lib/envois/file';
import { adresseDuSite } from '@/lib/adresse-du-site';
import { bienvenue } from '@/lib/courriel/modeles';
import { emettreUnJeton } from '@/lib/depot/jetons';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';
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
  suspendu: boolean;
} | null> {
  return uneLigne<{ id: string; empreinte: string; suspendu: boolean }>(
    'select id, empreinte, suspendu from membre where lower(email) = lower($1) and supprime_le is null',
    [email],
  );
}

export type Inscription = {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  /** `null` quand le réseau accepte les inscriptions sans invitation. */
  codeDInvitation: string | null;
};

/**
 * La création d'un compte consomme l'invitation dans la même transaction.
 * Sans cela, deux inscriptions simultanées avec le même code passeraient
 * toutes les deux.
 *
 * Le message de bienvenue part dans la même transaction, avec le lien qui
 * confirme l'adresse : un compte ne peut pas exister sans que ce lien ait été
 * mis en file.
 */
export async function creerLeMembre(inscription: Inscription): Promise<Membre> {
  const empreinte = await empreinteDuMotDePasse(inscription.motDePasse);

  if (inscription.codeDInvitation === null && INSCRIPTION_SUR_INVITATION) {
    throw new InvitationInvalide();
  }

  try {
    return await dansUneTransaction(async (client) => {
      let invitation: { code: string; prenomDeLInvitant: string } | null = null;

      if (inscription.codeDInvitation !== null) {
        const trouvee = await client.query<{
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
        invitation = trouvee.rows[0] ?? null;
        if (!invitation) {
          throw new InvitationInvalide();
        }
      }

      const cree = await client.query<Membre>(
        `insert into membre (prenom, nom, email, empreinte)
         values ($1, $2, $3, $4)
         returning id, prenom, nom, email, verification`,
        [inscription.prenom, inscription.nom, inscription.email, empreinte],
      );

      const membre = cree.rows[0]!;

      if (invitation) {
        await client.query(
          `update invitation
              set utilisee_par = $1, utilisee_le = now()
            where code = $2`,
          [membre.id, invitation.code],
        );
      }

      const jeton = await emettreUnJeton(
        client,
        membre.id,
        'confirmation_email',
      );

      await mettreEnFile(
        membre.email,
        bienvenue({
          prenom: membre.prenom,
          invitePar: invitation?.prenomDeLInvitant ?? null,
          lienDeConfirmation: lienDeConfirmation(jeton),
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

export function lienDeConfirmation(jeton: string): string {
  return `${adresseDuSite()}/confirmer-mon-email?jeton=${encodeURIComponent(jeton)}`;
}

export type InvitationPresentee = {
  prenom: string;
  depuis: number;
  identiteVerifiee: boolean;
  /** Le quartier d'un emplacement publié par la personne qui invite, s'il y en a un. */
  quartier: string | null;
};

/**
 * Ce qu'on montre de la personne qui invite, avant même d'avoir un compte :
 * son prénom, l'année de son arrivée, et si son identité est vérifiée. Rien
 * qui permette de la trouver.
 */
export async function invitationPresentee(
  code: string,
): Promise<InvitationPresentee | null> {
  if (!/^[A-Z0-9-]{6,20}$/.test(code.toUpperCase())) {
    return null;
  }
  return uneLigne<InvitationPresentee>(
    `select m.prenom,
            extract(year from m.cree_le)::int as depuis,
            m.verification = 'verifiee'       as "identiteVerifiee",
            (select e.quartier from emplacement e
              where e.membre_id = m.id and e.publie
              order by e.cree_le limit 1)      as quartier
       from invitation i
       join membre m on m.id = i.emise_par
      where i.code = $1 and i.utilisee_par is null`,
    [code.toUpperCase()],
  );
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
