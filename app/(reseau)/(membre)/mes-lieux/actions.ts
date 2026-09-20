'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { interroger } from '@/lib/bd/client';
import {
  creerUnEmplacement,
  modifierUnEmplacement,
  nombreDEmplacements,
  retirerUnEmplacement,
} from '@/lib/depot/emplacements';
import {
  enregistrerLaDescription,
  enregistrerLesDisponibilites,
  referenceDeLieu,
} from '@/lib/depot/lieux';
import {
  ajouterUnePhoto,
  identifiantDeLEmplacement,
  retirerUnePhoto,
} from '@/lib/depot/photos';
import { lireLesChampsDEmplacement } from '@/lib/formulaires/emplacement';
import { texte } from '@/lib/formulaires/etat';
import { HORS_ZONE, situerLEmplacement } from '@/lib/geocodage/situer';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { RAYON_MINIMAL_DE_ZONE_METRES } from '@/lib/regles/adresse';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { estUnRangValide, PHOTOS_PAR_EMPLACEMENT } from '@/lib/regles/photos';
import { TAILLE_MAXIMALE_OCTETS, typeReelDuFichier } from '@/lib/regles/pieces';
import { exigerUnMembre } from '@/lib/session';

export type EtatDuLieu = {
  erreurs: Readonly<Record<string, string>>;
};

const REFERENCE = /^[a-z0-9-]{3,60}$/;

async function traducteur() {
  return phraseur(await langueCourante());
}

/**
 * Décrire un lieu, à la création comme à la correction : les mêmes questions,
 * lues par la même fonction. Un nouveau lieu naît en brouillon ; il se publie
 * quand ses disponibilités sont posées.
 */
export async function enregistrerLeLieu(
  reference: string | null,
  _precedent: EtatDuLieu,
  donnees: FormData,
): Promise<EtatDuLieu> {
  const membre = await exigerUnMembre();
  const p = await traducteur();
  const lecture = lireLesChampsDEmplacement(donnees, membre);
  if (!lecture.valide) {
    return {
      erreurs: Object.fromEntries(
        Object.entries(lecture.erreurs).map(([cle, motif]) => [cle, p(motif)]),
      ),
    };
  }
  const champs = lecture.champs;
  const description = texte(donnees, 'description').slice(0, 1000) || null;

  const situation = await situerLEmplacement(champs.adresse, champs.quartier);
  if (!situation.situe) return { erreurs: { adresse: p(HORS_ZONE) } };

  const commun = {
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
  };

  if (reference === null) {
    if ((await nombreDEmplacements(membre.id)) >= EMPLACEMENTS_PAR_MEMBRE) {
      return {
        erreurs: {
          formulaire: p(
            'Vous proposez déjà {n} lieux, le maximum par membre. Pour en ajouter un, retirez d’abord l’un d’eux.',
            { n: EMPLACEMENTS_PAR_MEMBRE },
          ),
        },
      };
    }
    const creee = await creerUnEmplacement({
      ...commun,
      membreId: membre.id,
      reference: referenceDeLieu(champs.quartier.nom, membre.prenom),
      publie: false,
    });
    await enregistrerLaDescription(membre.id, creee, description);
    revalidatePath('/mes-lieux');
    redirect(`/mes-lieux/${creee}/photos?nouveau=1`);
  }

  if (!REFERENCE.test(reference)) return { erreurs: { formulaire: p('Ce lieu n’existe plus.') } };
  const resultat = await modifierUnEmplacement(reference, membre.id, commun);
  if (!resultat.modifie) {
    return {
      erreurs: {
        formulaire:
          resultat.motif === 'capacite_trop_basse'
            ? p(
                'Vous avez déjà promis {n} places sur un même créneau : la capacité ne peut pas descendre en dessous.',
                { n: resultat.dejaPromis },
              )
            : p('Ce lieu n’existe plus.'),
      },
    };
  }
  await enregistrerLaDescription(membre.id, reference, description);
  revalidatePath(`/mes-lieux/${reference}`);
  redirect(`/mes-lieux/${reference}?modifie=1`);
}

/**
 * Les photos d'un lieu. Chaque image est ré-encodée, ce qui retire les
 * métadonnées — coordonnées GPS comprises (règle 4).
 */
