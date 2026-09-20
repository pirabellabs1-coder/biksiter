'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { basculerLeFavori } from '@/lib/depot/favoris';
import { exigerUnMembre } from '@/lib/session';

export async function basculerUnFavori(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const reference = String(donnees.get('reference') ?? '');
  if (!/^[a-z0-9-]{3,60}$/.test(reference)) redirect('/favoris');
  const voulu = donnees.get('voulu') === 'retirer' ? 'retirer' : 'ajouter';
  const decision = await basculerLeFavori(membre.id, reference, voulu);
  revalidatePath('/favoris');

  // On revient là d'où vient le geste : la fiche du lieu (avec sa recherche)
  // ou la liste des favoris, et nulle part ailleurs.
  const retour = String(donnees.get('retour') ?? '');
  const fiche = `/emplacements/${reference}`;
  const base =
    retour === '/favoris' || retour === fiche || retour.startsWith(`${fiche}?`)
      ? retour
      : '/favoris';
  if (decision === 'complet') {
    redirect(`${base}${base.includes('?') ? '&' : '?'}favoris=complet`);
  }
  redirect(base);
}
