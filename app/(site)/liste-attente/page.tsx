import type { Metadata } from 'next';
import Link from 'next/link';

import FormulaireDeListeDAttente from './formulaire';

export const metadata: Metadata = {
  title: 'Liste d’attente',
  description:
    'Le réseau ouvre quartier par quartier. Dites-nous où vous êtes : votre inscription nous dit où ouvrir ensuite.',
};

export default function ListeDAttente() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Liste d’attente</p>
      <h1 className="titre-page">Dites-nous où vous êtes</h1>
      <p className="chapeau">
        Nous ouvrons un quartier quand il compte assez de bike sitters pour
        qu’un cycliste y trouve une place à chaque fois. Ouvrir trop tôt, c’est
        promettre une place qui n’existe pas. Votre inscription nous dit où
        ouvrir ensuite.
      </p>

      <FormulaireDeListeDAttente />

      <div className="encart encart--verifie">
        <p>
          <strong>Si vous pouvez accueillir un vélo, dites-le.</strong> Ce sont
          les bike sitters qui déclenchent l’ouverture d’un quartier, pas les
          cyclistes. Un quartier avec cent cyclistes et aucun emplacement reste
          fermé.
        </p>
      </div>

      <p className="discret centre">
        Vous connaissez un membre ?{' '}
        <Link href="/invitation" className="lien">
          Utilisez son invitation
        </Link>{' '}
        — l’attente est alors inutile.
      </p>
    </div>
  );
}
