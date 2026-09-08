'use server';

import {
  ERREUR_GENERALE,
  RIEN_N_EST_ENCORE_ENVOYE,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { peutDemanderUnStationnement } from '@/lib/regles/publication';
import { estUnTypeVelo } from '@/lib/regles/velos';
import { membreCourant } from '@/lib/session';

/**
 * La règle est vérifiée ici aussi, et pas seulement à l’affichage : un
 * formulaire caché n’est pas un formulaire fermé.
 */
export async function demanderUnStationnement(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  if (!peutDemanderUnStationnement(membreCourant())) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'Votre identité doit être vérifiée avant de demander un stationnement.',
      },
    };
  }

  const erreurs: Record<string, string> = {};

  const jour = texte(donnees, 'jour');
  if (jour === '') {
    erreurs.jour = 'Indiquez le jour du dépôt.';
  }

  const arrivee = texte(donnees, 'arrivee');
  const retour = texte(donnees, 'retour');
  if (arrivee === '') {
    erreurs.arrivee = 'Indiquez l’heure à laquelle vous déposez le vélo.';
  }
  if (retour === '') {
    erreurs.retour = 'Indiquez l’heure à laquelle vous le reprenez.';
  }
  if (arrivee !== '' && retour !== '' && retour <= arrivee) {
    erreurs.retour = 'La reprise doit venir après le dépôt.';
  }

  const velo = texte(donnees, 'velo');
  if (!estUnTypeVelo(velo)) {
    erreurs.velo = 'Choisissez un type de vélo dans la liste.';
  }

  if (Object.keys(erreurs).length > 0) {
    return { statut: 'erreur', erreurs };
  }

  // TODO(persistance) : écrire le stationnement à l'état « demande », puis
  // prévenir le bike sitter par e-mail. Dépend du schéma PostgreSQL.
  return { statut: 'valide', message: RIEN_N_EST_ENCORE_ENVOYE };
}
