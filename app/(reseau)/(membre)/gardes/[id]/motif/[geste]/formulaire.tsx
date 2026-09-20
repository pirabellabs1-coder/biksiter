'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';
import type { Geste } from '@/lib/regles/garde';

import { gesteAvecMotif, type EtatDUneAction } from '../../actions';

const VIDE: EtatDUneAction = { erreur: null };

export function FormulaireDeMotif({
  id,
  geste,
  motifs,
  danger,
  textes,
}: {
  id: string;
  geste: Geste;
  /** La valeur enregistrée (en français) et son libellé traduit. */
  motifs: readonly (readonly [string, string])[];
  danger: boolean;
  textes: {
    motif: string;
    precision: string;
    confirmer: string;
    revenir: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(
    gesteAvecMotif.bind(null, id, geste),
    VIDE,
  );
  // Les champs sont tenus ici : un refus du serveur ne doit pas effacer le
  // motif choisi ni la précision écrite.
  const [choisi, setChoisi] = useState(motifs[0]?.[0] ?? '');
  const [precision, setPrecision] = useState('');

  return (
    <form action={envoyer} className="pile">
      <fieldset className="sans-cadre">
        <legend className="titre-section">{textes.motif}</legend>
        <div className="liste" role="radiogroup">
          {motifs.map(([valeur, libelle]) => (
            <label key={valeur} className="ligne">
              <input
                type="radio"
                name="motif"
                value={valeur}
                checked={choisi === valeur}
                onChange={() => setChoisi(valeur)}
                className="radio-app"
              />
              <span className="ligne-texte">
                <strong>{libelle}</strong>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="champ-texte">
        <span>{textes.precision}</span>
        <textarea
          name="precision"
          maxLength={400}
          value={precision}
          onChange={(e) => setPrecision(e.currentTarget.value)}
        />
        <small className="compteur-texte">{precision.length} / 400</small>
      </label>

      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}

      <button
        type="submit"
        className={danger ? 'bouton danger' : 'bouton plein'}
        disabled={enCours}
      >
        {enCours ? textes.envoi : textes.confirmer}
      </button>
      <Link href={`/gardes/${id}`} className="bouton discret">
        {textes.revenir}
      </Link>
    </form>
  );
}
