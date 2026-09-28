'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { choisirDApparaitreAuClassement } from '@/lib/depot/progression';
import { PERIODES_DU_CLASSEMENT } from '@/lib/regles/progression';
import { exigerUnMembre } from '@/lib/session';

/**
 * L'interrupteur « Apparaître dans le classement », depuis la progression.
 *
 * Personne n'y figure sans l'avoir demandé : c'est un choix, qui se reprend
 * aussi facilement qu'il se donne.
 */
export async function basculerMonClassement(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  await choisirDApparaitreAuClassement(
    membre.id,
    donnees.get('apparaitre') === 'oui',
  );
  const periode =
    PERIODES_DU_CLASSEMENT.find((p) => p.cle === donnees.get('periode'))?.cle ??
    'jour';
  revalidatePath('/progression');
  redirect(
    periode === 'jour' ? '/progression' : `/progression?periode=${periode}`,
  );
}
