import Link from 'next/link';

export default function PageIntrouvable() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Erreur 404</p>
      <h1 className="titre-page">Cette page n’existe pas</h1>
      <p className="chapeau">
        Le lien est peut-être ancien, ou l’emplacement que vous cherchiez n’est
        plus proposé. Les bike sitters retirent leur emplacement quand ils
        veulent, sans avoir à se justifier.
      </p>

      <div className="boutons">
        <Link href="/" className="bouton bouton--principal">
          Retour à l’accueil
        </Link>
        <Link href="/emplacements" className="bouton bouton--discret">
          Voir les emplacements
        </Link>
        <Link href="/questions-frequentes" className="bouton bouton--discret">
          Questions fréquentes
        </Link>
      </div>
    </div>
  );
}
