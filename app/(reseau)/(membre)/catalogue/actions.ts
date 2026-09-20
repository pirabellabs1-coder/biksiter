'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { motifDuRefusDEchange } from '@/components/app/progression';
import { echangerUneOffre } from '@/lib/depot/catalogue';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { exigerUnMembre } from '@/lib/session';

export type EtatDeLEchange = { erreur: string | null };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function confirmerLEchange(
  offreId: string,
  _precedent: EtatDeLEchange,
  _donnees: FormData,
): Promise<EtatDeLEchange> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());
  if (!IDENTIFIANT.test(offreId)) {
    return { erreur: motifDuRefusDEchange(p, 'introuvable') };
  }

  const resultat = await echangerUneOffre(membre.id, offreId);
  if (!resultat.echange) {
    // Le solde a pu changer depuis l'affichage : on relit le motif tel que la
    // transaction l'a établi, sans chiffre qui pourrait déjà être faux.
    return {
      erreur:
        resultat.motif === 'solde_insuffisant'
          ? p('Votre solde ne couvre plus cet avantage.')
          : motifDuRefusDEchange(p, resultat.motif),
    };
  }

  revalidatePath('/catalogue');
  revalidatePath('/progression');
  redirect(`/catalogue/bons/${resultat.id}?nouveau=1`);
}
