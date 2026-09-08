'use server';

import { revalidatePath } from 'next/cache';

import {
  PlaceIndisponible,
  demanderUnStationnement as ecrireLaDemande,
} from '@/lib/depot/stationnements';
import {
  ERREUR_GENERALE,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { peutDemanderUnStationnement } from '@/lib/regles/publication';
import { estUnTypeVelo } from '@/lib/regles/velos';
import { membreConnecte, membrePourLesRegles } from '@/lib/session';
import { instantABruxelles } from '@/lib/temps';

export async function demanderUnStationnement(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await membreConnecte();

  // La règle est vérifiée ici aussi, et pas seulement à l'affichage : un
  // formulaire caché n'est pas un formulaire fermé.
  if (!membre || !peutDemanderUnStationnement(await membrePourLesRegles())) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'Votre identité doit être vérifiée avant de demander un stationnement.',
      },
    };
  }

  const reference = texte(donnees, 'reference');
  const erreurs: Record<string, string> = {};

  const jour = texte(donnees, 'jour');
  const arrivee = texte(donnees, 'arrivee');
  const retour = texte(donnees, 'retour');

  const debut = instantABruxelles(jour, arrivee);
  const fin = instantABruxelles(jour, retour);

  if (jour === '') {
    erreurs.jour = 'Indiquez le jour du dépôt.';
  } else if (!debut) {
    erreurs.jour = 'Cette date n’est pas valide.';
  }

  if (arrivee === '' || !debut) {
    erreurs.arrivee = 'Indiquez l’heure à laquelle vous déposez le vélo.';
  }
  if (retour === '' || !fin) {
    erreurs.retour = 'Indiquez l’heure à laquelle vous le reprenez.';
  }
  if (debut && fin && fin <= debut) {
    erreurs.retour = 'La reprise doit venir après le dépôt.';
  }
  if (debut && debut.getTime() < Date.now()) {
    erreurs.jour = 'Ce créneau est déjà passé.';
  }

  const velo = texte(donnees, 'velo');
  if (!estUnTypeVelo(velo)) {
    erreurs.velo = 'Choisissez un type de vélo dans la liste.';
  }

  if (Object.keys(erreurs).length > 0 || !debut || !fin || !estUnTypeVelo(velo)) {
    return { statut: 'erreur', erreurs };
  }

  const message = texte(donnees, 'message');

  try {
    await ecrireLaDemande({
      reference,
      cyclisteId: membre.id,
      debut,
      fin,
      typeVelo: velo,
      message: message === '' ? null : message,
    });
  } catch (erreur) {
    if (erreur instanceof PlaceIndisponible) {
      return {
        statut: 'erreur',
        erreurs: {
          jour:
            'Cet emplacement est déjà pris sur ce créneau, ou trop près d’un autre stationnement. Essayez un autre horaire.',
        },
      };
    }
    throw erreur;
  }

  revalidatePath('/mes-stationnements');

  return {
    statut: 'valide',
    message:
      'Votre demande est enregistrée. Le bike sitter décide s’il l’accepte, et n’a pas à se justifier s’il refuse. Vous la retrouvez dans « Mes stationnements ».',
  };
}
