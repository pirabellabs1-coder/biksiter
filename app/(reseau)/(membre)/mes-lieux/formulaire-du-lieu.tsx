'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';

import { Icone } from '@/components/app/icone';

import type { EtatDuLieu } from './actions';

type Option = readonly [string, string];

export type ValeursDuLieu = {
  type: string;
  adresse: string;
  quartier: string;
  acces: string;
  verrouillage: string;
  intemperie: string;
  ancrage: string;
  capacite: number;
  velos: readonly string[];
  services: readonly string[];
  precisions: string;
  description: string;
};

/**
 * Décrire un lieu. L'envoi passe par le formulaire sans le réinitialiser : une
 * adresse hors zone ne doit pas effacer tout ce qui a été saisi.
 */
export function FormulaireDuLieu({
  action,
  valeurs,
  options,
  textes,
}: {
  action: (precedent: EtatDuLieu, donnees: FormData) => Promise<EtatDuLieu>;
  valeurs: ValeursDuLieu;
  options: {
    types: readonly Option[];
    quartiers: readonly string[];
    acces: readonly Option[];
    verrouillages: readonly Option[];
    intemperies: readonly Option[];
    ancrages: readonly Option[];
    velos: readonly Option[];
    services: readonly Option[];
  };
  textes: Record<
    | 'type'
    | 'adresse'
    | 'adresseAide'
    | 'quartier'
    | 'acces'
    | 'verrouillage'
    | 'intemperie'
    | 'ancrage'
    | 'capacite'
    | 'moins'
    | 'plus'
    | 'velos'
    | 'services'
    | 'precisions'
    | 'precisionsAide'
    | 'description'
    | 'descriptionAide'
    | 'confidentialite'
    | 'envoyer'
    | 'envoi',
    string
  >;
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreurs: {} });
  const [capacite, setCapacite] = useState(valeurs.capacite);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  const erreur = (cle: string) =>
    etat.erreurs[cle] ? (
      <p className="erreur-champ" role="alert">
        {etat.erreurs[cle]}
      </p>
    ) : null;

  let numero = 0;
  const etape = (titre: string) => {
    numero += 1;
    return (
      <legend className="etape-numerotee">
        <span className="numero" aria-hidden="true">
          {numero}
        </span>
        {titre}
      </legend>
    );
  };

  return (
    <form action={envoyer} onSubmit={soumettre} className="formulaire-du-lieu">
      <fieldset className="sans-cadre">
        {etape(textes.type)}
        <div className="tuiles-choix">
          {options.types.map(([valeur, libelle]) => (
            <label key={valeur} className="tuile-choix">
              <input type="radio" name="type" value={valeur} defaultChecked={valeurs.type === valeur} required />
              <Icone nom="maison" taille={22} />
              <span>{libelle}</span>
            </label>
          ))}
        </div>
        {erreur('type')}
      </fieldset>

      <fieldset className="sans-cadre">
        {etape(textes.adresse)}
        <label className="champ-texte">
          <span className="lecteur">{textes.adresse}</span>
          <input
            name="adresse"
            className="champ-simple"
            defaultValue={valeurs.adresse}
            autoComplete="street-address"
            maxLength={200}
            required
          />
        </label>
        {erreur('adresse')}
        <label className="champ-texte">
          <span>{textes.quartier}</span>
          <select name="quartier" className="champ-simple" defaultValue={valeurs.quartier} required>
            <option value="" disabled>
              —
            </option>
            {options.quartiers.map((quartier) => (
              <option key={quartier}>{quartier}</option>
            ))}
          </select>
        </label>
        {erreur('quartier')}
        <div className="encart bleu">
          <Icone nom="cadenas" taille={20} />
          <span>{textes.adresseAide}</span>
        </div>
      </fieldset>

      <fieldset className="sans-cadre">
        {etape(textes.acces)}
        <select name="acces" className="champ-simple" defaultValue={valeurs.acces} required>
          {options.acces.map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
        {erreur('acces')}
      </fieldset>

      <fieldset className="sans-cadre">
        {etape(textes.verrouillage)}
        <div className="choix-puces">
          {options.verrouillages.map(([valeur, libelle]) => (
            <label key={valeur} className="puce-choix">
              <input type="radio" name="verrouillage" value={valeur} defaultChecked={valeurs.verrouillage === valeur} required />
              {libelle}
            </label>
          ))}
        </div>
        {erreur('verrouillage')}
      </fieldset>

      <fieldset className="sans-cadre">
        {etape(textes.intemperie)}
        <div className="choix-puces">
          {options.intemperies.map(([valeur, libelle]) => (
            <label key={valeur} className="puce-choix">
              <input type="radio" name="intemperie" value={valeur} defaultChecked={valeurs.intemperie === valeur} required />
              {libelle}
            </label>
          ))}
        </div>
        {erreur('intemperie')}
      </fieldset>

      <fieldset className="sans-cadre">
        {etape(textes.ancrage)}
        <div className="choix-puces">
          {options.ancrages.map(([valeur, libelle]) => (
            <label key={valeur} className="puce-choix">
              <input type="radio" name="ancrage" value={valeur} defaultChecked={valeurs.ancrage === valeur} required />
              {libelle}
            </label>
          ))}
        </div>
        {erreur('ancrage')}
      </fieldset>

      <fieldset className="sans-cadre">
        {etape(textes.capacite)}
        <div className="compteur-capacite">
          <button
            type="button"
            className="bouton-rond"
            onClick={() => setCapacite((c) => Math.max(1, c - 1))}
            aria-label={textes.moins}
          >
            −
          </button>
          <input
            name="capacite"
            type="number"
            min={1}
            max={10}
            value={capacite}
            onChange={(e) => setCapacite(Math.min(10, Math.max(1, Number(e.currentTarget.value) || 1)))}
            aria-label={textes.capacite}
          />
          <button
            type="button"
            className="bouton-rond"
            onClick={() => setCapacite((c) => Math.min(10, c + 1))}
            aria-label={textes.plus}
          >
            +
          </button>
        </div>
        {erreur('capacite')}
      </fieldset>

      <fieldset className="sans-cadre">
        {etape(textes.velos)}
        <div className="choix-puces">
          {options.velos.map(([valeur, libelle]) => (
            <label key={valeur} className="puce-choix">
              <input type="checkbox" name="velos" value={valeur} defaultChecked={valeurs.velos.includes(valeur)} />
              {libelle}
            </label>
          ))}
        </div>
        {erreur('velos')}
      </fieldset>

      <fieldset className="sans-cadre">
        {etape(textes.services)}
        <div className="choix-puces">
          {options.services.map(([valeur, libelle]) => (
            <label key={valeur} className="puce-choix">
              <input type="checkbox" name="services" value={valeur} defaultChecked={valeurs.services.includes(valeur)} />
              {libelle}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="champ-texte">
        <span>{textes.precisions}</span>
        <textarea name="precisions" maxLength={300} defaultValue={valeurs.precisions} />
        <small className="aide-champ">{textes.precisionsAide}</small>
      </label>

      <label className="champ-texte">
        <span>{textes.description}</span>
        <textarea name="description" maxLength={1000} defaultValue={valeurs.description} />
        <small className="aide-champ">{textes.descriptionAide}</small>
      </label>

      <div className="encart">
        <Icone nom="info" taille={20} />
        <span>{textes.confidentialite}</span>
      </div>

      {etat.erreurs.formulaire ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreurs.formulaire}</span>
        </div>
      ) : Object.keys(etat.erreurs).length > 0 ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{Object.values(etat.erreurs)[0]}</span>
        </div>
      ) : null}

      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.envoyer}
        <Icone nom="chevron" taille={20} />
      </button>
    </form>
  );
}
