'use server';

import { revalidatePath } from 'next/cache';

import { baseConfiguree } from '@/lib/bd/client';
import { deposerLaPiece } from '@/lib/depot/pieces';
import {
  ERREUR_GENERALE,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import {
  TAILLE_MAXIMALE_OCTETS,
  estUnTypeAccepte,
  refusDuDepot,
} from '@/lib/regles/pieces';
import { chiffrementDisponible } from '@/lib/securite/chiffrement';
import { exigerUnMembre } from '@/lib/session';

const MESSAGES: Record<string, string> = {
  vide: 'Le fichier est vide. Choisissez une photo ou un PDF.',
  type_refuse:
    'Ce format n’est pas accepté. Envoyez une photo (JPEG, PNG, WebP) ou un PDF.',
  trop_lourde: `Le fichier dépasse ${Math.round(TAILLE_MAXIMALE_OCTETS / (1024 * 1024))} Mo. Une photo prise au téléphone suffit largement.`,
};

export async function deposerLaPieceDidentite(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();

  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'La base de données n’est pas branchée : le dépôt est impossible.',
      },
    };
  }

  // Sans clé de chiffrement, on ferme le dépôt. On ne stocke pas une pièce
  // d'identité en clair « en attendant que quelqu'un configure la clé ».
  if (!chiffrementDisponible()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'Le dépôt est momentanément fermé : la clé de chiffrement des pièces n’est pas configurée. Rien n’est stocké tant qu’elle ne l’est pas.',
      },
    };
  }

  const fichier = donnees.get('piece');

  if (!(fichier instanceof File)) {
    return {
      statut: 'erreur',
      erreurs: { piece: 'Choisissez un fichier à envoyer.' },
    };
  }

  const refus = refusDuDepot({ type: fichier.type, taille: fichier.size });
  if (refus) {
    return { statut: 'erreur', erreurs: { piece: MESSAGES[refus] } };
  }

  // `refusDuDepot` a déjà tranché ; ce second passage n'est là que pour donner
  // au compilateur le type fermé qu'attend le dépôt.
  if (!estUnTypeAccepte(fichier.type)) {
    return { statut: 'erreur', erreurs: { piece: MESSAGES.type_refuse } };
  }

  await deposerLaPiece(membre.id, {
    contenu: Buffer.from(await fichier.arrayBuffer()),
    typeMime: fichier.type,
  });

  revalidatePath('/inscription/verification');
  revalidatePath('/mon-compte');

  return {
    statut: 'valide',
    message:
      'Votre pièce est enregistrée, chiffrée. Une personne la relit sous 24 heures, puis elle est supprimée — au plus tard après sept jours, même si personne ne l’a regardée.',
  };
}
