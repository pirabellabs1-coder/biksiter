'use server';

import { revalidatePath } from 'next/cache';

import {
  marquerCandidatureTraitee,
  trancher,
  type Decision,
} from '@/lib/depot/moderation';
import {
  ERREUR_GENERALE,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { exigerUnModerateur } from '@/lib/session';

/**
 * Chaque action revérifie que la personne modère. L'écran ne suffit pas :
 * une action serveur est une adresse, et une adresse s'appelle sans passer
 * par l'écran qui la propose.
 */
export async function deciderDeLIdentite(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const moderateur = await exigerUnModerateur();

  const membreId = texte(donnees, 'membre');
  const decision = texte(donnees, 'decision');
  const motif = texte(donnees, 'motif');

  if (decision !== 'verifiee' && decision !== 'refusee') {
    return {
      statut: 'erreur',
      erreurs: { [ERREUR_GENERALE]: 'Décision inconnue.' },
    };
  }

  // Un refus se motive : la personne doit pouvoir comprendre et recommencer,
  // plutôt que rester devant une porte close sans savoir pourquoi.
  if (decision === 'refusee' && motif === '') {
    return {
      statut: 'erreur',
      erreurs: {
        motif:
          'Merci d’indiquer le motif du refus : il aidera le membre à envoyer une pièce valide.',
      },
    };
  }

  const traite = await trancher(
    membreId,
    moderateur.id,
    decision as Decision,
    motif === '' ? null : motif,
  );

  if (!traite) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'Ce dossier a déjà été traité, peut-être par un autre modérateur.',
      },
    };
  }

  revalidatePath('/moderation');
  revalidatePath(`/moderation/membres/${membreId}`);

  return {
    statut: 'valide',
    message:
      decision === 'verifiee'
        ? 'Identité vérifiée. La pièce a été supprimée et le membre est prévenu.'
        : 'Refus enregistré. La pièce a été supprimée et le membre reçoit le motif.',
  };
}

export async function classerLaCandidature(donnees: FormData): Promise<void> {
  const moderateur = await exigerUnModerateur();
  const identifiant = donnees.get('candidature');

  if (typeof identifiant === 'string') {
    await marquerCandidatureTraitee(identifiant, moderateur.id);
    revalidatePath('/moderation');
  }
}
