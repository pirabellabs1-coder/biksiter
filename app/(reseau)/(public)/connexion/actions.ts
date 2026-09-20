'use server';

import { redirect } from 'next/navigation';

import { baseConfiguree } from '@/lib/bd/client';
import { empreinteDuMembre } from '@/lib/depot/membres';
import { ouvrirUneSession } from '@/lib/depot/sessions';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { texte } from '@/lib/formulaires/etat';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { ACCUEIL_DES_MEMBRES } from '@/lib/navigation';
import {
  LONGUEUR_MAXIMALE_DU_MOT_DE_PASSE,
  ressembleAUnEmail,
} from '@/lib/regles/comptes';
import { CONNEXIONS_REFUSEES } from '@/lib/regles/limites';
import { motDePasseCorrespond } from '@/lib/securite/mot-de-passe';
import { poserLeCookieDeSession, seDeconnecter } from '@/lib/session';

/**
 * Une empreinte fabriquée pour un compte qui n'existe pas.
 *
 * On la vérifie quand même : sans cela, une adresse inconnue répondrait
 * instantanément et une adresse connue après cent millisecondes, ce qui
 * suffit à savoir qui est membre du réseau. Dans un service où être membre
 * signifie « j'ouvre ma porte », cette information n'est pas anodine.
 */
const EMPREINTE_FACTICE =
  'scrypt$32768$8$1$00000000000000000000000000000000$' + '0'.repeat(128);

export type EtatDeLaConnexion =
  { statut: 'vierge' } | { statut: 'erreur'; erreur: string; email: string };

export async function seConnecter(
  _precedent: EtatDeLaConnexion,
  donnees: FormData,
): Promise<EtatDeLaConnexion> {
  const langue = await langueCourante();
  const p = phraseur(langue);

  const email = texte(donnees, 'email');
  const brut = donnees.get('motDePasse');
  const motDePasse = typeof brut === 'string' ? brut : '';

  if (!ressembleAUnEmail(email)) {
    return {
      statut: 'erreur',
      email,
      erreur: p('Entrez une adresse e-mail valide.'),
    };
  }
  if (
    motDePasse === '' ||
    motDePasse.length > LONGUEUR_MAXIMALE_DU_MOT_DE_PASSE
  ) {
    return {
      statut: 'erreur',
      email,
      erreur: p('Entrez votre mot de passe.'),
    };
  }

  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      email,
      erreur: p(
        'La connexion est momentanément indisponible. Vous pouvez réessayer un peu plus tard.',
      ),
    };
  }

  // Vérifié avant le calcul de l'empreinte : c'est ce calcul, volontairement
  // lent, qu'une rafale d'essais chercherait à multiplier.
  if (await limiteDejaAtteinte(CONNEXIONS_REFUSEES, email)) {
    return {
      statut: 'erreur',
      email,
      erreur: p(
        'Plusieurs essais n’ont pas abouti. Par sécurité, patientez un quart d’heure, ou choisissez un nouveau mot de passe.',
      ),
    };
  }

  const compte = await empreinteDuMembre(email);
  const correspond = await motDePasseCorrespond(
    motDePasse,
    compte?.empreinte ?? EMPREINTE_FACTICE,
  );

  if (!compte || !correspond) {
    await noterUneTentative('connexion_refusee', email);
    // Un seul message pour les deux cas : dire « cette adresse est inconnue »
    // reviendrait à publier la liste des membres à qui veut la deviner.
    return {
      statut: 'erreur',
      email,
      erreur: p('Adresse e-mail ou mot de passe incorrect.'),
    };
  }

  // Le mot de passe est bon : dire que le compte est suspendu n'apprend rien à
  // qui ne le connaissait pas déjà.
  if (compte.suspendu) {
    return {
      statut: 'erreur',
      email,
      erreur: p(
        'Ce compte est suspendu. Écrivez à l’association pour en connaître la raison et la suite.',
      ),
    };
  }

  await poserLeCookieDeSession(await ouvrirUneSession(compte.id));

  // `redirect` lève une exception de contrôle : rien ne l'entoure d'un try.
  redirect(ACCUEIL_DES_MEMBRES);
}

export async function seDeconnecterEtRentrer(): Promise<void> {
  await seDeconnecter();
  redirect('/');
}
