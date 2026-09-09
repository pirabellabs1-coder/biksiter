'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  modifierUnEmplacement,
  retirerUnEmplacement,
} from '@/lib/depot/emplacements';
import {
  ajouterUnePhoto,
  identifiantDeLEmplacement,
} from '@/lib/depot/photos';
import {
  PHOTOS_PAR_EMPLACEMENT,
  refusDeLaPhoto,
} from '@/lib/regles/photos';
import { lireLesChampsDEmplacement } from '@/lib/formulaires/emplacement';
import {
  ERREUR_GENERALE,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { HORS_ZONE, situerLEmplacement } from '@/lib/geocodage/situer';
import { RAYON_MINIMAL_DE_ZONE_METRES } from '@/lib/regles/adresse';
import { exigerUnMembre } from '@/lib/session';

/**
 * La référence est liée à l'action côté serveur plutôt que posée en champ
 * caché : ce qui ne traverse pas le navigateur ne peut pas être changé en
 * chemin. La propriété est de toute façon revérifiée par la requête.
 */
export async function modifierLEmplacement(
  reference: string,
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();

  const lecture = lireLesChampsDEmplacement(donnees, membre);
  if (!lecture.valide) {
    return { statut: 'erreur', erreurs: lecture.erreurs };
  }

  const champs = lecture.champs;
  const situation = await situerLEmplacement(champs.adresse, champs.quartier);

  if (!situation.situe) {
    return { statut: 'erreur', erreurs: { adresse: HORS_ZONE } };
  }

  const resultat = await modifierUnEmplacement(reference, membre.id, {
    type: champs.type,
    quartier: champs.quartier.nom,
    adresseExacte: champs.adresse,
    latitude: situation.point.latitude,
    longitude: situation.point.longitude,
    rayonDeLaZone: RAYON_MINIMAL_DE_ZONE_METRES + 150,
    capacite: champs.capacite,
    verrouillage: champs.verrouillage,
    intemperie: champs.intemperie,
    acces: champs.acces,
    ancrage: champs.ancrage,
    services: champs.services,
    velosAcceptes: champs.velosAcceptes,
    precisions: champs.precisions,
  });

  if (!resultat.modifie) {
    if (resultat.motif === 'capacite_trop_basse') {
      return {
        statut: 'erreur',
        erreurs: {
          capacite: `Vous avez déjà accepté jusqu’à ${resultat.dejaPromis} vélos en même temps. Vous pouvez réduire vos places pour l’avenir, mais pas en dessous de ce qui est déjà promis.`,
        },
      };
    }
    return {
      statut: 'erreur',
      erreurs: { [ERREUR_GENERALE]: 'Cet emplacement n’existe plus.' },
    };
  }

  revalidatePath('/emplacements');
  revalidatePath('/mes-emplacements');
  revalidatePath(`/emplacements/${reference}`);

  return {
    statut: 'valide',
    message: situation.precise
      ? 'Votre emplacement est à jour.'
      : 'Votre emplacement est à jour. L’adresse n’a pas pu être située précisément : la zone affichée est celle du quartier, donc un peu plus large.',
  };
}

export async function retirerLEmplacement(
  reference: string,
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();

  if (donnees.get('confirmation') !== 'oui') {
    return {
      statut: 'erreur',
      erreurs: {
        confirmation:
          'Cochez la case : retirer efface aussi les stationnements passés de cet emplacement.',
      },
    };
  }

  const resultat = await retirerUnEmplacement(reference, membre.id);

  if (!resultat.retire) {
    if (resultat.motif === 'stationnements_en_cours') {
      return {
        statut: 'erreur',
        erreurs: {
          [ERREUR_GENERALE]: `${resultat.combien} stationnement${resultat.combien > 1 ? 's' : ''} en cours ou en attente de réponse. Répondez-y ou attendez la reprise du vélo — quelqu’un compte sur cet emplacement. En attendant, vous pouvez le mettre en pause : il disparaît de la carte sans rien effacer.`,
        },
      };
    }
    return {
      statut: 'erreur',
      erreurs: { [ERREUR_GENERALE]: 'Cet emplacement n’existe plus.' },
    };
  }

  revalidatePath('/emplacements');
  revalidatePath('/mes-emplacements');

  redirect('/mes-emplacements');
}

const REFUS_DE_PHOTO: Record<string, string> = {
  vide: 'Ce fichier est vide.',
  type_refuse: 'Envoyez une photo (JPEG, PNG, WebP ou HEIC).',
  trop_lourde: 'Cette photo dépasse 8 Mo. Une photo de téléphone suffit.',
  rang_hors_limites: 'Cet emplacement de photo n’existe pas.',
};

/**
 * Les photos d'un emplacement.
 *
 * Le dépôt ré-encode chaque image, ce qui supprime les métadonnées EXIF — et
 * donc les coordonnées GPS du lieu. C'est la règle 4 : sans ce passage, publier
 * une photo reviendrait à publier l'adresse.
 */
export async function envoyerLesPhotos(
  reference: string,
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const membre = await exigerUnMembre();

  const emplacementId = await identifiantDeLEmplacement(reference, membre.id);
  if (!emplacementId) {
    return {
      statut: 'erreur',
      erreurs: { [ERREUR_GENERALE]: 'Cet emplacement n’est pas le vôtre.' },
    };
  }

  let envoyees = 0;

  for (let rang = 0; rang < PHOTOS_PAR_EMPLACEMENT; rang += 1) {
    const fichier = donnees.get(`photo-${rang}`);

    if (!(fichier instanceof File) || fichier.size === 0) {
      continue;
    }

    const refus = refusDeLaPhoto({
      type: fichier.type,
      taille: fichier.size,
      rang,
    });

    if (refus) {
      return { statut: 'erreur', erreurs: { photo: REFUS_DE_PHOTO[refus] } };
    }

    await ajouterUnePhoto(
      emplacementId,
      rang,
      Buffer.from(await fichier.arrayBuffer()),
    );
    envoyees += 1;
  }

  if (envoyees === 0) {
    return {
      statut: 'erreur',
      erreurs: { photo: 'Choisissez au moins une photo à envoyer.' },
    };
  }

  revalidatePath(`/emplacements/${reference}`);
  revalidatePath(`/mes-emplacements/${reference}/modifier`);

  return {
    statut: 'valide',
    message: `${envoyees} photo${envoyees > 1 ? 's' : ''} enregistrée${envoyees > 1 ? 's' : ''}. Les métadonnées, coordonnées GPS comprises, ont été retirées.`,
  };
}
