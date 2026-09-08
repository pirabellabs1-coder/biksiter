import Link from 'next/link';

import Logo from '@/components/logo';
import Navigation from '@/components/navigation';

/**
 * L'en-tête ne lit pas la session, volontairement.
 *
 * Lire le cookie ici rendrait dynamique chaque page du site, y compris la FAQ
 * et les conditions générales, qui n'ont aucune raison d'être recalculées à
 * chaque visite. Les deux liens couvrent les deux cas : un membre déjà
 * connecté qui clique « Me connecter » est envoyé sur son compte.
 */
export default function EnTete() {
  return (
    <header className="entete">
      <div className="entete__interieur">
        <Link href="/" className="marque">
          <Logo />
          Bike Sitters
        </Link>

        <nav aria-label="Navigation principale" className="entete__navigation">
          <Navigation />
        </nav>

        <Link href="/connexion" className="entete__connexion">
          Me connecter
        </Link>

        <Link href="/inscription" className="bouton bouton--principal">
          S’inscrire
        </Link>
      </div>
    </header>
  );
}
