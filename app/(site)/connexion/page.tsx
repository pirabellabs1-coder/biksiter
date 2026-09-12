import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import BaseNonBranchee from '@/components/base-non-branchee';
import PageDeFormulaire from '@/components/page-de-formulaire';
import { baseConfiguree } from '@/lib/bd/client';
import { membreConnecte } from '@/lib/session';

import FormulaireDeConnexion from './formulaire';

export const metadata: Metadata = {
  title: 'Me connecter',
  description: 'Retrouvez vos emplacements et vos stationnements.',
};

export const dynamic = 'force-dynamic';

export default async function Connexion() {
  if (await membreConnecte()) {
    redirect('/mon-compte');
  }

  return (
    <PageDeFormulaire
      surtitre="Connexion"
      scene="velo-a-labri"
      titre="Me connecter."
      chapeau="Heureux de vous revoir. Retrouvez vos stationnements et vos emplacements."
      apres={
        <p className="discret">
          Pas encore de compte ?{' '}
          <Link href="/invitation" className="lien">
            Utilisez votre invitation
          </Link>{' '}
          ou{' '}
          <Link href="/liste-attente" className="lien">
            rejoignez la liste d’attente
          </Link>
          .
        </p>
      }
    >
      {baseConfiguree() ? <FormulaireDeConnexion /> : <BaseNonBranchee />}
    </PageDeFormulaire>
  );
}
