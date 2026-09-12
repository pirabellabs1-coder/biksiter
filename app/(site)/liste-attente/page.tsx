import type { Metadata } from 'next';
import Link from 'next/link';

import PageDeFormulaire from '@/components/page-de-formulaire';

import FormulaireDeListeDAttente from './formulaire';

export const metadata: Metadata = {
  title: 'Liste d’attente',
  description:
    'Le réseau ouvre quartier par quartier. Inscrivez-vous pour être prévenu dès que le vôtre ouvre.',
};

export default function ListeDAttente() {
  return (
    <PageDeFormulaire
      surtitre="Liste d’attente"
      scene="la-rue"
      titre="Dites-nous où vous habitez."
      chapeau="Bike Sitters ouvre quartier par quartier, dès qu’il y a assez de bike sitters pour accueillir les cyclistes dans de bonnes conditions. Votre inscription nous aide à choisir les prochains quartiers, et nous vous prévenons dès que le vôtre ouvre."
      propos={
        <div className="encart">
          <p>
            <strong>Vous avez de la place pour un vélo ?</strong> Indiquez-le
            dans le formulaire : chaque bike sitter rapproche l’ouverture de son
            quartier.
          </p>
        </div>
      }
      apres={
        <p className="discret">
          Vous connaissez un membre ?{' '}
          <Link href="/invitation" className="lien">
            Utilisez son invitation
          </Link>{' '}
          pour rejoindre le réseau dès aujourd’hui.
        </p>
      }
    >
      <FormulaireDeListeDAttente />
    </PageDeFormulaire>
  );
}
