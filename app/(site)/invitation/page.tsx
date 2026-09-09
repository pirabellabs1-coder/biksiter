import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'J’ai une invitation',
  description:
    'On entre dans le réseau sur recommandation d’un membre. C’est ainsi qu’il grandit pendant ses premiers mois : quelqu’un répond de vous.',
};

export default function Invitation() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Invitation</p>
      <h1 className="titre-page">Entrer par recommandation</h1>
      <p className="chapeau">
        On entre dans le réseau sur invitation d’un membre. C’est la façon dont
        il s’agrandit pendant ses premiers mois : quelqu’un répond de vous, et
        vous répondrez de quelqu’un à votre tour.
      </p>

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

        <button type="submit" className="bouton bouton--principal bouton--large">
          Continuer
        </button>
      </form>

      <div className="encart">
        <p>
          Chaque membre dispose d’un nombre limité d’invitations, et en gagne
          une après chaque stationnement mené à bien. Une invitation a le plus
          de valeur quand elle est utilisée dans le quartier de la personne qui
          l’a donnée : c’est ce qui fait ouvrir les quartiers un par un.
        </p>
      </div>

      <p className="discret centre">
        Pas d’invitation ?{' '}
        <Link href="/liste-attente" className="lien">
          Rejoignez la liste d’attente
        </Link>
        , elle est ouverte à tout le monde.
      </p>
    </div>
  );
}
