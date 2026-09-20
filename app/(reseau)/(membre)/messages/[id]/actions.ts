'use server';

import { revalidatePath } from 'next/cache';

import { ecrireUnMessage } from '@/lib/depot/membre-espace';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { exigerUnMembre } from '@/lib/session';

export type EtatDuMessage = { erreur: string | null; envoye: number };

export async function envoyerUnMessage(
  id: string,
  precedent: EtatDuMessage,
  donnees: FormData,
): Promise<EtatDuMessage> {
  const membre = await exigerUnMembre();
  const resultat = await ecrireUnMessage(
    membre.id,
    id,
    String(donnees.get('corps') ?? ''),
  );
  if (!resultat.ok) {
    const p = phraseur(await langueCourante());
    return { erreur: p(resultat.texte), envoye: precedent.envoye };
  }
  revalidatePath(`/messages/${id}`);
  return { erreur: null, envoye: precedent.envoye + 1 };
}
