'use server';

import { revalidatePath } from 'next/cache';

import { baseConfiguree } from '@/lib/bd/client';
import { etatDuCompte } from '@/lib/depot/comptes';
import { deposerLaPiece } from '@/lib/depot/pieces';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import {
  refusDuDepot,
  TAILLE_MAXIMALE_OCTETS,
  typeReelDuFichier,
} from '@/lib/regles/pieces';
import { chiffrementDisponible } from '@/lib/securite/chiffrement';
import { exigerUnMembre } from '@/lib/session';

export type EtatDeLaPiece =
  | { statut: 'vierge' }
  | { statut: 'erreur'; erreur: string }
  | { statut: 'envoyee'; message: string };

export async function envoyerLaPiece(
  _precedent: EtatDeLaPiece,
  donnees: FormData,
): Promise<EtatDeLaPiece> {
  const membre = await exigerUnMembre();
  const langue = await langueCourante();
  const p = phraseur(langue);

  if (membre.verification === 'verifiee') {
    return {
      statut: 'envoyee',
      message: p('Votre identité est déjà vérifiée.'),
    };
  }

  // Sans clé de chiffrement, le dépôt reste fermé : une pièce d'identité ne
  // se stocke pas en clair, pas même en attendant.
  if (!baseConfiguree() || !chiffrementDisponible()) {
    return {
      statut: 'erreur',
      erreur: p(
        'Le dépôt est momentanément indisponible. Rien n’a été envoyé : vous pouvez réessayer un peu plus tard.',
      ),
    };
  }

  // Les étapes précédentes ne sont pas décoratives : une pièce n'est examinée
  // que pour quelqu'un dont on sait déjà joindre l'adresse et le téléphone.
  const compte = await etatDuCompte(membre.id);
  if (!compte?.emailVerifieLe || !compte.telephoneVerifieLe) {
    return {
      statut: 'erreur',
      erreur: p(
        'Confirmez d’abord votre adresse e-mail et votre numéro de téléphone : la pièce d’identité vient ensuite.',
      ),
    };
  }

  if (donnees.get('majeur') !== 'oui') {
    return {
      statut: 'erreur',
      erreur: p("Confirmez d'abord que vous êtes majeur."),
    };
  }

  const fichier = donnees.get('piece');
  if (!(fichier instanceof File) || fichier.size === 0) {
    return {
      statut: 'erreur',
      erreur: p('Choisissez une photo de votre pièce d’identité, ou un PDF.'),
    };
  }

  const contenu = Buffer.from(await fichier.arrayBuffer());
  const typeReel = typeReelDuFichier(contenu);
  const refus = refusDuDepot({
    type: typeReel ?? 'inconnu',
    taille: fichier.size,
  });
  if (refus || !typeReel) {
    return {
      statut: 'erreur',
      erreur:
        refus === 'trop_lourde'
          ? p(
              'Le fichier dépasse {taille} Mo. Une photo prise au téléphone suffit largement.',
              { taille: Math.round(TAILLE_MAXIMALE_OCTETS / (1024 * 1024)) },
            )
          : p(
              'Ce format n’est pas accepté. Envoyez une photo (JPEG, PNG, WebP) ou un PDF.',
            ),
    };
  }

  await deposerLaPiece(membre.id, { contenu, typeMime: typeReel });
  revalidatePath('/inscription/identite');

  return {
    statut: 'envoyee',
    message: p(
      'Envoyé. Un administrateur vérifie votre pièce sous 24 heures, et vous serez prévenu du résultat.',
    ),
  };
}
