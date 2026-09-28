'use server';

import { redirect } from 'next/navigation';

import { adresseIpDuVisiteur } from '@/lib/adresse-ip';
import { baseConfiguree } from '@/lib/bd/client';
import {
  creerLeMembre,
  EmailDejaPris,
  InvitationInvalide,
} from '@/lib/depot/membres';
import { ouvrirUneSession } from '@/lib/depot/sessions';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { texte } from '@/lib/formulaires/etat';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { verifierLInscription } from '@/lib/regles/comptes';
import {
  INSCRIPTIONS_REFUSEES,
  INSCRIPTIONS_REFUSEES_PAR_CONNEXION,
} from '@/lib/regles/limites';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';
import { poserLeCookieDeSession } from '@/lib/session';

export type SaisieDInscriptionAffichee = {
  prenom: string;
  nom: string;
  email: string;
};

export type ChampDInscription =
  | 'prenom'
  | 'nom'
  | 'email'
  | 'motDePasse'
  | 'code'
  | 'charte';

export type EtatDeLInscription =
  | { statut: 'vierge' }
  | {
      statut: 'erreur';
      /** Ce qui ne tient à aucun champ (base indisponible, par exemple). */
      erreurs: string[];
      /** Un message par champ à revoir, affiché sous ce champ et nulle part ailleurs. */
      parChamp: Partial<Record<ChampDInscription, string>>;
      saisie: SaisieDInscriptionAffichee;
    };

export async function creerLeCompte(
  _precedent: EtatDeLInscription,
  donnees: FormData,
): Promise<EtatDeLInscription> {
  const langue = await langueCourante();
  const p = phraseur(langue);

  // Le mot de passe ne quitte jamais cette fonction : il est haché avant
  // d'atteindre la base, et n'est ni journalisé, ni renvoyé au navigateur.
  const saisie = {
    prenom: texte(donnees, 'prenom').slice(0, 80),
    nom: texte(donnees, 'nom').slice(0, 80),
    email: texte(donnees, 'email'),
    motDePasse:
      typeof donnees.get('motDePasse') === 'string'
        ? (donnees.get('motDePasse') as string)
        : '',
  };
  const code = texte(donnees, 'code').toUpperCase();
  const affichee = {
    prenom: saisie.prenom,
    nom: saisie.nom,
    email: saisie.email,
  };
  const refus = (
    erreurs: string[],
    parChamp: Partial<Record<ChampDInscription, string>>,
  ): EtatDeLInscription => ({
    statut: 'erreur',
    erreurs,
    parChamp,
    saisie: affichee,
  });

  const parChamp: Partial<Record<ChampDInscription, string>> = {
    ...verifierLInscription(saisie),
  };
  // La charte engage : une case non cochée arrête l'inscription ici, pas
  // seulement dans le navigateur.
  if (donnees.get('charte') !== 'on') {
    parChamp.charte =
      'Acceptez les règles du réseau et la charte de garde pour continuer.';
  }
  if (Object.keys(parChamp).length > 0) {
    return refus(
      [],
      Object.fromEntries(
        Object.entries(parChamp).map(([champ, message]) => [champ, p(message)]),
      ),
    );
  }

  if (!baseConfiguree()) {
    return refus(
      [
        p(
          'La création de compte est momentanément indisponible. Rien n’a été enregistré : vous pouvez réessayer un peu plus tard.',
        ),
      ],
      {},
    );
  }

  // Un code faux n'est jamais ignoré en silence : la personne croirait avoir
  // été invitée, et son invitante ne la verrait jamais arriver. Tant que les
  // inscriptions sont ouvertes, on lui dit aussi qu'elle peut s'en passer.
  const codeInvalide = refus([], {
    code: INSCRIPTION_SUR_INVITATION
      ? p(
          'Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez qu’il est recopié tel quel, par exemple MANO-4K29PB.',
        )
      : p(
          'Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez qu’il est recopié tel quel, ou videz le champ : l’inscription est ouverte sans code.',
        ),
  });
  if (code && (await limiteDejaAtteinte(INSCRIPTIONS_REFUSEES, code))) {
    return codeInvalide;
  }
  // La limite par connexion passe avant le calcul du mot de passe, qui
  // coûte : les essais en série s'arrêtent sans rien consommer.
  const connexion = `connexion:${await adresseIpDuVisiteur()}`;
  if (await limiteDejaAtteinte(INSCRIPTIONS_REFUSEES_PAR_CONNEXION, connexion)) {
    return refus(
      [
        p(
          'Plusieurs inscriptions n’ont pas abouti depuis cette connexion aujourd’hui. Vous pourrez réessayer demain, ou nous écrire si vous avez besoin d’aide.',
        ),
      ],
      {},
    );
  }

  let membreId: string;
  try {
    const membre = await creerLeMembre({
      ...saisie,
      codeDInvitation:
        code === '' && !INSCRIPTION_SUR_INVITATION ? null : code,
    });
    membreId = membre.id;
  } catch (erreur) {
    if (erreur instanceof InvitationInvalide) {
      await noterUneTentative('inscription_refusee', connexion);
      return codeInvalide;
    }
    if (erreur instanceof EmailDejaPris) {
      // Un même code ne doit pas servir à essayer une liste d'adresses pour
      // savoir lesquelles ont un compte.
      if (code) {
        await noterUneTentative('inscription_refusee', code);
      }
      await noterUneTentative('inscription_refusee', connexion);
      // Deux comptes sur la même adresse rendraient la vérification
      // d'identité contournable : on s'inscrirait deux fois pour repartir à
      // zéro.
      return refus([], {
        email: p(
          'Cette adresse est déjà utilisée. Connectez-vous, ou demandez un nouveau mot de passe.',
        ),
      });
    }
    throw erreur;
  }

  await poserLeCookieDeSession(await ouvrirUneSession(membreId));

  // `redirect` lève une exception de contrôle : rien ne l'entoure d'un try.
  redirect('/inscription/telephone');
}
