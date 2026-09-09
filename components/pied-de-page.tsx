import Link from 'next/link';

import Logo from '@/components/logo';
import { ASSOCIATION } from '@/lib/contenu/association';
import { COLONNES_DU_PIED } from '@/lib/contenu/navigation';
import { NOMS_DE_QUARTIER } from '@/lib/contenu/quartiers';

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

      {/* Ces liens mènent à la recherche filtrée, pas à une page par quartier :
          il n'y a rien à dire sur un quartier qu'on ne dise mieux en montrant
          ce qui y est ouvert — et une page vide par quartier serait quatorze
          impasses. */}
      <nav className="pied__quartiers" aria-labelledby="pied-quartiers">
        <h2 id="pied-quartiers">Chercher par quartier</h2>
        <ul>
          {NOMS_DE_QUARTIER.map((quartier) => (
            <li key={quartier}>
              <Link
                href={`/emplacements?quartier=${encodeURIComponent(quartier)}`}
              >
                {quartier}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rien de ce qui n'existe pas encore n'apparaît ici. Un numéro
          d'entreprise de zéros au bas de chaque page ferait perdre à
          l'association précisément ce qu'elle demande : qu'on lui fasse
          confiance assez pour lui ouvrir sa porte. */}
      <p className="pied__mentions">
        {ASSOCIATION.nom}, {ASSOCIATION.forme} en cours de constitution à{' '}
        {ASSOCIATION.ville}.
        {ASSOCIATION.numeroDEntreprise === null
          ? ''
          : ` Numéro d’entreprise ${ASSOCIATION.numeroDEntreprise}.`}
        {ASSOCIATION.contact === null ? null : (
          <>
            {' '}
            <a href={`mailto:${ASSOCIATION.contact}`}>{ASSOCIATION.contact}</a>
          </>
        )}
      </p>
    </footer>
  );
}

function identifiant(titre: string): string {
  return `pied-${titre.toLowerCase().replace(/[^a-z]+/g, '-')}`;
}
