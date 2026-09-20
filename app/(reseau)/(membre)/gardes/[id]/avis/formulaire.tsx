'use client';

import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

import { publierLAvis, type EtatDUneAction } from '../actions';

const VIDE: EtatDUneAction = { erreur: null };

/**
 * Cinq étoiles, mais de vrais boutons radio : une note se choisit au clavier
 * comme au doigt, et se lit par un lecteur d'écran.
 */
function Etoiles({
  nom,
  libelle,
  sur,
  valeur,
  choisir,
  grandes = false,
}: {
  nom: string;
  libelle: string;
  sur: string;
  valeur: number;
  choisir: (note: number) => void;
  grandes?: boolean;
}) {
  return (
    <fieldset className="sans-cadre">
      <legend className="lecteur">{libelle}</legend>
      <div className={grandes ? 'etoiles grandes' : 'etoiles'}>
        {[1, 2, 3, 4, 5].map((note) => (
          <label key={note} className={note <= valeur ? 'etoile allumee' : 'etoile'}>
            <input
              type="radio"
              name={nom}
              value={note}
              checked={valeur === note}
              onChange={() => choisir(note)}
              className="lecteur"
            />
            <Icone nom="etoile" taille={grandes ? 38 : 24} plein />
            <span className="lecteur">
              {note} {sur}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FormulaireDAvis({
  id,
  criteres,
  textes,
}: {
  id: string;
  criteres: readonly (readonly [string, string])[];
  textes: {
    note: string;
    detail: string;
    question: string;
    placeholder: string;
    generale: string;
    sur: string;
    bandeau: string;
    obligatoire: string;
    publier: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(
    publierLAvis.bind(null, id),
    VIDE,
  );
  const [notes, setNotes] = useState<Record<string, number>>({});
  const [texte, setTexte] = useState('');
  const generale = notes.__generale ?? 0;

  return (
    <form action={envoyer} className="pile">
      <h2 className="titre-section">
        <span className="avec-icone">
          <Icone nom="etoile" taille={20} />
          {textes.note}
        </span>
      </h2>
      <Etoiles
        nom="note"
        libelle={textes.generale}
        sur={textes.sur}
        valeur={generale}
        choisir={(note) => setNotes((n) => ({ ...n, __generale: note }))}
        grandes
      />

      <h2 className="titre-section">{textes.detail}</h2>
      <div className="liste">
        {criteres.map(([valeur, libelle]) => (
          <div key={valeur} className="ligne ligne-critere">
            <span className="ligne-texte" aria-hidden="true">
              <strong>{libelle}</strong>
            </span>
            <Etoiles
              nom={`critere:${valeur}`}
              libelle={libelle}
              sur={textes.sur}
              valeur={notes[valeur] ?? 0}
              choisir={(note) => setNotes((n) => ({ ...n, [valeur]: note }))}
            />
          </div>
        ))}
      </div>

      <label className="champ-texte">
        <span>{textes.question}</span>
        <textarea
          name="texte"
          maxLength={1000}
          placeholder={textes.placeholder}
          value={texte}
          onChange={(e) => setTexte(e.currentTarget.value)}
        />
      </label>

      <div className="encart gris">
        <Icone nom="cadenas" taille={22} />
        <span>{textes.bandeau}</span>
      </div>
      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}

      <button
        type="submit"
        className="bouton plein"
        disabled={enCours || generale === 0}
        aria-describedby={generale === 0 ? 'note-obligatoire' : undefined}
      >
        {enCours ? textes.envoi : textes.publier}
        <Icone nom="chevron" taille={20} />
      </button>
      {generale === 0 ? (
        <p id="note-obligatoire" className="petit texte-doux centre">
          {textes.obligatoire}
        </p>
      ) : null}
    </form>
  );
}
