import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Votre inscription',
  description:
    'Où en est la vérification de votre compte, et ce que vous pouvez faire en attendant.',
};

export default function Validation() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Votre inscription</p>
      <h1 className="titre-page">Nous vérifions votre pièce</h1>
      <p className="chapeau">
        Une personne regarde votre document, pas un algorithme. Comptez
        24 heures. La personne qui vous a invité sera prévenue quand votre
        compte sera actif.
      </p>

      <ul className="etapes-verification">
        <li className="carte">
          <div>
            <h2>E-mail et téléphone</h2>
            <p className="discret">Confirmés.</p>
          </div>
          <span className="pastille pastille--verifie">Vérifiés</span>
        </li>

        <li className="carte">
          <div>
            <h2>Pièce d’identité</h2>
            <p className="discret">Transmise, en attente de relecture.</p>
          </div>
          <span className="pastille pastille--neutre">En cours</span>
        </li>
      </ul>

      <div className="encart">
        <p>
          Si votre pièce est illisible, nous vous le dirons et vous pourrez en
          renvoyer une. Un refus définitif est toujours motivé — vous saurez
          pourquoi.
        </p>
      </div>

      <h2 className="titre-section titre-section--aere">
        En attendant, vous pouvez déjà
      </h2>
      <div className="grille grille--deux">
        <article className="carte">
          <h3>Voir la carte</h3>
          <p className="discret">
            Repérez les emplacements autour de vos destinations habituelles.
          </p>
          <Link
            href="/emplacements"
            className="bouton bouton--discret bouton--large"
          >
            Ouvrir la carte
          </Link>
        </article>

        <article className="carte">
          <h3>Comprendre le service</h3>
          <p className="discret">
            Comment se passe un stationnement, des deux côtés.
          </p>
          <Link
            href="/fonctionnement"
            className="bouton bouton--discret bouton--large"
          >
            Comment ça marche
          </Link>
        </article>
      </div>
    </div>
  );
}
