import type { Metadata } from 'next';
import Link from 'next/link';

import FormulaireDInscription from './formulaire';

export const metadata: Metadata = {
  title: 'Créer mon compte',
  description:
    'Un compte unique et vérifié. Vous êtes cycliste quand vous cherchez une place, bike sitter quand vous en proposez une.',
};

export default async function Inscription({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="page page--lecture">
      <p className="surtitre">Créer mon compte</p>
      <h1 className="titre-page">Un seul compte, pour les deux rôles</h1>
      <p className="chapeau">
        Vous serez cycliste quand vous cherchez une place, bike sitter si vous
        décidez d’en proposer une. C’est la même personne et le même compte :
        proposer un emplacement est une action, pas un statut à demander.
      </p>

      <FormulaireDInscription codeDInvitation={code?.trim() ?? ''} />

      <div className="encart">
        <p>
          Après cette étape viennent{' '}
          <Link href="/inscription/verification" className="lien">
            trois vérifications
          </Link>{' '}
          : votre e-mail, votre téléphone et votre pièce d’identité. Elles
          valent autant pour vous que pour la personne qui vous ouvrira sa
          porte.
        </p>
      </div>

      <p className="discret centre">
        Pas encore d’invitation ?{' '}
        <Link href="/liste-attente" className="lien">
          Rejoignez la liste d’attente
        </Link>
        .
      </p>
    </div>
  );
}
