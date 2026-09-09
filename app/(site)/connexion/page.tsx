import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import BaseNonBranchee from '@/components/base-non-branchee';
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
    <div className="page page--lecture">
      <p className="surtitre">Connexion</p>
      <h1 className="titre-page">Me connecter</h1>
      <p className="chapeau">
        Un seul compte pour les deux rôles : vous êtes cycliste quand vous
        cherchez une place, bike sitter quand vous en proposez une.
      </p>

      {baseConfiguree() ? <FormulaireDeConnexion /> : <BaseNonBranchee />}

      <p className="discret centre">
        Pas encore de compte ?{' '}
        <Link href="/invitation" className="lien">
          Entrez avec une invitation
        </Link>{' '}
        ou{' '}
        <Link href="/liste-attente" className="lien">
          rejoignez la liste d’attente
        </Link>
        .
      </p>
    </div>
  );
}
