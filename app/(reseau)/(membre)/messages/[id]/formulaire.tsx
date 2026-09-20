'use client';

import { useActionState, useEffect, useRef, useState } from 'react';

import { Icone } from '@/components/app/icone';

import { envoyerUnMessage, type EtatDuMessage } from './actions';

const VIDE: EtatDuMessage = { erreur: null, envoye: 0 };

export function FormulaireDeMessage({
  id,
  textes,
}: {
  id: string;
  textes: { placeholder: string; envoyer: string; libelle: string };
}) {
  const [etat, envoyer, enCours] = useActionState(
    envoyerUnMessage.bind(null, id),
    VIDE,
  );
  // Le texte est tenu ici : un envoi refusé ne doit pas effacer le message.
  const [corps, setCorps] = useState('');
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (etat.envoye === 0) return;
    setCorps('');
    champ.current?.focus();
  }, [etat.envoye]);

  return (
    <form action={envoyer} className="barre-d-action compositeur">
      {etat.erreur ? (
        <p className="petit texte-rouge" role="alert">
          {etat.erreur}
        </p>
      ) : null}
      <div className="compositeur-ligne">
        <label htmlFor="message-a-envoyer" className="lecteur">
          {textes.libelle}
        </label>
        <input
          ref={champ}
          id="message-a-envoyer"
          name="corps"
          maxLength={2000}
          placeholder={textes.placeholder}
          autoComplete="off"
          value={corps}
          onChange={(e) => setCorps(e.currentTarget.value)}
          required
        />
        <button
          type="submit"
          className="bouton-envoyer"
          disabled={enCours || corps.trim() === ''}
          aria-label={textes.envoyer}
        >
          <Icone nom="envoyer" taille={22} />
        </button>
      </div>
    </form>
  );
}
