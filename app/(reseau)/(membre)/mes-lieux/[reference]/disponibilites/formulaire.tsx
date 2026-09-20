'use client';

import { startTransition, useActionState, type FormEvent } from 'react';

import { Icone } from '@/components/app/icone';

import type { EtatDuLieu } from '../../actions';

type Option = readonly [string, string];

export function FormulaireDeDisponibilites({
  action,
  valeurs,
  options,
  textes,
}: {
  action: (precedent: EtatDuLieu, donnees: FormData) => Promise<EtatDuLieu>;
  valeurs: {
    jours: readonly number[];
    ouverture: string;
    fermeture: string;
    duree: number;
    delai: string;
    fermetures: string;
  };
  options: {
    jours: readonly Option[];
    heures: readonly string[];
    durees: readonly Option[];
    delais: readonly Option[];
  };
  textes: Record<
    | 'jours'
    | 'plage'
    | 'debut'
    | 'fin'
    | 'duree'
    | 'delai'
    | 'fermetures'
    | 'fermeturesAide'
    | 'envoyer'
    | 'envoi',
    string
  >;
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreurs: {} });

  // Sans réinitialisation : une plage mal réglée ne décoche pas tous les jours.
  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    <form action={envoyer} onSubmit={soumettre} className="formulaire-du-lieu">
      <fieldset className="sans-cadre">
        <legend className="etape-numerotee">
          <span className="numero" aria-hidden="true">1</span>
          {textes.jours}
        </legend>
        <div className="jours-semaine">
          {options.jours.map(([valeur, libelle]) => (
            <label key={valeur} className="jour-choix">
              <span>{libelle}</span>
              <input
                type="checkbox"
                role="switch"
                name="jours"
                value={valeur}
                className="sw"
                defaultChecked={valeurs.jours.includes(Number(valeur))}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="sans-cadre">
        <legend className="etape-numerotee">
          <span className="numero" aria-hidden="true">2</span>
          {textes.plage}
        </legend>
        <div className="deux-colonnes">
          <label className="champ-app">
            <Icone nom="horloge" taille={22} />
            <span className="champ-empile">
              <small>{textes.debut}</small>
              <select name="ouverture" defaultValue={valeurs.ouverture}>
                {options.heures.map((heure) => (
                  <option key={heure}>{heure}</option>
                ))}
              </select>
            </span>
          </label>
          <label className="champ-app">
            <Icone nom="horloge" taille={22} />
            <span className="champ-empile">
              <small>{textes.fin}</small>
              <select name="fermeture" defaultValue={valeurs.fermeture}>
                {options.heures.map((heure) => (
                  <option key={heure}>{heure}</option>
                ))}
              </select>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className="sans-cadre">
        <legend className="etape-numerotee">
          <span className="numero" aria-hidden="true">3</span>
          {textes.duree}
        </legend>
        <div className="liste">
          {options.durees.map(([valeur, libelle]) => (
            <label key={valeur} className="ligne">
              <input
                type="radio"
                name="duree"
                value={valeur}
                className="radio-app"
                defaultChecked={String(valeurs.duree) === valeur}
              />
              <span className="ligne-texte">
                <strong>{libelle}</strong>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="sans-cadre">
        <legend className="etape-numerotee">
          <span className="numero" aria-hidden="true">4</span>
          {textes.delai}
        </legend>
        <select name="delai" className="champ-simple" defaultValue={valeurs.delai}>
          {options.delais.map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
      </fieldset>

      <label className="champ-texte">
        <span>{textes.fermetures}</span>
        <input
          name="fermetures"
          className="champ-simple"
          defaultValue={valeurs.fermetures}
          placeholder="2026-12-24, 2026-12-25"
        />
        <small className="aide-champ">{textes.fermeturesAide}</small>
      </label>

      {etat.erreurs.formulaire ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreurs.formulaire}</span>
        </div>
      ) : null}

      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.envoyer}
      </button>
    </form>
  );
}
