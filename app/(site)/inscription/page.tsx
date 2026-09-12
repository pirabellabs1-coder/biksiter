import type { Metadata } from 'next';
import Link from 'next/link';

import PageDeFormulaire from '@/components/page-de-formulaire';

import FormulaireDInscription from './formulaire';

export const metadata: Metadata = {
  title: 'Créer mon compte',
  description:
    'Créez votre compte Bike Sitters pour faire garder votre vélo près de chez vous, ou accueillir celui d’un voisin.',
};

export default async function Inscription({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <PageDeFormulaire
      surtitre="Créer mon compte"
      scene="confier"
      titre="Bienvenue dans le réseau."
      chapeau="Un seul compte vous permet de faire garder votre vélo et, si vous le souhaitez, d’accueillir celui d’un autre membre. Vous pourrez proposer un emplacement à tout moment depuis votre espace."
      propos={
        <div className="encart">
          <p>
            Après cette étape viennent{' '}
            <Link href="/inscription/verification" className="lien">
              trois vérifications
            </Link>{' '}
            : votre e-mail, votre téléphone et votre pièce d’identité. Elles
            protègent tous les membres du réseau et ne vous prendront que
            quelques minutes.
          </p>
        </div>
      }
      apres={
        <p className="discret">
          Pas encore d’invitation ?{' '}
          <Link href="/liste-attente" className="lien">
            Rejoignez la liste d’attente
          </Link>
          .
        </p>
      }
    >
      <FormulaireDInscription codeDInvitation={code?.trim() ?? ''} />
    </PageDeFormulaire>
  );
}
