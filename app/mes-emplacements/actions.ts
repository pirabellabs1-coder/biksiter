'use server';

import { revalidatePath } from 'next/cache';

import { changerLaPublication } from '@/lib/depot/emplacements';
import { exigerUnMembre } from '@/lib/session';

/**
 * Mettre en pause, ou remettre sur la carte.
 *
 * Toujours possible, quelle que soit la situation : un emplacement dépublié ne
 * reçoit plus de demande mais laisse vivre les stationnements déjà acceptés.
 * C'est ce qu'on propose à quelqu'un qui part en vacances, plutôt que de lui
 * faire tout effacer.
 */
async function publier(donnees: FormData, publie: boolean): Promise<void> {
  const membre = await exigerUnMembre();
  const reference = donnees.get('emplacement');

  // Règle 2 : republier suppose une identité vérifiée. Le déclencheur en base
  // le refuserait de toute façon, mais il vaut mieux ne pas déclencher une
  // erreur SQL pour un cas qu'on sait reconnaître ici — celui d'un membre dont
  // la vérification a été retirée entre-temps.
  if (publie && membre.verification !== 'verifiee') {
    return;
  }

  if (typeof reference === 'string') {
    await changerLaPublication(reference, membre.id, publie);
    revalidatePath('/mes-emplacements');
    revalidatePath('/emplacements');
    revalidatePath(`/emplacements/${reference}`);
  }
}

export async function mettreEnPause(donnees: FormData): Promise<void> {
  await publier(donnees, false);
}

export async function republier(donnees: FormData): Promise<void> {
  await publier(donnees, true);
}
