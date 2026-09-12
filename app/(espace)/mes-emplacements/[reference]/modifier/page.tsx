import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import EnteteDePage from '@/components/entete-de-page';
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
    <div className="page-de-lespace">
      <EnteteDePage
        surtitre="Mes emplacements"
        titre="Modifier cet emplacement"
        chapeau={`${emplacement.type} · ${emplacement.quartier}${
          emplacement.publie ? '' : ' · en pause, masqué sur la carte'
        }`}
        actions={
          <Link href="/mes-emplacements" className="bouton bouton--discret">
            Retour à la liste
          </Link>
        }
      />

      <div className="encart">
        <p>
          Vos modifications s’appliquent aux prochaines demandes. Les
          stationnements déjà acceptés restent inchangés : les cyclistes
          concernés se sont organisés en conséquence.
        </p>
      </div>

      <FormulaireDEmplacement
        action={modifierLEmplacement.bind(null, reference)}
        membreDejaConnu
        libelleDuBouton="Enregistrer les modifications"
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
        Jusqu’à trois photos. Elles aident les cyclistes à reconnaître le lieu
        et à voir où leur vélo sera rangé.
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
        Si vous vous absentez quelque temps, vous pouvez plutôt le mettre en
        pause depuis la liste : rien n’est perdu, et vous le réactivez quand
        vous le souhaitez. Le retrait, lui, est définitif.
      </p>

      <Retrait
        action={retirerLEmplacement.bind(null, reference)}
        retenu={retenu}
      />
    </div>
  );
}
