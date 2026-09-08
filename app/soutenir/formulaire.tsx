'use client';

import { useActionState } from 'react';

import { ChampTexte } from '@/components/champs';
import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';

import { annoncerMonDon } from './actions';

/**
 * Tout est facultatif, y compris le montant.
 *
 * Un don anonyme reste un don, et demander une identité pour en accepter un
 * serait une façon de classer les gens — ce que ce produit ne fait nulle part.
 * Le prénom et l'adresse ne servent qu'à dire merci et à renvoyer la
 * communication structurée.
 */
export default function FormulaireDeDon() {
  const [etat, envoyer, enCours] = useActionState(
    annoncerMonDon,
    FORMULAIRE_VIERGE,
  );

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <div className="duo">
        <ChampTexte
          id="prenom"
          label="Votre prénom (facultatif)"
          autoComplete="given-name"
        />
        <ChampTexte
          id="montant"
          label="Montant en euros (facultatif)"
          type="number"
          min={1}
          inputMode="numeric"
          erreur={erreurs.montant}
        />
      </div>

      <ChampTexte
        id="email"
        label="Votre e-mail (facultatif)"
        type="email"
        autoComplete="email"
        aide="Pour recevoir les coordonnées par écrit. Nous ne nous en servons pour rien d’autre."
        erreur={erreurs.email}
      />

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Un instant…' : 'Obtenir les coordonnées du virement'}
      </button>
    </form>
  );
}
