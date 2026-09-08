'use client';

/**
 * Seul composant client de l’en-tête : il lui faut le chemin courant pour
 * poser `aria-current`, que le rendu serveur ne connaît pas dans un layout.
 * Tout le reste de l’en-tête est rendu sur le serveur.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAVIGATION } from '@/lib/contenu/navigation';

export default function Navigation() {
  const chemin = usePathname();

  return (
    <ul className="navigation">
      {NAVIGATION.map(({ chemin: cible, libelle }) => (
        <li key={cible}>
          <Link
            href={cible}
            aria-current={chemin.startsWith(cible) ? 'page' : undefined}
          >
            {libelle}
          </Link>
        </li>
      ))}
    </ul>
  );
}
