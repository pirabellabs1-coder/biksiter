import Link from 'next/link';

import Logo from '@/components/logo';
import { COLONNES_DU_PIED } from '@/lib/contenu/navigation';

export default function PiedDePage() {
  return (
    <footer className="pied">
      <div className="pied__interieur">
        <div>
          <p className="marque pied__marque">
            <Logo taille={20} />
            Bike Sitters
          </p>
          <p className="discret pied__phrase">
            Des bike sitters accueillent votre vélo chez eux, gratuitement, le
            temps qu’il faut. Association sans but lucratif, à Bruxelles.
          </p>
        </div>

        {COLONNES_DU_PIED.map((colonne) => (
          <nav key={colonne.titre} aria-labelledby={identifiant(colonne.titre)}>
            <h2 id={identifiant(colonne.titre)}>{colonne.titre}</h2>
            <ul>
              {colonne.liens.map((lien) => (
                <li key={lien.chemin}>
                  <Link href={lien.chemin}>{lien.libelle}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}

function identifiant(titre: string): string {
  return `pied-${titre.toLowerCase().replace(/[^a-z]+/g, '-')}`;
}
