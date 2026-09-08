import Link from 'next/link';

import Logo from '@/components/logo';
import Navigation from '@/components/navigation';
import { membreConnecte } from '@/lib/session';

/**
 * L'en-tête lit la session pour savoir quoi proposer à droite.
 *
 * Il ne le faisait pas tant que les pages éditoriales étaient prérendues —
 * lire un cookie les aurait rendues dynamiques. Elles le sont désormais toutes,
 * pour la Content-Security-Policy (voir app/layout.tsx), donc l'objection est
 * tombée et un membre déjà connecté n'a plus à lire « Me connecter ».
 */
export default async function EnTete() {
  const membre = await membreConnecte();

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

        {membre ? (
          <>
            <span className="entete__connexion">Bonjour {membre.prenom}</span>
            <Link href="/mon-compte" className="bouton bouton--principal">
              Mon compte
            </Link>
          </>
        ) : (
          <>
            <Link href="/connexion" className="entete__connexion">
              Me connecter
            </Link>
            <Link href="/inscription" className="bouton bouton--principal">
              S’inscrire
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
