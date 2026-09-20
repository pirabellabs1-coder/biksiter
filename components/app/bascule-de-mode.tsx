import { choisirLeMode } from '@/app/(reseau)/(membre)/mode/actions';
import type { Textes } from '@/lib/i18n/langue';
import type { Mode } from '@/lib/mode';

import { Icone } from './icone';

/**
 * « Cycliste | Bike Sitter » : le même compte, deux façons de l'utiliser.
 * Deux formulaires plutôt qu'un script : la bascule marche sans JavaScript.
 */
export function BasculeDeMode({ mode, p }: { mode: Mode; p: Textes['p'] }) {
  const options: [Mode, string, 'velo' | 'maison'][] = [
    ['cycliste', p('Cycliste'), 'velo'],
    ['bike_sitter', p('Bike Sitter'), 'maison'],
  ];
  return (
    <div className="bascule" role="group" aria-label={p('Mode d’utilisation')}>
      {options.map(([valeur, libelle, icone]) => (
        <form key={valeur} action={choisirLeMode}>
          <input type="hidden" name="mode" value={valeur} />
          <button
            type="submit"
            className="bascule-option"
            aria-pressed={mode === valeur}
          >
            <Icone nom={icone} taille={20} />
            {libelle}
          </button>
        </form>
      ))}
    </div>
  );
}
