'use server';

import { revalidatePath } from 'next/cache';

import { echangerUneOffre } from '@/lib/depot/catalogue';
import {
  ERREUR_GENERALE,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { exigerUnMembre } from '@/lib/session';

/**
 * Les refus se disent sans reproche.
 *
 * Nulle part on n'écrit « il vous manque neuf maillons » : entretenir un manque
 * transformerait un remerciement en objectif, et un objectif en classement.
 */
const MOTIFS: Record<string, string> = {
  jamais_accueilli:
    'Le catalogue s’ouvre en accueillant un vélo. C’est la seule façon d’y accéder, et cela ne s’achète pas.',
  offre_indisponible: 'Ce partenaire a retiré cette offre.',
  rupture: 'Il n’en reste plus. Le partenaire en remettra peut-être.',
  solde_insuffisant:
    'Votre solde ne couvre pas encore cette offre. Rien ne presse : les maillons ne périment pas.',
  introuvable: 'Cette offre n’existe plus.',
};

export async function echanger(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();
  const offreId = texte(donnees, 'offre');

  const resultat = await echangerUneOffre(membre.id, offreId);

  if (!resultat.echange) {
    return {
      statut: 'erreur',
      erreurs: { [ERREUR_GENERALE]: MOTIFS[resultat.motif] },
    };
  }

  revalidatePath('/catalogue');
  revalidatePath('/profil');

  return {
    statut: 'valide',
    message: `Votre bon : ${resultat.code}. Présentez-le au commerçant — il ne porte ni votre nom, ni votre solde. Vous le retrouverez plus bas.`,
  };
}
