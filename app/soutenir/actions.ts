'use server';

import { baseConfiguree } from '@/lib/bd/client';
import { annoncerUnDon } from '@/lib/depot/dons';
import { ASSOCIATION } from '@/lib/contenu/association';
import {
  ERREUR_GENERALE,
  ressembleAUnEmail,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';

/**
 * Il n'y a pas de paiement en ligne, et ce n'est pas un manque.
 *
 * Un prestataire de carte prend deux à trois pour cent de chaque don. Sur des
 * petits montants et pour une association, c'est un mois de fonctionnement par
 * an. Le virement ne prend rien, et la communication structurée suffit à
 * rapprocher le versement de la personne qui l'a fait.
 *
 * Aucune donnée bancaire ne transite ici, et il ne faut pas en ajouter.
 */
export async function annoncerMonDon(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'La base de données n’est pas branchée : la communication ne peut pas être produite.',
      },
    };
  }

  const email = texte(donnees, 'email');
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

  const prenom = texte(donnees, 'prenom');

  const { communication } = await annoncerUnDon({
    prenom: prenom === '' ? null : prenom,
    email: email === '' ? null : email,
    montant,
  });

  return {
    statut: 'valide',
    message:
      `Virement à ${ASSOCIATION.nom}, IBAN ${ASSOCIATION.iban}, ` +
      `communication structurée ${communication}. ` +
      'Recopiez-la telle quelle : c’est ce qui nous permet de reconnaître votre virement.' +
      (email === '' ? '' : ' Elle vous est aussi envoyée par courriel.'),
  };
}
