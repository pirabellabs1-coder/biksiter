'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

import { NAVIGATION } from '@/lib/contenu/navigation';

/**
 * La navigation de l'en-tête, et son bouton de menu sur écran étroit.
 *
 * C'est le seul composant client de l'en-tête, et il l'est pour deux raisons :
 * il lui faut le chemin courant pour poser `aria-current`, que le rendu
 * serveur ne connaît pas dans une mise en page, et il porte l'état ouvert /
 * fermé du menu.
 *
 * Pourquoi du JavaScript ici alors que le reste du site s'en passe : un menu
 * qui s'ouvre est un état, et les solutions sans script — `<details>`, une case
 * à cocher détournée — obligeraient à dupliquer les liens dans le document ou à
 * dépendre d'un comportement de navigateur qu'on ne contrôle pas. Vingt lignes
 * honnêtes valent mieux qu'un montage fragile.
 *
 * Le menu se referme quand l'adresse change : sans cela, il resterait ouvert
 * par-dessus la page qu'on vient de demander.
 */
export default function Navigation({
  children,
}: {
  /** Ce que l'en-tête ajoute au menu : la connexion, le compte. */
  children?: React.ReactNode;
}) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const identifiant = useId();

  useEffect(() => {
    setOuvert(false);
  }, [chemin]);

  return (
    <>
      <button
        type="button"
        className="menu__bouton"
        aria-expanded={ouvert}
        aria-controls={identifiant}
        onClick={() => setOuvert((avant) => !avant)}
      >
        <span className="menu__barres" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="visuellement-cache">
          {ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        </span>
      </button>

      <div
        id={identifiant}
        className={ouvert ? 'menu menu--ouvert' : 'menu'}
      >
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

        {children ? <div className="menu__actions">{children}</div> : null}
      </div>
    </>
  );
}
