import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BarreDuMembre from '@/components/barre-du-membre';
import FormulaireDEmplacement from '@/components/formulaire-d-emplacement';
import {
  emplacementAModifier,
  emplacementsDuMembre,
} from '@/lib/depot/emplacements';
import { exigerUnMembre } from '@/lib/session';

import { photosDeLEmplacement } from '@/lib/depot/photos';

import {
  envoyerLesPhotos,
  modifierLEmplacement,
  retirerLEmplacement,
} from './actions';
import Photos from './photos';
import Retrait from './retrait';

export const metadata: Metadata = { title: 'Modifier un emplacement' };

export default async function ModifierUnEmplacement({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const membre = await exigerUnMembre();
  const { reference } = await params;

  const emplacement = await emplacementAModifier(reference, membre.id);
  if (!emplacement) {
    notFound();
  }

  // Le compte des stationnements qui retiennent vient de la même liste que la
  // page précédente : une seule requête sait le calculer, et elle est déjà là.
  const [miens, photos] = await Promise.all([
    emplacementsDuMembre(membre.id),
    photosDeLEmplacement(reference),
  ]);
  const retenu =
    miens.find((autre) => autre.reference === reference)
      ?.stationnementsQuiRetiennent ?? 0;

  return (
    <div className="page page--lecture">
      <BarreDuMembre membre={membre} page="emplacements" />

      <p className="surtitre">
        <Link href="/mes-emplacements" className="lien">
          Mes emplacements
        </Link>
      </p>
      <h1 className="titre-page">Corriger cet emplacement</h1>
      <p className="chapeau">
        {emplacement.type} · {emplacement.quartier}
        {emplacement.publie ? '' : ' · en pause, invisible sur la carte'}
      </p>

      <div className="encart">
        <p>
          Ce que vous changez ici vaut pour les demandes à venir. Les
          stationnements déjà acceptés tiennent : vous vous êtes engagé, et le
          cycliste s’est organisé.
        </p>
      </div>

      <FormulaireDEmplacement
        action={modifierLEmplacement.bind(null, reference)}
        membreDejaConnu
        libelleDuBouton="Enregistrer les corrections"
        valeurs={{
          adresseExacte: emplacement.adresseExacte,
          quartier: emplacement.quartier,
          type: emplacement.type,
          capacite: emplacement.capacite,
          verrouillage: emplacement.verrouillage,
          intemperie: emplacement.intemperie,
          acces: emplacement.acces,
          ancrage: emplacement.ancrage,
          services: emplacement.services,
          velosAcceptes: emplacement.velosAcceptes,
          precisions: emplacement.precisions,
        }}
      />

      <h2 className="titre-section titre-section--aere">Les photos</h2>
      <p className="discret">
        Trois photos au plus. Elles aident un cycliste à reconnaître le lieu et
        à savoir où son vélo va dormir.
      </p>
      <Photos
        action={envoyerLesPhotos.bind(null, reference)}
        reference={reference}
        presentes={photos.map((photo) => photo.rang)}
      />

      <h2 className="titre-section titre-section--aere">
        Retirer cet emplacement
      </h2>
      <p className="discret">
        Si vous partez pour un temps, mettez-le plutôt en pause depuis la liste :
        c’est réversible et rien n’est perdu. Le retrait, lui, est définitif.
      </p>

      <Retrait
        action={retirerLEmplacement.bind(null, reference)}
        retenu={retenu}
      />
    </div>
  );
}
