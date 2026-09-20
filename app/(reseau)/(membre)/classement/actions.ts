'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { choisirDApparaitreAuClassement } from '@/lib/depot/progression';
import { PERIODES_DU_CLASSEMENT } from '@/lib/regles/progression';
import { exigerUnMembre } from '@/lib/session';

export async function basculerLeClassement(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  await choisirDApparaitreAuClassement(membre.id, donnees.get('apparaitre') === 'oui');
  const periode =
    PERIODES_DU_CLASSEMENT.find((p) => p.cle === donnees.get('periode'))?.cle ?? 'jour';
  revalidatePath('/classement');
  // Le même interrupteur vit dans « Confidentialité et sécurité » : on y
  // revient, et nulle part ailleurs.
  if (donnees.get('retour') === 'confidentialite') {
    redirect('/profil/confidentialite');
  }
  redirect(periode === 'jour' ? '/classement' : `/classement?periode=${periode}`);
}
