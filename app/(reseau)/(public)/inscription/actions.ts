'use server';

import { redirect } from 'next/navigation';

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
import { INSCRIPTIONS_REFUSEES } from '@/lib/regles/limites';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';
import { poserLeCookieDeSession } from '@/lib/session';

export type SaisieDInscriptionAffichee = {
  prenom: string;
  nom: string;
  email: string;
};

export type EtatDeLInscription =
  | { statut: 'vierge' }
  | {
      statut: 'erreur';
      erreurs: string[];
      champs: string[];
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
  const refus = (erreurs: string[], champs: string[]): EtatDeLInscription => ({
    statut: 'erreur',
    erreurs,
    champs,
    saisie: affichee,
  });

  const erreurs = verifierLInscription(saisie);
  if (Object.keys(erreurs).length > 0) {
    return refus(
      Object.values(erreurs).map((erreur) => p(erreur)),
      Object.keys(erreurs),
    );
  }

  if (!baseConfiguree()) {
    return refus(
      [
        p(
          'La création de compte est momentanément indisponible. Rien n’a été enregistré : vous pouvez réessayer un peu plus tard.',
        ),
      ],
      [],
    );
  }

  const codeInvalide = refus(
    [
      p(
        'Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez qu’il est recopié tel quel, par exemple MANO-4K29.',
      ),
    ],
    [],
  );
  if (code && (await limiteDejaAtteinte(INSCRIPTIONS_REFUSEES, code))) {
    return codeInvalide;
  }

  let membreId: string;
  try {
    const membre = await creerLeMembre({
      ...saisie,
      codeDInvitation: code === '' && !INSCRIPTION_SUR_INVITATION ? null : code,
    });
    membreId = membre.id;
  } catch (erreur) {
    if (erreur instanceof InvitationInvalide) {
      return codeInvalide;
    }
    if (erreur instanceof EmailDejaPris) {
      // Un même code ne doit pas servir à essayer une liste d'adresses pour
      // savoir lesquelles ont un compte.
      if (code) {
        await noterUneTentative('inscription_refusee', code);
      }
      // Deux comptes sur la même adresse rendraient la vérification
      // d'identité contournable : on s'inscrirait deux fois pour repartir à
      // zéro.
      return refus(
        [
          p(
            'Cette adresse est déjà utilisée. Connectez-vous, ou demandez un nouveau mot de passe.',
          ),
        ],
        ['email'],
      );
    }
    throw erreur;
  }

  await poserLeCookieDeSession(await ouvrirUneSession(membreId));

  // `redirect` lève une exception de contrôle : rien ne l'entoure d'un try.
  redirect('/inscription/telephone');
}
