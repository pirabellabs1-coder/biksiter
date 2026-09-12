import type { Metadata } from 'next';
import Link from 'next/link';

import PageDeFormulaire from '@/components/page-de-formulaire';

export const metadata: Metadata = {
  title: 'J’ai une invitation',
  description:
    'Pendant son lancement, le réseau s’ouvre sur invitation d’un membre. Saisissez votre code pour créer votre compte.',
};

export default function Invitation() {
  return (
    <PageDeFormulaire
      surtitre="Invitation"
      scene="ensemble"
      titre="Vous avez reçu une invitation."
      chapeau="Pendant son lancement, Bike Sitters s’ouvre sur invitation d’un membre. Saisissez le code reçu pour créer votre compte."
      propos={
        <div className="encart">
          <p>
            Chaque membre dispose de quelques invitations et en reçoit une
            nouvelle après chaque stationnement réussi. C’est ainsi que le
            réseau s’étend, quartier par quartier.
          </p>
        </div>
      }
      apres={
        <p className="discret">
          Pas d’invitation ?{' '}
          <Link href="/liste-attente" className="lien">
            Rejoignez la liste d’attente
          </Link>
          , elle est ouverte à tout le monde.
        </p>
      }
    >
      <form action="/inscription" method="get">
        <div className="champ">
          <label htmlFor="code">Code d’invitation</label>
          <span id="code-aide" className="champ__aide">
            Il vous a été transmis par la personne qui vous invite, sous la
            forme MANO-4K29.
          </span>
          <input
            id="code"
            name="code"
            aria-describedby="code-aide"
            autoComplete="off"
            spellCheck={false}
            placeholder="MANO-4K29"
          />
        </div>

        <button
          type="submit"
          className="bouton bouton--principal bouton--large"
        >
          Continuer
        </button>
      </form>
    </PageDeFormulaire>
  );
}
