'use server';

import { baseConfiguree } from '@/lib/bd/client';
import { ASSOCIATION } from '@/lib/contenu/association';
import { annoncerUnDon } from '@/lib/depot/dons';
import {
  ERREUR_GENERALE,
  ressembleAUnEmail,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import {
  DONS_ANNONCES_PAR_ADRESSE_PAR_JOUR,
  lesDonsSontOuverts,
  LONGUEUR_MAXIMALE_DE_L_EMAIL_D_UN_DON,
  LONGUEUR_MAXIMALE_DU_PRENOM_D_UN_DON,
} from '@/lib/regles/dons';

/**
 * Il n'y a pas de paiement en ligne, et ce n'est pas un manque.
 *
 * Un prestataire de carte prend deux à trois pour cent de chaque don. Sur
 * des petits montants, c'est un mois de fonctionnement par an. Le virement
 * ne prend rien.
 */
export async function annoncerMonDon(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  if (!lesDonsSontOuverts(ASSOCIATION)) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'Les dons ouvriront dès que l’association disposera de son compte bancaire.',
      },
    };
  }

  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'La base de données n’est pas branchée : la communication ne peut pas être produite.',
      },
    };
  }

  const prenom = texte(donnees, 'prenom');
  if (prenom.length > LONGUEUR_MAXIMALE_DU_PRENOM_D_UN_DON) {
    return {
      statut: 'erreur',
      erreurs: {
        prenom: `Un prénom tient sur ${LONGUEUR_MAXIMALE_DU_PRENOM_D_UN_DON} caractères, ou peut rester vide.`,
      },
    };
  }

  const email = texte(donnees, 'email');
  if (email.length > LONGUEUR_MAXIMALE_DE_L_EMAIL_D_UN_DON) {
    return {
      statut: 'erreur',
      erreurs: {
        email: `Une adresse tient sur ${LONGUEUR_MAXIMALE_DE_L_EMAIL_D_UN_DON} caractères, ou peut rester vide.`,
      },
    };
  }
  if (email !== '' && !ressembleAUnEmail(email)) {
    return {
      statut: 'erreur',
      erreurs: {
        email:
          'Cette adresse ne semble pas valide. Vous pouvez aussi la laisser vide.',
      },
    };
  }

  const saisie = texte(donnees, 'montant');
  const montant = saisie === '' ? null : Number.parseInt(saisie, 10);
  if (montant !== null && (!Number.isInteger(montant) || montant <= 0)) {
    return {
      statut: 'erreur',
      erreurs: { montant: 'Indiquez un montant en euros, ou laissez vide.' },
    };
  }

  const resultat = await annoncerUnDon({
    prenom: prenom === '' ? null : prenom,
    email: email === '' ? null : email,
    montant,
    iban: ASSOCIATION.iban,
  });

  if (resultat.resultat === 'trop_de_dons') {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]: `Nous avons déjà reçu ${DONS_ANNONCES_PAR_ADRESSE_PAR_JOUR} annonces avec cette adresse aujourd’hui. Vous pouvez utiliser directement la communication déjà envoyée, ou réessayer demain.`,
      },
    };
  }

  return {
    statut: 'valide',
    message:
      `Virement à ${ASSOCIATION.nom}, IBAN ${ASSOCIATION.iban}, ` +
      `communication structurée ${resultat.communication}. ` +
      'Indiquez-la telle quelle lors de votre virement : elle nous permet de le reconnaître.' +
      (email === '' ? '' : ' Elle vous est aussi envoyée par courriel.'),
  };
}
