'use client';

import { startTransition, useActionState, type FormEvent } from 'react';

import { Icone } from '@/components/app/icone';

import { enregistrerUnVelo, type EtatSimple } from '../../actions';

const VIDE: EtatSimple = { erreur: null };

/**
 * L'envoi passe par le formulaire sans le réinitialiser : un nom refusé ne
 * doit pas effacer la marque, la couleur et le numéro de cadre déjà saisis.
 */
export function FormulaireDeVelo({
  types,
  textes,
}: {
  types: readonly (readonly [string, string])[];
  textes: {
    nom: string;
    nomExemple: string;
    marque: string;
    type: string;
    couleur: string;
    couleurExemple: string;
    cadre: string;
    cadreExplication: string;
    enregistrer: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(enregistrerUnVelo, VIDE);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    <form action={envoyer} onSubmit={soumettre} className="pile">
      <label className="champ-texte">
        <span>{textes.nom}</span>
        <input
          name="nom"
          className="champ-simple"
          maxLength={60}
          placeholder={textes.nomExemple}
          required
        />
      </label>
      <div className="deux-colonnes">
        <label className="champ-texte">
          <span>{textes.type}</span>
          <select name="type" className="champ-simple" defaultValue="Ville">
            {types.map(([valeur, libelle]) => (
              <option key={valeur} value={valeur}>
                {libelle}
              </option>
            ))}
          </select>
        </label>
        <label className="champ-texte">
          <span>{textes.couleur}</span>
          <input
            name="couleur"
            className="champ-simple"
            maxLength={40}
            placeholder={textes.couleurExemple}
          />
        </label>
      </div>
      <label className="champ-texte">
        <span>{textes.marque}</span>
        <input name="marque" className="champ-simple" maxLength={60} placeholder="Btwin" />
      </label>
      <label className="champ-texte">
        <span>{textes.cadre}</span>
        <input
          name="cadre"
          className="champ-simple"
          maxLength={60}
          autoComplete="off"
          aria-describedby="velo-cadre-aide"
        />
      </label>
      <div id="velo-cadre-aide" className="encart bleu">
        <Icone nom="cadenas" taille={20} />
        <span>{textes.cadreExplication}</span>
      </div>

      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}

      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.enregistrer}
      </button>
    </form>
  );
}
