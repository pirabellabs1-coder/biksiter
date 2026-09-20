'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

import { BORD_EN_ERREUR, EncartDErreurs } from '../ecran-de-compte';
import { demanderLeLien, type EtatDeLaDemande } from './actions';

const VIERGE: EtatDeLaDemande = { statut: 'vierge' };

export function FormulaireDOubli({
  libelles,
}: {
  libelles: { email: string; envoyer: string; enCours: string; retour: string };
}) {
  const [etat, envoyer, enCours] = useActionState(demanderLeLien, VIERGE);
  // L'adresse est tenue par l'écran : React vide le formulaire au retour
  // d'une erreur, et une adresse mal tapée se corrige mieux qu'elle ne se
  // retape.
  const [email, setEmail] = useState(
    etat.statut === 'erreur' ? etat.email : '',
  );

  if (etat.statut === 'envoyee') {
    return (
      <div className="pile">
        <div className="encart" role="status">
          <Icone nom="envoyer" taille={20} />
          <span>{etat.message}</span>
        </div>
        <Link href="/connexion" className="bouton contour">
          {libelles.retour}
        </Link>
      </div>
    );
  }

  const erreur = etat.statut === 'erreur';

  return (
    <form action={envoyer} noValidate className="pile">
      <label
        className="champ-app"
        style={erreur ? BORD_EN_ERREUR : undefined}
      >
        <Icone nom="envoyer" taille={22} />
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
            aria-describedby={erreur ? 'erreur-oubli' : undefined}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      {erreur ? (
        <EncartDErreurs id="erreur-oubli" erreurs={[etat.erreur]} />
      ) : null}

      <button
        type="submit"
        className="bouton plein"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? libelles.enCours : libelles.envoyer}
      </button>
    </form>
  );
}