export async function envoyerLesPhotosDuLieu(
  reference: string,
  nouveau: boolean,
  _precedent: EtatDuLieu,
  donnees: FormData,
): Promise<EtatDuLieu> {
  const membre = await exigerUnMembre();
  const p = await traducteur();
  const emplacementId = REFERENCE.test(reference)
    ? await identifiantDeLEmplacement(reference, membre.id)
    : null;
  if (!emplacementId) return { erreurs: { photo: p('Ce lieu n’est pas associé à votre compte.') } };

  for (let rang = 0; rang < PHOTOS_PAR_EMPLACEMENT; rang += 1) {
    const fichier = donnees.get(`photo-${rang}`);
    if (!(fichier instanceof File) || fichier.size === 0 || !estUnRangValide(rang)) continue;
    if (fichier.size > TAILLE_MAXIMALE_OCTETS) {
      return { erreurs: { photo: p('Cette photo dépasse 8 Mo. Une photo prise au téléphone convient très bien.') } };
    }
    const contenu = Buffer.from(await fichier.arrayBuffer());
    const type = typeReelDuFichier(contenu);
    if (!type || type === 'application/pdf') {
      return { erreurs: { photo: p('Les photos peuvent être envoyées au format JPEG, PNG ou WebP.') } };
    }
    try {
      await ajouterUnePhoto(emplacementId, rang, contenu);
    } catch {
      return { erreurs: { photo: p('Une photo n’a pas pu être lue. Essayez d’en prendre une autre.') } };
    }
  }

  revalidatePath(`/mes-lieux/${reference}`);
  redirect(
    nouveau
      ? `/mes-lieux/${reference}/disponibilites?nouveau=1`
      : `/mes-lieux/${reference}?photos=1`,
  );
}

export async function retirerUnePhotoDuLieu(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const reference = String(donnees.get('reference') ?? '');
  const rang = Number(donnees.get('rang'));
  if (!REFERENCE.test(reference) || !estUnRangValide(rang)) redirect('/mes-lieux');
  const emplacementId = await identifiantDeLEmplacement(reference, membre.id);
  if (emplacementId) await retirerUnePhoto(emplacementId, rang);
  revalidatePath(`/mes-lieux/${reference}/photos`);
  redirect(`/mes-lieux/${reference}/photos`);
}

export async function enregistrerLesDisponibilitesDuLieu(
  reference: string,
  nouveau: boolean,
  _precedent: EtatDuLieu,
  donnees: FormData,
): Promise<EtatDuLieu> {
  const membre = await exigerUnMembre();
  const p = await traducteur();
  if (!REFERENCE.test(reference)) return { erreurs: { formulaire: p('Ce lieu n’existe plus.') } };

  const fermetures = texte(donnees, 'fermetures')
    .split(/[\s,;]+/)
    .filter(Boolean);
  const resultat = await enregistrerLesDisponibilites(membre.id, reference, {
    jours: donnees
      .getAll('jours')
      .map((jour) => Number(jour))
      .filter((jour) => Number.isInteger(jour)),
    ouverture: texte(donnees, 'ouverture'),
    fermeture: texte(donnees, 'fermeture'),
    dureeMaxHeures: Number(texte(donnees, 'duree')),
    delaiDeReponse: texte(donnees, 'delai'),
    fermetures,
  });
  if (!resultat.ok) {
    return { erreurs: { formulaire: resultat.motifs.map((motif) => p(motif)).join(' ') } };
  }

  revalidatePath(`/mes-lieux/${reference}`);
  revalidatePath('/mes-lieux');
  redirect(nouveau ? `/mes-lieux/${reference}/envoye` : `/mes-lieux/${reference}?disponibilites=1`);
}

/** En pause, le lieu disparaît des recherches ; il revient d'un geste. */
export async function basculerLaPauseDuLieu(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const reference = String(donnees.get('reference') ?? '');
  if (!REFERENCE.test(reference)) redirect('/mes-lieux');
  const pause = donnees.get('pause') === 'oui';
  let ok = true;
  try {
    await interroger(
      pause
        ? 'update emplacement set en_pause = true where reference = $1 and membre_id = $2'
        : `update emplacement set en_pause = false,
                  publie = cardinality(jours_d_accueil) > 0
            where reference = $1 and membre_id = $2`,
      [reference, membre.id],
    );
  } catch {
    // La base refuse de publier sans identité vérifiée (règle 2).
    ok = false;
    await interroger(
      'update emplacement set en_pause = false where reference = $1 and membre_id = $2',
      [reference, membre.id],
    );
  }
  revalidatePath(`/mes-lieux/${reference}`);
  redirect(`/mes-lieux/${reference}${ok ? '' : '?publication=identite'}`);
}

export async function retirerLeLieu(
  reference: string,
  _precedent: EtatDuLieu,
  donnees: FormData,
): Promise<EtatDuLieu> {
  const membre = await exigerUnMembre();
  const p = await traducteur();
  if (donnees.get('confirmation') !== 'oui') {
    return { erreurs: { formulaire: p('Cochez la case pour confirmer le retrait.') } };
  }
  if (!REFERENCE.test(reference)) return { erreurs: { formulaire: p('Ce lieu n’existe plus.') } };
  const resultat = await retirerUnEmplacement(reference, membre.id);
  if (!resultat.retire) {
    return {
      erreurs: {
        formulaire:
          resultat.motif === 'stationnements_en_cours'
            ? p(
                'Une demande ou une garde est encore en cours sur ce lieu. Vous pourrez le retirer une fois terminée ; en attendant, vous pouvez le mettre en pause.',
              )
            : p('Ce lieu n’existe plus.'),
      },
    };
  }
  revalidatePath('/mes-lieux');
  redirect('/mes-lieux?retire=1');
}
