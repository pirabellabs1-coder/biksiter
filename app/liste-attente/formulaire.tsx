'use client';

import { useActionState } from 'react';

import {
  ChampListe,
  ChampTexte,
  optionsDepuisTable,
} from '@/components/champs';
import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';

import { ROLES } from '@/lib/formulaires/roles';

import { rejoindreLaListe } from './actions';

export default function FormulaireDeListeDAttente() {
  const [etat, envoyer, enCours] = useActionState(
    rejoindreLaListe,
    FORMULAIRE_VIERGE,
  );

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <div className="duo">
        <ChampTexte
          id="email"
          label="Votre e-mail"
          type="email"
          autoComplete="email"
          placeholder="nom@exemple.be"
          erreur={erreurs.email}
        />
        <ChampTexte
          id="quartier"
          label="Votre quartier"
          autoComplete="address-level3"
          placeholder="Ixelles"
          erreur={erreurs.quartier}
        />
      </div>

      <ChampListe
        id="role"
        label="Vous seriez plutôt…"
        options={optionsDepuisTable(ROLES)}
        erreur={erreurs.role}
      />

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Envoi…' : 'M’inscrire sur la liste'}
      </button>
    </form>
  );
}
