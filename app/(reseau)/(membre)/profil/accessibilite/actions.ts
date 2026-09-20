'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ecrireLesReglages, REGLAGES_D_AFFICHAGE } from '@/lib/regles/accessibilite';
import { TEMOIN_D_AFFICHAGE } from '@/lib/affichage';
import { exigerUnMembre } from '@/lib/session';

/** Un an : un réglage d'affichage ne se refait pas à chaque visite. */
const UN_AN = 60 * 60 * 24 * 365;

export async function enregistrerLAffichage(donnees: FormData): Promise<void> {
  await exigerUnMembre();
  const coches = REGLAGES_D_AFFICHAGE.map((r) => r.cle).filter(
    (cle) => donnees.get(cle) === 'oui',
  );
  const valeur = ecrireLesReglages(coches);
  const temoins = await cookies();
  if (valeur) {
    temoins.set(TEMOIN_D_AFFICHAGE, valeur, {
      maxAge: UN_AN,
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  } else {
    temoins.delete(TEMOIN_D_AFFICHAGE);
  }
  redirect('/profil/accessibilite?enregistre=1');
}
