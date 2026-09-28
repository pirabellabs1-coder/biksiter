'use client';

import { useRef } from 'react';

import { choisirLaLangue } from '@/lib/i18n/actions';
import {
  LANGUES,
  NOMS_DES_LANGUES,
  type Langue,
} from '@/lib/i18n/traduction';

/**
 * La langue, choisie depuis le compte.
 *
 * La maquette appliquait la langue au changement de la liste. Ici le
 * changement envoie le formulaire ; le bouton reste dans le document pour que
 * le choix aboutisse aussi sans JavaScript.
 */
export function ChoixDeLangueDuCompte({ langue }: { langue: Langue }) {
  const formulaire = useRef<HTMLFormElement>(null);

  return (
    <form ref={formulaire} action={choisirLaLangue}>
      <label className="champ">
        <span>Langue</span>
        <select
          name="langue"
          defaultValue={langue}
          onChange={() => formulaire.current?.requestSubmit()}
        >
          {LANGUES.map((code) => (
            <option key={code} value={code} lang={code}>
              {NOMS_DES_LANGUES[code]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="vh">
        Appliquer la langue
      </button>
    </form>
  );
}
