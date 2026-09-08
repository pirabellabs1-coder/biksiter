'use server';

import { revalidatePath } from 'next/cache';

import {
  saisirLeCodeDeRemise,
  stationnementParId,
} from '@/lib/depot/stationnements';
import {
  ERREUR_GENERALE,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { exigerUnMembre } from '@/lib/session';

/**
 * Règle 5 — celui qui reçoit le vélo saisit le code.
 *
 * Qui a le droit de saisir se déduit de l'état, pas d'un champ envoyé par le
 * navigateur : au dépôt c'est le bike sitter qui reçoit, à la reprise c'est le
 * cycliste. Un membre qui tenterait de valider sa propre remise ne trouverait
 * donc aucune porte.
 */
export async function saisirLeCode(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();
  const identifiant = texte(donnees, 'stationnement');
  const stationnement = await stationnementParId(identifiant, membre.id);

  if (!stationnement) {
    return {
      statut: 'erreur',
      erreurs: { [ERREUR_GENERALE]: 'Ce stationnement n’existe pas.' },
    };
  }

  const sens = stationnement.etat === 'accepte' ? 'depot' : 'reprise';
  const receveur =
    sens === 'depot' ? stationnement.bikeSitterId : stationnement.cyclisteId;

  if (membre.id !== receveur) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'C’est à l’autre personne de saisir le code : celui qui reçoit le vélo le saisit, celui qui le remet le dicte.',
      },
    };
  }

  const saisie = texte(donnees, 'code');
  if (!/^\d{4}$/.test(saisie)) {
    return { statut: 'erreur', erreurs: { code: 'Le code fait quatre chiffres.' } };
  }

  const resultat = await saisirLeCodeDeRemise(identifiant, sens, saisie);

  if (resultat.accepte) {
    revalidatePath(`/stationnements/${identifiant}`);
    revalidatePath('/mes-stationnements');
    return {
      statut: 'valide',
      message:
        resultat.nouvelEtat === 'en_cours'
          ? 'Le vélo est gardé. Le code de reprise sera donné à celui qui vous le rendra.'
          : 'Le vélo est repris, le stationnement est terminé. Merci à tous les deux.',
    };
  }

  revalidatePath(`/stationnements/${identifiant}`);

  if (resultat.motif === 'expire') {
    return {
      statut: 'erreur',
      erreurs: {
        code: 'Ce code a plus de six heures : il est périmé. Demandez-en un nouveau.',
      },
    };
  }

  if (resultat.motif === 'epuise') {
    return {
      statut: 'erreur',
      erreurs: {
        code:
          'Les trois essais sont épuisés. Un nouveau code vient d’être envoyé à la personne qui remet le vélo.',
      },
    };
  }

  if (resultat.motif === 'inexistant') {
    return {
      statut: 'erreur',
      erreurs: { code: 'Aucun code n’est en attente pour ce stationnement.' },
    };
  }

  return {
    statut: 'erreur',
    erreurs: {
      code:
        resultat.essaisRestants === 0
          ? 'Code incorrect. Les essais sont épuisés : un nouveau code a été généré.'
          : `Code incorrect. Il vous reste ${resultat.essaisRestants} essai${resultat.essaisRestants > 1 ? 's' : ''}.`,
    },
  };
}
