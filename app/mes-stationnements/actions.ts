'use server';

import { revalidatePath } from 'next/cache';

import {
  annulerLeStationnement,
  repondreALaDemande,
} from '@/lib/depot/stationnements';
import { exigerUnMembre } from '@/lib/session';

/**
 * Chaque action relit la session et laisse la base vérifier que ce membre a
 * bien le droit d'agir sur ce stationnement : les requêtes portent
 * l'autorisation dans leur `where`, donc un identifiant deviné ne sert à rien.
 *
 * Aucune de ces actions n'a de conséquence sur un « score » : la règle 3
 * interdit tout classement entre membres, et refuser une demande ne coûte
 * rien à celui qui refuse.
 */

async function reponse(
  donnees: FormData,
  choix: 'accepte' | 'refuse',
): Promise<void> {
  const membre = await exigerUnMembre();
  const identifiant = donnees.get('stationnement');

  if (typeof identifiant === 'string') {
    await repondreALaDemande(identifiant, membre.id, choix);
    revalidatePath('/mes-stationnements');
    revalidatePath('/mon-compte');
  }
}

export async function accepterLaDemande(donnees: FormData): Promise<void> {
  await reponse(donnees, 'accepte');
}

export async function refuserLaDemande(donnees: FormData): Promise<void> {
  await reponse(donnees, 'refuse');
}

export async function annuler(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const identifiant = donnees.get('stationnement');

  if (typeof identifiant === 'string') {
    await annulerLeStationnement(identifiant, membre.id);
    revalidatePath('/mes-stationnements');
    revalidatePath('/mon-compte');
  }
}
