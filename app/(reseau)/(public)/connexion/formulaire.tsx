'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

import { BORD_EN_ERREUR, EncartDErreurs } from '../ecran-de-compte';
import { seConnecter, type EtatDeLaConnexion } from './actions';

const VIERGE: EtatDeLaConnexion = { statut: 'vierge' };

export function FormulaireDeConnexion({
  libelles,
}: {
  libelles: {
    email: string;
    motDePasse: string;
    oublie: string;
    seConnecter: string;
    enCours: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(seConnecter, VIERGE);
  // L'adresse est tenue par l'écran : React vide le formulaire au retour
  // d'une erreur, et il serait pénible de la retaper. Le mot de passe, lui,
  // n'est jamais gardé : il s'efface, comme attendu. La valeur de départ vient
  // de la réponse du serveur quand la page s'affiche sans JavaScript.
  const [email, setEmail] = useState(
    etat.statut === 'erreur' ? etat.email : '',
  );
  const erreur = etat.statut === 'erreur';
  const decrit = erreur ? 'erreur-connexion' : undefined;

  return (
    <form action={envoyer} noValidate className="pile">
      <label
        className="champ-app"
        style={erreur ? BORD_EN_ERREUR : undefined}
      >
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
            aria-invalid={erreur || undefined}
            aria-describedby={decrit}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      <label
        className="champ-app"
        style={erreur ? BORD_EN_ERREUR : undefined}
      >
        <Icone nom="cadenas" taille={22} />
        <span className="champ-empile">
          <small>{libelles.motDePasse}</small>
          <input
            name="motDePasse"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={erreur || undefined}
            aria-describedby={decrit}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      <p style={{ margin: '6px 0 0', textAlign: 'right' }}>
        <Link
          href="/mot-de-passe-oublie"
          className="lien-souligne texte-vert"
          style={{ display: 'inline-block', padding: '4px 0', fontSize: 14 }}
        >
          {libelles.oublie}
        </Link>
      </p>

      {erreur ? (
        <EncartDErreurs id="erreur-connexion" erreurs={[etat.erreur]} />
      ) : null}

      <button
        type="submit"
        className="bouton plein"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? libelles.enCours : libelles.seConnecter}
      </button>
    </form>
  );
}
