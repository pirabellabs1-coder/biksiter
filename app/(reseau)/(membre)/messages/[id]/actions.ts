'use server';

import { revalidatePath } from 'next/cache';

import { ecrireUnMessage } from '@/lib/depot/membre-espace';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { estUnTypeAccepte, TAILLE_MAXIMALE_OCTETS } from '@/lib/regles/photos';
import { exigerUnMembre } from '@/lib/session';

export type EtatDuMessage = { erreur: string | null; envoye: number };

export async function envoyerUnMessage(
  id: string,
  precedent: EtatDuMessage,
  donnees: FormData,
): Promise<EtatDuMessage> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());

  let photo: Buffer | null = null;
  const fichier = donnees.get('photo');
  if (fichier instanceof File && fichier.size > 0) {
    if (!estUnTypeAccepte(fichier.type)) {
      return { erreur: p('Joignez une image.'), envoye: precedent.envoye };
    }
    // Au-delà, on refuse avant de lire le fichier.
    if (fichier.size > TAILLE_MAXIMALE_OCTETS) {
      return {
        erreur: p('Cette photo est trop lourde (8 Mo maximum).'),
        envoye: precedent.envoye,
      };
    }
    photo = Buffer.from(await fichier.arrayBuffer());
  }

  const resultat = await ecrireUnMessage(
    membre.id,
    id,
    String(donnees.get('corps') ?? ''),
    photo,
  );
  if (!resultat.ok) {
    return { erreur: p(resultat.texte), envoye: precedent.envoye };
  }
  revalidatePath(`/messages/${id}`);
  return { erreur: null, envoye: precedent.envoye + 1 };
}
