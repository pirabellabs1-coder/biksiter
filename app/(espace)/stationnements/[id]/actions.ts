'use server';

import { revalidatePath } from 'next/cache';

import { ecrireUnAvis } from '@/lib/depot/avis';
import { ecrireUnMessage } from '@/lib/depot/echanges';
import {
  saisirLeCodeDeRemise,
  stationnementParId,
} from '@/lib/depot/stationnements';
import { LONGUEUR_MAXIMALE_DE_LAVIS } from '@/lib/regles/avis';
import { LONGUEUR_MAXIMALE_DU_MESSAGE } from '@/lib/regles/echanges';
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
      erreurs: { [ERREUR_GENERALE]: 'Ce stationnement est introuvable.' },
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
          'Le code est saisi par la personne qui reçoit le vélo ; c’est vous qui le lui communiquez.',
      },
    };
  }

  const saisie = texte(donnees, 'code');
  if (!/^\d{4}$/.test(saisie)) {
    return {
      statut: 'erreur',
      erreurs: { code: 'Le code comporte quatre chiffres.' },
    };
  }

  const resultat = await saisirLeCodeDeRemise(identifiant, sens, saisie);

  if (resultat.accepte) {
    revalidatePath(`/stationnements/${identifiant}`);
    revalidatePath('/mes-stationnements');
    return {
      statut: 'valide',
      message:
        resultat.nouvelEtat === 'en_cours'
          ? 'Le dépôt est confirmé : le vélo est désormais gardé. Un nouveau code servira au moment de la reprise.'
          : 'Le vélo est repris, le stationnement est terminé. Merci à tous les deux.',
    };
  }

  revalidatePath(`/stationnements/${identifiant}`);

  if (resultat.motif === 'expire') {
    return {
      statut: 'erreur',
      erreurs: {
        code: 'Ce code n’est plus valable : il date de plus de six heures. Demandez-en un nouveau.',
      },
    };
  }

  if (resultat.motif === 'epuise') {
    return {
      statut: 'erreur',
      erreurs: {
        code: 'Les trois essais sont épuisés. Un nouveau code vient d’être envoyé à la personne qui remet le vélo.',
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

/**
 * Écrire à l'autre.
 *
 * Ce qui remplace le chat en temps réel : un message, un courriel, et rien
 * d'autre. Pas d'accusé de lecture — personne ne doit pouvoir reprocher à un
 * bénévole d'avoir répondu le lendemain.
 */
export async function ecrireAuSujetDuStationnement(
  stationnementId: string,
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();
  const corps = texte(donnees, 'corps');

  const resultat = await ecrireUnMessage(stationnementId, membre.id, corps);

  if (!resultat.ecrit) {
    const motifs: Record<string, string> = {
      vide: 'Votre message est vide.',
      trop_long: `Ce message dépasse ${LONGUEUR_MAXIMALE_DU_MESSAGE} caractères.`,
      etat_ferme:
        'Ce stationnement a été refusé ou annulé : les échanges sont clos.',
      pas_concerne: 'Ce stationnement ne vous concerne pas.',
    };
    return {
      statut: 'erreur',
      erreurs: { corps: motifs[resultat.motif] },
    };
  }

  revalidatePath(`/stationnements/${stationnementId}`);

  return {
    statut: 'valide',
    message:
      'Message envoyé. Il est transmis par e-mail, et la réponse arrivera dès que l’autre personne sera disponible.',
  };
}

/**
 * Écrire un avis, après la reprise du vélo.
 *
 * Du texte, jamais une note : « la note appartient à la personne », et un
 * emplacement noté deviendrait un emplacement classé (règle 3).
 */
export async function ecrireUnAvisSurLaGarde(
  stationnementId: string,
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();
  const corps = texte(donnees, 'avis');

  const resultat = await ecrireUnAvis(stationnementId, membre.id, corps);

  if (!resultat.ecrit) {
    const motifs: Record<string, string> = {
      vide: 'Votre avis est vide.',
      trop_long: `Cet avis dépasse ${LONGUEUR_MAXIMALE_DE_LAVIS} caractères.`,
      garde_non_terminee:
        'Vous pourrez écrire votre avis après la reprise du vélo.',
      pas_le_cycliste: 'L’avis est écrit par la personne qui a déposé le vélo.',
      deja_ecrit: 'Vous avez déjà écrit un avis pour cette garde.',
      introuvable: 'Ce stationnement n’existe plus.',
    };
    return { statut: 'erreur', erreurs: { avis: motifs[resultat.motif] } };
  }

  revalidatePath(`/stationnements/${stationnementId}`);

  return {
    statut: 'valide',
    message: 'Merci ! Votre avis est publié sur la fiche de l’emplacement.',
  };
}
