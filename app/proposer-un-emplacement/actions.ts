'use server';

import { revalidatePath } from 'next/cache';

import { baseConfiguree } from '@/lib/bd/client';
import { deposerUneCandidature } from '@/lib/depot/candidatures';
import { creerUnEmplacement } from '@/lib/depot/emplacements';
import { HORS_ZONE, situerLEmplacement } from '@/lib/geocodage/situer';
import { lireLesChampsDEmplacement } from '@/lib/formulaires/emplacement';
import {
  ERREUR_GENERALE,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { RAYON_MINIMAL_DE_ZONE_METRES } from '@/lib/regles/adresse';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { decisionDePublication } from '@/lib/regles/publication';
import { membreConnecte, membrePourLesRegles } from '@/lib/session';

/**
 * Un seul formulaire pour deux situations, parce que c'est une seule action :
 * proposer un emplacement n'est pas un statut qu'on demande.
 *
 * - Un membre vérifié crée directement son emplacement, qui est publié.
 * - Tout le monde d'autre dépose une candidature, qui attend qu'une personne
 *   vérifie son identité (règle 2). Rien n'est publié dans ce cas.
 */
export async function proposerUnEmplacement(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'La base de données n’est pas branchée : rien ne peut être enregistré.',
      },
    };
  }

  const membre = await membreConnecte();
  const lecture = lireLesChampsDEmplacement(donnees, membre);

  if (!lecture.valide) {
    return { statut: 'erreur', erreurs: lecture.erreurs };
  }

  const champs = lecture.champs;
  const situation = await situerLEmplacement(champs.adresse, champs.quartier);

  if (!situation.situe) {
    return { statut: 'erreur', erreurs: { adresse: HORS_ZONE } };
  }

  // Un membre connecté et vérifié publie directement ; tout autre cas dépose
  // une candidature, qui attend le passage d'une personne (règle 2).
  if (membre) {
    const decision = decisionDePublication(await membrePourLesRegles());

    if (!decision.autorise && decision.motif === 'quota_atteint') {
      return {
        statut: 'erreur',
        erreurs: {
          [ERREUR_GENERALE]: `Vous proposez déjà ${EMPLACEMENTS_PAR_MEMBRE} emplacements, c’est le maximum. Retirez-en un pour en ajouter un autre.`,
        },
      };
    }

    if (decision.autorise) {
      await creerUnEmplacement({
        membreId: membre.id,
        reference: referenceLisible(champs.quartier.nom, membre.prenom),
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
        publie: true,
      });

      revalidatePath('/emplacements');
      revalidatePath('/mes-emplacements');

      return {
        statut: 'valide',
        message:
          'Votre emplacement est publié. Il apparaît en zone approximative : votre adresse reste chez vous jusqu’à ce que vous acceptiez une demande.',
      };
    }
  }

  await deposerUneCandidature({
    prenom: champs.prenom,
    email: champs.email,
    adresseExacte: champs.adresse,
    type: champs.type,
    quartier: champs.quartier.nom,
    capacite: champs.capacite,
    verrouillage: champs.verrouillage,
    intemperie: champs.intemperie,
    acces: champs.acces,
    ancrage: champs.ancrage,
    services: champs.services,
    velosAcceptes: champs.velosAcceptes,
    precisions: champs.precisions,
  });

  return {
    statut: 'valide',
    message:
      'Votre candidature est enregistrée. Une personne la relit et vérifie votre identité avant toute publication : personne n’apparaît sur la carte sans être passé par là.',
  };
}

/**
 * Une référence lisible plutôt qu'un identifiant : elle se retrouve dans une
 * URL, dans un message de support, dans un e-mail. Elle ne change plus ensuite,
 * même si le quartier change.
 */
function referenceLisible(quartier: string, prenom: string): string {
  const sansAccent = (valeur: string) =>
    valeur
      .normalize('NFD')
      // Les signes diacritiques combinants, retirés après décomposition.
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const suffixe = Math.random().toString(36).slice(2, 6);
  return `${sansAccent(quartier)}-${sansAccent(prenom)}-${suffixe}`;
}
