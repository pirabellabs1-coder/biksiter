'use client';

import { useActionState } from 'react';

import { ChampTexte } from '@/components/champs';
import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';

import { seConnecter } from './actions';

export default function FormulaireDeConnexion() {
  const [etat, envoyer, enCours] = useActionState(seConnecter, FORMULAIRE_VIERGE);

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <ChampTexte
        id="email"
        label="Votre e-mail"
        type="email"
        autoComplete="email"
        required
      />

      <ChampTexte
        id="motDePasse"
        name="motDePasse"
        label="Votre mot de passe"
        type="password"
        autoComplete="current-password"
        required
      />

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Connexion…' : 'Me connecter'}
      </button>
    </form>
  );
}
