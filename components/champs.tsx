import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

/**
 * Les champs de formulaire du site.
 *
 * Ils existent pour une seule raison : l’étiquette, l’aide et le message
 * d’erreur doivent être reliés au champ par `for` et `aria-describedby` à
 * chaque fois, sans exception. Écrire ces trois attributs à la main quarante
 * fois, c’est en oublier un.
 */

type Commun = {
  id: string;
  label: string;
  aide?: string;
  erreur?: string;
};

function decrit(id: string, aide?: string, erreur?: string): string | undefined {
  const parties = [
    aide ? `${id}-aide` : null,
    erreur ? `${id}-erreur` : null,
  ].filter((partie): partie is string => partie !== null);

  return parties.length > 0 ? parties.join(' ') : undefined;
}

function Aide({ id, aide }: { id: string; aide?: string }) {
  if (!aide) {
    return null;
  }

  return (
    <span id={`${id}-aide`} className="champ__aide">
      {aide}
    </span>
  );
}

function Erreur({ id, erreur }: { id: string; erreur?: string }) {
  if (!erreur) {
    return null;
  }

  return (
    <span id={`${id}-erreur`} className="champ__erreur">
      {erreur}
    </span>
  );
}

export function ChampTexte({
  id,
  label,
  aide,
  erreur,
  ...attributs
}: Commun & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      <Aide id={id} aide={aide} />
      <input
        id={id}
        name={attributs.name ?? id}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decrit(id, aide, erreur)}
        {...attributs}
      />
      <Erreur id={id} erreur={erreur} />
    </div>
  );
}

export function ChampZoneDeTexte({
  id,
  label,
  aide,
  erreur,
  ...attributs
}: Commun & InputHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      <Aide id={id} aide={aide} />
      <textarea
        id={id}
        name={attributs.name ?? id}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decrit(id, aide, erreur)}
        {...attributs}
      />
      <Erreur id={id} erreur={erreur} />
    </div>
  );
}

export type Option = { valeur: string; libelle: string };

export function ChampListe({
  id,
  label,
  aide,
  erreur,
  options,
  invite = 'Choisir…',
  ...attributs
}: Commun & {
  options: readonly Option[];
  invite?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      <Aide id={id} aide={aide} />
      <select
        id={id}
        name={attributs.name ?? id}
        defaultValue=""
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decrit(id, aide, erreur)}
        {...attributs}
      >
        <option value="" disabled>
          {invite}
        </option>
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
      <Erreur id={id} erreur={erreur} />
    </div>
  );
}

export function GroupeDeCases({
  nom,
  legende,
  aide,
  erreur,
  options,
}: {
  nom: string;
  legende: string;
  aide?: string;
  erreur?: string;
  options: readonly Option[];
}) {
  return (
    // L'identifiant et `tabIndex` existent pour que le lien du résumé
    // d'erreurs (« #velos ») atteigne vraiment le groupe et y pose le focus.
    <fieldset id={nom} tabIndex={-1} aria-describedby={decrit(nom, aide, erreur)}>
      <legend>{legende}</legend>
      <Aide id={nom} aide={aide} />
      <div className="cases">
        {options.map((option) => {
          const identifiant = `${nom}-${option.valeur.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          return (
            <div className="case" key={option.valeur}>
              <input
                type="checkbox"
                id={identifiant}
                name={nom}
                value={option.valeur}
              />
              <label htmlFor={identifiant}>{option.libelle}</label>
            </div>
          );
        })}
      </div>
      <Erreur id={nom} erreur={erreur} />
    </fieldset>
  );
}

/** Transforme une liste fermée en options, sans la recopier. */
export function optionsDepuis(valeurs: readonly string[]): readonly Option[] {
  return valeurs.map((valeur) => ({ valeur, libelle: valeur }));
}

/** Idem pour les listes dont la clé technique diffère du libellé. */
export function optionsDepuisTable(
  table: Readonly<Record<string, string>>,
): readonly Option[] {
  return Object.entries(table).map(([valeur, libelle]) => ({ valeur, libelle }));
}
