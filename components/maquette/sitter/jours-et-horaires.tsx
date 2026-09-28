'use client';

import { useActionState, useState } from 'react';

type Etat = { erreurs: Readonly<Record<string, string>> };

export type OptionsDesDisponibilites = {
  /** Les sept jours, dans l'ordre où l'on pense sa semaine : lundi d'abord. */
  jours: readonly (readonly [number, string])[];
  heures: readonly (readonly [string, string])[];
  durees: readonly (readonly [number, string])[];
};

export type ValeursDesDisponibilites = {
  jours: readonly number[];
  ouverture: string;
  fermeture: string;
  duree: number;
  /** Conservé tel quel : la maquette ne le montre pas, la règle l'exige. */
  delai: string;
  fermetures: string;
};

/**
 * Les jours et les heures d'accueil.
 *
 * Les jours se cochent d'un clic, comme dans la maquette ; ils partent en
 * champs cachés pour que l'action serveur lise la même liste que l'écran.
 */
export function JoursEtHoraires({
  action,
  valeurs,
  options,
  envoyer,
}: {
  action: (etat: Etat, donnees: FormData) => Promise<Etat>;
  valeurs: ValeursDesDisponibilites;
  options: OptionsDesDisponibilites;
  envoyer: string;
}) {
  const [etat, soumettre, enCours] = useActionState(action, { erreurs: {} });
  const [jours, setJours] = useState<readonly number[]>(valeurs.jours);
  // Ce que le bike sitter vient d'envoyer. Après une réponse, React remet le
  // formulaire à ses valeurs par défaut : ce sont donc celles-ci qui servent
  // de défaut, pour qu'une erreur ne fasse pas perdre la saisie.
  const [saisie, setSaisie] = useState({
    ouverture: String(valeurs.ouverture),
    fermeture: String(valeurs.fermeture),
    duree: String(valeurs.duree),
  });
  const envoyerLaSaisie = (donnees: FormData) => {
    setSaisie({
      ouverture: String(donnees.get('ouverture') ?? valeurs.ouverture),
      fermeture: String(donnees.get('fermeture') ?? valeurs.fermeture),
      duree: String(donnees.get('duree') ?? valeurs.duree),
    });
    soumettre(donnees);
  };

  const basculer = (jour: number) =>
    setJours((choisis) =>
      choisis.includes(jour)
        ? choisis.filter((autre) => autre !== jour)
        : [...choisis, jour],
    );

  return (
    <form action={envoyerLaSaisie}>
      <div className="jours-semaine" role="group" aria-label="Jours d’accueil">
        {options.jours.map(([jour, libelle]) => {
          const choisi = jours.includes(jour);
          return (
            <button
              type="button"
              key={jour}
              className={choisi ? 'jour-b on' : 'jour-b'}
              aria-pressed={choisi}
              onClick={() => basculer(jour)}
            >
              {libelle}
            </button>
          );
        })}
      </div>
      {jours.map((jour) => (
        <input key={jour} type="hidden" name="jours" value={jour} />
      ))}

      <div className="champs">
        <label>
          <span>À partir de</span>
          <select
            name="ouverture"
            key={`ouverture-${saisie.ouverture}`}
            defaultValue={saisie.ouverture}
          >
            {options.heures.map(([heure, libelle]) => (
              <option key={heure} value={heure}>
                {libelle}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Jusqu’à</span>
          <select
            name="fermeture"
            key={`fermeture-${saisie.fermeture}`}
            defaultValue={saisie.fermeture}
          >
            {options.heures.map(([heure, libelle]) => (
              <option key={heure} value={heure}>
                {libelle}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Durée maximale d’affilée</span>
          <select
            name="duree"
            key={`duree-${saisie.duree}`}
            defaultValue={saisie.duree}
          >
            {options.durees.map(([duree, libelle]) => (
              <option key={duree} value={duree}>
                {libelle}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="delai" value={valeurs.delai} />
      <input type="hidden" name="fermetures" value={valeurs.fermetures} />

      <p className="prog-note">
        Vous recevez seulement des demandes comprises dans ces horaires. Une
        garde dure cinq heures au plus ; trois heures sont proposées par défaut,
        et vous pouvez les ajuster.
      </p>

      {Object.values(etat.erreurs).map((erreur) => (
        <p className="bs-alerte" role="alert" key={erreur}>
          <b>À revoir</b>
          {erreur}
        </p>
      ))}

      <button type="submit" className="primary bs-cta" disabled={enCours}>
        {enCours ? 'Envoi…' : envoyer}
      </button>
    </form>
  );
}
