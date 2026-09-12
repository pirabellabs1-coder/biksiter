'use server';

import { revalidatePath } from 'next/cache';

import { baseConfiguree } from '@/lib/bd/client';
import { deposerLaPiece } from '@/lib/depot/pieces';
import { confirmerLeNumero, envoyerUnCode } from '@/lib/depot/telephone';
import {
  ERREUR_GENERALE,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import {
  CHIFFRES_DU_CODE,
  VALIDITE_DU_CODE_MINUTES,
  lireLeNumero,
} from '@/lib/regles/telephone';
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
          'Le dépôt est momentanément indisponible. Merci de réessayer un peu plus tard.',
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
      'Votre pièce d’identité a bien été reçue et chiffrée. Une personne de l’association l’examine généralement sous 24 heures ; elle est ensuite supprimée, au plus tard après sept jours.',
  };
}

/**
 * Le SMS est le seul usage du téléphone : vérifier qu'on joint bien la
 * personne. Les rappels passent par courriel — le coût par message en Belgique
 * rend un SMS de rappel déraisonnable pour une association.
 */
export async function demanderUnCodeSms(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();

  const lecture = lireLeNumero(texte(donnees, 'telephone'));

  if (!lecture.valide) {
    return {
      statut: 'erreur',
      erreurs: {
        telephone:
          lecture.motif === 'pas_un_mobile'
            ? 'Merci d’indiquer un numéro de mobile : les SMS ne peuvent pas être reçus sur une ligne fixe.'
            : 'Ce numéro n’est pas lisible. Exemple : 0470 12 34 56.',
      },
    };
  }

  await envoyerUnCode(membre.id, lecture.numero);
  revalidatePath('/inscription/verification');

  return {
    statut: 'valide',
    message: `Un code à ${CHIFFRES_DU_CODE} chiffres vient d’être envoyé au ${lecture.numero}. Il reste valable ${VALIDITE_DU_CODE_MINUTES} minutes.`,
  };
}

export async function confirmerLeCodeSms(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();
  const saisie = texte(donnees, 'code');

  const confirmation = await confirmerLeNumero(membre.id, saisie);

  if (confirmation.confirme) {
    revalidatePath('/inscription/verification');
    revalidatePath('/mon-compte');
    return { statut: 'valide', message: 'Votre numéro est vérifié.' };
  }

  if (confirmation.resultat === null) {
    return {
      statut: 'erreur',
      erreurs: { code: 'Aucun code en attente : demandez-en un nouveau.' },
    };
  }

  const resultat = confirmation.resultat;
  const messages: Record<string, string> = {
    expire: 'Ce code n’est plus valable : demandez-en un nouveau.',
    epuise: 'Les trois essais sont épuisés. Demandez un nouveau code.',
  };

  return {
    statut: 'erreur',
    erreurs: {
      code:
        resultat.motif === 'incorrect'
          ? `Code incorrect. Il vous reste ${resultat.essaisRestants} essai${resultat.essaisRestants > 1 ? 's' : ''}.`
          : messages[resultat.motif],
    },
  };
}
