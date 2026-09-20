import { choisirLaLangue } from '@/lib/i18n/actions';
import { LANGUES, NOMS_DES_LANGUES, type Langue } from '@/lib/i18n/langue';

/**
 * Le choix de la langue, au pied des pages publiques.
 *
 * Un formulaire par langue plutôt qu'une liste déroulante : il fonctionne
 * sans JavaScript, et chaque langue est écrite dans sa propre langue pour
 * qu'on la reconnaisse sans comprendre la page.
 */
export function ChoixDeLangue({ langue }: { langue: Langue }) {
  return (
    <div className="choix-de-langue">
      {LANGUES.map((code) => (
        <form key={code} action={choisirLaLangue}>
          <input type="hidden" name="langue" value={code} />
          <button
            type="submit"
            lang={code}
            aria-current={code === langue ? 'true' : undefined}
          >
            {NOMS_DES_LANGUES[code]}
          </button>
        </form>
      ))}
    </div>
  );
}
