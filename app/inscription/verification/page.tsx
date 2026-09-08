import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vérifier mon identité',
  description:
    'Trois vérifications, une seule fois : e-mail, téléphone et pièce d’identité. Le document est supprimé après contrôle.',
};

export default function Verification() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Vérification</p>
      <h1 className="titre-page">Confirmer qui vous êtes</h1>
      <p className="chapeau">
        Trois vérifications, une seule fois. Elles valent autant pour vous que
        pour la personne qui vous ouvrira sa porte : vous saurez, vous aussi, à
        qui vous confiez votre vélo.
      </p>

      <ul className="etapes-verification">
        <li className="carte">
          <div>
            <h2>E-mail</h2>
            <p className="discret">
              Un message vous est envoyé, vous cliquez sur le lien.
            </p>
          </div>
          <span className="pastille pastille--neutre">À faire</span>
        </li>

        <li className="carte">
          <div>
            <h2>Téléphone</h2>
            <p className="discret">
              Un code arrive par SMS. C’est le seul usage que nous faisons des
              SMS : ils coûtent trop cher pour servir aux rappels.
            </p>
          </div>
          <span className="pastille pastille--neutre">À faire</span>
        </li>

        <li className="carte">
          <div>
            <h2>Pièce d’identité</h2>
            <p className="discret">
              Une personne la regarde, sous 24 heures. C’est la vérification qui
              rend acceptable d’ouvrir sa porte à un inconnu.
            </p>
          </div>
          <span className="pastille pastille--neutre">À faire</span>
        </li>
      </ul>

      <div className="encart">
        <p>
          <strong>Votre document n’est pas conservé.</strong> Il est supprimé dès
          la vérification, et au plus tard après sept jours. Ni l’image ni le
          numéro ne sont gardés — seul le résultat l’est.
        </p>
      </div>

      <div className="encart">
        <p>
          <strong>L’envoi n’est pas encore ouvert.</strong> Le dépôt de la pièce
          d’identité demande un stockage chiffré et une file de vérification
          humaine, qui n’existent pas encore. Nous préférons afficher cette page
          telle qu’elle sera plutôt qu’un formulaire qui perdrait votre
          document.
        </p>
      </div>

      <div className="boutons">
        <Link
          href="/inscription/validation"
          className="bouton bouton--principal"
        >
          Suivre l’état de ma vérification
        </Link>
        <Link href="/emplacements" className="bouton bouton--discret">
          Voir les emplacements en attendant
        </Link>
        <Link href="/fonctionnement" className="bouton bouton--discret">
          Comment ça marche
        </Link>
      </div>
    </div>
  );
}
