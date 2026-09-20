'use client';

import { useActionState } from 'react';

import { Icone } from '@/components/app/icone';
import {
  ERREUR_GENERALE,
  FORMULAIRE_VIERGE,
} from '@/lib/formulaires/etat';

import { BORD_EN_ERREUR } from '../ecran-de-compte';
import { annoncerMonDon } from './actions';

type Libelles = {
  prenom: string;
  montant: string;
  email: string;
  aideEmail: string;
  envoyer: string;
  envoi: string;
};

/**
 * Tout est facultatif, y compris le montant. Un don anonyme reste un don.
 */
export function FormulaireDeDon({ libelles }: { libelles: Libelles }) {
  const [etat, envoyer, enCours] = useActionState(
    annoncerMonDon,
    FORMULAIRE_VIERGE,
  );

  if (etat.statut === 'valide') {
    return (
      <div className="encart" role="status">
        <Icone nom="coche" taille={22} />
        <span>{etat.message}</span>
      </div>
    );
  }

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};
  const general = erreurs[ERREUR_GENERALE];

  return (
    <form action={envoyer} noValidate className="pile">
      {general ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{general}</span>
        </div>
      ) : null}

      <div className="colonnes colonnes-egales">
        <label className="champ-app">
          <Icone nom="profil" taille={22} />
          <span className="champ-empile">
            <small>{libelles.prenom}</small>
            <input name="prenom" autoComplete="given-name" />
          </span>
        </label>
        <label
          className="champ-app"
          style={erreurs.montant ? BORD_EN_ERREUR : undefined}
        >
          <span aria-hidden="true">€</span>
          <span className="champ-empile">
            <small>{libelles.montant}</small>
            <input
              name="montant"
              type="number"
              min={1}
              inputMode="numeric"
              aria-invalid={erreurs.montant ? true : undefined}
            />
          </span>
        </label>
      </div>
      {erreurs.montant ? (
        <p className="erreur-champ">{erreurs.montant}</p>
      ) : null}

      <label
        className="champ-app"
        style={erreurs.email ? BORD_EN_ERREUR : undefined}
      >
        <Icone nom="enveloppe" taille={22} />
        <span className="champ-empile">
          <small>{libelles.email}</small>
          <input
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={erreurs.email ? true : undefined}
          />
        </span>
      </label>
      {erreurs.email ? (
        <p className="erreur-champ">{erreurs.email}</p>
      ) : (
        <p className="petit texte-doux">{libelles.aideEmail}</p>
      )}

      <button type="submit" className="bouton plein" disabled={enCours}>
        <Icone nom="envoyer" taille={20} />
        {enCours ? libelles.envoi : libelles.envoyer}
      </button>
    </form>
  );
}
