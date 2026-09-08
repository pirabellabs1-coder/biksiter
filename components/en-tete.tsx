import Link from 'next/link';

import Logo from '@/components/logo';
import Navigation from '@/components/navigation';

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

        <Link href="/inscription" className="bouton bouton--principal">
          S’inscrire
        </Link>
      </div>
    </header>
  );
}
