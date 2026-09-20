'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Icone } from '@/components/app/icone';

import { BORD_EN_ERREUR, EncartDErreurs } from '../ecran-de-compte';
import {
  enregistrerLeMotDePasse,
  type EtatDuNouveauMotDePasse,
} from './actions';

const VIERGE: EtatDuNouveauMotDePasse = { statut: 'vierge' };

/**
 * Les deux mots de passe restent des champs libres : après un refus, React
 * les vide, et c'est voulu — un mot de passe ne se garde pas dans l'écran.
 */
export function FormulaireDuNouveauMotDePasse({
  jeton,
  libelles,
}: {
  jeton: string;
  libelles: {
    motDePasse: string;
    aide: string;
    confirmation: string;
    redemander: string;
    enregistrer: string;
    enCours: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(
    enregistrerLeMotDePasse,
    VIERGE,
  );
  const erreur = etat.statut === 'erreur';
  const decrit = (...ids: (string | false)[]) =>
    ids.filter(Boolean).join(' ') || undefined;

  return (
    <form action={envoyer} noValidate className="pile">
      <input type="hidden" name="jeton" value={jeton} />

      <div>
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
              autoComplete="new-password"
              required
              aria-invalid={erreur || undefined}
              aria-describedby={decrit(
                'aide-nouveau-mot-de-passe',
                erreur && 'erreur-mot-de-passe',
              )}
              style={{ minHeight: 26 }}
            />
          </span>
        </label>
        <small id="aide-nouveau-mot-de-passe" className="aide-champ">
          {libelles.aide}
        </small>
      </div>

      <label
        className="champ-app"
        style={erreur ? BORD_EN_ERREUR : undefined}
      >
        <Icone nom="cadenas" taille={22} />
        <span className="champ-empile">
          <small>{libelles.confirmation}</small>
          <input
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={erreur || undefined}
            aria-describedby={decrit(erreur && 'erreur-mot-de-passe')}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      {erreur ? (
        <EncartDErreurs id="erreur-mot-de-passe" erreurs={[etat.erreur]} />
      ) : null}
      <button
        type="submit"
        className="bouton plein"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? libelles.enCours : libelles.enregistrer}
      </button>
      {erreur && etat.lienPerime ? (
        <Link href="/mot-de-passe-oublie" className="bouton contour">
          {libelles.redemander}
        </Link>
      ) : null}
    </form>
  );
}
