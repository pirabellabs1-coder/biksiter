'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { choisirLeMode } from '@/app/(reseau)/(membre)/mode/actions';

import { coteAffiche } from './tabbar';

/**
 * La bascule cycliste / bike sitter de l'en-tête.
 *
 * Un membre est cycliste et bike sitter selon le moment : la bascule change
 * de point de vue, elle ne demande pas un statut. Tant qu'aucun emplacement
 * n'a été publié, c'est « Devenir Bike Sitter » qui s'affiche — la maquette
 * le faisait avec `body[data-sitter]`, ce qui se décide ici au rendu.
 *
 * Chaque côté est un formulaire : la bascule pose le témoin de mode, sans
 * quoi la barre du bas resterait celle de l'autre rôle. Elle fonctionne donc
 * aussi sans JavaScript.
 */
export function BasculeDeRole({
  estBikeSitter,
  role,
}: {
  estBikeSitter: boolean;
  role: 'cycliste' | 'sitter';
}) {
  // La page peut désigner un côté (une demande reçue est côté bike sitter) :
  // le segment annoncé « sélectionné » est alors celui que l'on voit.
  const chemin = usePathname();
  const [cote, setCote] = useState(role);
  useEffect(() => {
    const affiche = coteAffiche(chemin);
    if (affiche) setCote(affiche);
  }, [chemin]);

  return (
    <div className="bascule-role" role="group" aria-label="Votre rôle">
      <form action={choisirLeMode}>
        <input type="hidden" name="mode" value="cycliste" />
        <input type="hidden" name="vers" value="/mon-espace" />
        <button
          type="submit"
          className="br"
          data-mode="cycliste"
          aria-pressed={cote === 'cycliste'}
        >
          Cycliste
        </button>
      </form>

      {estBikeSitter ? (
        <form action={choisirLeMode}>
          <input type="hidden" name="mode" value="bike_sitter" />
          <input type="hidden" name="vers" value="/accueil" />
          <button
            type="submit"
            className="br br-sitter"
            data-mode="sitter"
            aria-pressed={cote === 'sitter'}
          >
            Bike Sitter
          </button>
        </form>
      ) : (
        <form action={choisirLeMode}>
          <input type="hidden" name="mode" value="bike_sitter" />
          <input type="hidden" name="vers" value="/devenir-bike-sitter" />
          {/* Le libellé reste court : « Devenir Bike Sitter » faisait déborder
              l'en-tête d'un téléphone. L'écran d'arrivée explique la suite. */}
          <button
            type="submit"
            className="br br-devenir"
            data-mode="sitter"
            aria-pressed={cote === 'sitter'}
            aria-label="Devenir Bike Sitter"
          >
            Bike Sitter
          </button>
        </form>
      )}
    </div>
  );
}
