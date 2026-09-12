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
          'Une vérification d’identité est nécessaire pour demander un stationnement.',
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

  if (
    Object.keys(erreurs).length > 0 ||
    !debut ||
    !fin ||
    !estUnTypeVelo(velo)
  ) {
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
          jour: 'Cet emplacement est déjà occupé sur ce créneau. Essayez un autre horaire, en prévoyant une demi-heure entre deux vélos.',
        },
      };
    }
    throw erreur;
  }

  revalidatePath('/mes-stationnements');

  return {
    statut: 'valide',
    message:
      'Votre demande a bien été envoyée. Vous retrouverez la réponse du bike sitter dans « Mes stationnements ».',
  };
}
