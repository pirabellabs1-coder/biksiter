import Link from 'next/link';

import type { Textes } from '@/lib/i18n/langue';

/**
 * La barre de titre d'un écran.
 *
 * Le retour mène à l'écran parent, pas à la page précédente de l'historique :
 * quelqu'un arrivé par un lien partagé doit pouvoir remonter lui aussi.
 */
export function BarreDeTitre({
  titre,
  retour,
  p,
  children,
}: {
  titre: string;
  retour?: string;
  p: Textes['p'];
  children?: React.ReactNode;
}) {
  return (
    <header className="topbar">
      {retour ? (
        <Link href={retour} className="iconbtn" aria-label={p('Revenir')}>
          ←
        </Link>
      ) : null}
      <h1>{titre}</h1>
      {children}
    </header>
  );
}
