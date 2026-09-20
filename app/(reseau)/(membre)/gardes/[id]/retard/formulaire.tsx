'use client';

import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

import type { EtatDUnAmenagement } from '../amenagements';

export function FormulaireDeRetard({
  action,
  durees,
  longueur,
  textes,
}: {
  action: (precedent: EtatDUnAmenagement, donnees: FormData) => Promise<EtatDUnAmenagement>;
  /** Les minutes et leur libellé : « + 15 min ». */
  durees: readonly (readonly [number, string])[];
  longueur: number;
  textes: {
    combien: string;
    information: string;
    mot: string;
    exemple: string;
    prevenir: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  // Tenus ici : un refus du serveur ne doit effacer ni la durée ni le mot.
  const [minutes, setMinutes] = useState(durees[0]?.[0] ?? 15);
  const [mot, setMot] = useState('');

  return (
    <form action={envoyer} className="pile">
      <fieldset className="sans-cadre">
        <legend className="titre-section">{textes.combien}</legend>
        <div className="tuiles-choix" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {durees.map(([valeur, libelle]) => (
            <label key={valeur} className="tuile-choix" style={{ justifyContent: 'center' }}>
              <input
                type="radio"
                name="minutes"
                value={valeur}
                checked={minutes === valeur}
                onChange={() => setMinutes(valeur)}
              />
              <strong>{libelle}</strong>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="encart">
        <Icone nom="info" taille={20} />
        <span>{textes.information}</span>
      </div>

      <label className="champ-texte">
        <span>{textes.mot}</span>
        <textarea
          name="mot"
          maxLength={longueur}
          placeholder={textes.exemple}
          value={mot}
          onChange={(e) => setMot(e.currentTarget.value)}
        />
        <small className="compteur-texte">
          {mot.length} / {longueur}
        </small>
      </label>

      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}

      <button type="submit" className="bouton plein" disabled={enCours}>
        <Icone nom="envoyer" taille={20} />
        {enCours ? textes.envoi : textes.prevenir}
      </button>
    </form>
  );
}
