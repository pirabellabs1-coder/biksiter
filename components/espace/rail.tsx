'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import IconeCaracteristique from '@/components/icone-caracteristique';
import type { EntreeDEspace } from '@/lib/contenu/espace';

/**
 * La colonne de navigation de l'espace du membre.
 *
 * Seul composant client de la coque : il lui faut le chemin courant pour poser
 * `aria-current`, que le rendu serveur ne connaît pas dans une mise en page.
 * Tout le reste — l'identité, les compteurs — est calculé sur le serveur et
 * lui arrive déjà prêt.
 *
 * Le repère de la page courante n'est pas qu'une couleur : le lien change de
 * fond et porte un trait à gauche. Une personne qui ne distingue pas le vert
 * du gris voit quand même où elle est.
 */
export default function Rail({
  entrees,
  compteurs,
}: {
  entrees: readonly EntreeDEspace[];
  compteurs: Record<string, number>;
}) {
  const chemin = usePathname();

  return (
    <ul className="rail__liste">
      {entrees.map((entree) => {
        // `/mon-compte` ne doit pas s'allumer sur `/mon-compte-de-quelqu-un` :
        // on compare le chemin entier ou un segment complet qui suit.
        const courante =
          chemin === entree.chemin || chemin.startsWith(`${entree.chemin}/`);
        const combien = entree.compteur ? compteurs[entree.compteur] : 0;

        return (
          <li key={entree.chemin}>
            <Link
              href={entree.chemin}
              className="rail__lien"
              aria-current={courante ? 'page' : undefined}
            >
              <IconeCaracteristique pictogramme={entree.pictogramme} />
              <span className="rail__libelle">{entree.libelle}</span>
              {combien ? (
                <span className="rail__compteur">
                  {combien}
                  <span className="visuellement-cache">
                    {combien > 1 ? ' éléments en attente' : ' élément en attente'}
                  </span>
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
