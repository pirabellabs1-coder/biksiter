'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

import { EncartDErreurs } from '../ecran-de-compte';
import { rejoindreLaListe, type EtatDeLaListe } from './actions';

type Libelles = {
  email: string;
  quartier: string;
  plutot: string;
  roles: readonly (readonly [string, string])[];
  conseil: string;
  inscrire: string;
  enCours: string;
  retour: string;
};

const VIERGE: EtatDeLaListe = { statut: 'vierge' };

export function FormulaireDeLaListe({
  libelles,
  quartierPropose,
}: {
  libelles: Libelles;
  quartierPropose: string;
}) {
  const [etat, envoyer, enCours] = useActionState(rejoindreLaListe, VIERGE);
  const saisie = etat.statut === 'erreur' ? etat.saisie : undefined;
  // L'adresse est tenue par l'écran : React vide le formulaire au retour
  // d'une erreur. Le quartier et le choix reviennent de la réponse du serveur.
  const [email, setEmail] = useState(saisie?.email ?? '');

  if (etat.statut === 'inscrit') {
    return (
      <div className="pile">
        <div className="encart" role="status">
          <Icone nom="coche" taille={20} />
          <span>{etat.message}</span>
        </div>
        <Link href="/" className="bouton contour">
          {libelles.retour}
        </Link>
      </div>
    );
  }

  const role = saisie?.role || 'bike_sitter';

  return (
    <form action={envoyer} noValidate className="pile">
      <label className="champ-app">
        <Icone nom="enveloppe" taille={22} />
        <span className="champ-empile">
          <small>{libelles.email}</small>
          <input
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nom@exemple.be"
            required
            value={email}
            onChange={(evenement) => setEmail(evenement.currentTarget.value)}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      <label className="champ-app">
        <Icone nom="epingle" taille={22} />
        <span className="champ-empile">
          <small>{libelles.quartier}</small>
          <input
            name="quartier"
            autoComplete="address-level3"
            placeholder="Saint-Gilles"
            maxLength={80}
            required
            defaultValue={saisie?.quartier ?? quartierPropose}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      <fieldset className="sans-cadre">
        <legend
          style={{ padding: 0, margin: '6px 0 8px', fontSize: 14, fontWeight: 700 }}
        >
          {libelles.plutot}
        </legend>
        <div className="choix-puces">
          {/* Le bouton radio, masqué, prend toute la largeur de son bloc : la
              pastille lui sert de repère, sinon il déborderait de l'écran. */}
          {libelles.roles.map(([valeur, libelle]) => (
            <label
              key={valeur}
              className="puce-choix"
              style={{ position: 'relative' }}
            >
              <input
                type="radio"
                name="role"
                value={valeur}
                defaultChecked={valeur === role}
              />
              {libelle}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="encart">
        <Icone nom="info" taille={20} />
        <span>{libelles.conseil}</span>
      </div>

      {etat.statut === 'erreur' ? (
        <EncartDErreurs erreurs={etat.erreurs} />
      ) : null}

      <button
        type="submit"
        className="bouton plein"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? libelles.enCours : libelles.inscrire}
      </button>
    </form>
  );
}
