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
    'Les offres du catalogue sont réservées aux personnes qui accueillent des vélos : elles s’ouvrent dès votre premier accueil.',
  offre_indisponible: 'Ce partenaire a retiré cette offre.',
  rupture: 'Cette offre est épuisée pour le moment.',
  solde_insuffisant:
    'Votre solde ne couvre pas encore cette offre. Vos maillons restent valables sans limite de durée.',
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
    message: `Votre bon : ${resultat.code}. Présentez-le au commerçant ; vous le retrouverez aussi plus bas sur cette page.`,
  };
}
