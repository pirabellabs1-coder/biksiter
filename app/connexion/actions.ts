'use server';

import { redirect } from 'next/navigation';

import { baseConfiguree } from '@/lib/bd/client';
import { empreinteDuMembre } from '@/lib/depot/membres';
import { ouvrirUneSession } from '@/lib/depot/sessions';
import {
  ERREUR_GENERALE,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { motDePasseCorrespond } from '@/lib/securite/mot-de-passe';
import { poserLeCookieDeSession, seDeconnecter } from '@/lib/session';

/**
 * Une empreinte fabriquée pour un compte qui n'existe pas.
 *
 * On la vérifie quand même : sans cela, une adresse inconnue répondrait
 * instantanément et une adresse connue après cent millisecondes, ce qui
 * suffit à savoir qui est membre du réseau. Dans un service où être membre
 * signifie « j'ouvre ma porte », cette fuite-là n'est pas anodine.
 */
const EMPREINTE_FACTICE =
  'scrypt$32768$8$1$00000000000000000000000000000000$' + '0'.repeat(128);

export async function seConnecter(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'La base de données n’est pas branchée : la connexion est impossible.',
      },
    };
  }

  const email = texte(donnees, 'email');
  const motDePasse = texte(donnees, 'motDePasse');

  if (email === '' || motDePasse === '') {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]: 'Indiquez votre adresse e-mail et votre mot de passe.',
      },
    };
  }

  const compte = await empreinteDuMembre(email);
  const correspond = await motDePasseCorrespond(
    motDePasse,
    compte?.empreinte ?? EMPREINTE_FACTICE,
  );

  if (!compte || !correspond) {
    // Un seul message pour les deux cas : dire « cette adresse est inconnue »
    // reviendrait à publier la liste des membres à qui veut la deviner.
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]: 'Adresse e-mail ou mot de passe incorrect.',
      },
    };
  }

  const jeton = await ouvrirUneSession(compte.id);
  await poserLeCookieDeSession(jeton);

  // `redirect` lève une exception de contrôle : elle doit sortir de l'action,
  // donc rien ne l'entoure d'un try.
  redirect('/mon-compte');
}

export async function seDeconnecterEtRentrer(): Promise<void> {
  await seDeconnecter();
  redirect('/');
}
