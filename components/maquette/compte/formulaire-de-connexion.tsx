'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import {
  seConnecter,
  type EtatDeLaConnexion,
} from '@/app/(reseau)/(public)/connexion/actions';

const VIERGE: EtatDeLaConnexion = { statut: 'vierge' };

/**
 * Le formulaire de connexion des maquettes définitives.
 *
 * L'adresse revient de la réponse du serveur ; le mot de passe, jamais
 * renvoyé, s'efface — c'est ce qu'on attend d'un champ de mot de passe.
 */
export function FormulaireDeConnexion({
  suite = null,
}: {
  /** La page où revenir après la connexion, déjà vérifiée par la page. */
  suite?: string | null;
}) {
  const [etat, envoyer, enCours] = useActionState(seConnecter, VIERGE);
  const erreur = etat.statut === 'erreur';

  return (
    <form className="bloc" action={envoyer} noValidate>
      {suite ? <input type="hidden" name="suite" value={suite} /> : null}
      <h2>Se connecter</h2>
      <label className="champ">
        <span>Adresse e-mail</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="vous@exemple.be"
          required
          defaultValue={erreur ? etat.email : ''}
          className={erreur ? 'champ-faux' : undefined}
          aria-invalid={erreur || undefined}
          aria-describedby={erreur ? 'connexion-erreur' : undefined}
        />
      </label>
      <label className="champ">
        <span>Mot de passe</span>
        <input
          type="password"
          name="motDePasse"
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          required
          className={erreur ? 'champ-faux' : undefined}
          aria-invalid={erreur || undefined}
          aria-describedby={erreur ? 'connexion-erreur' : undefined}
        />
      </label>
      <div className="connexion-options">
        <label className="fc-case">
          <input type="checkbox" name="rester" defaultChecked />
          <span>Rester connecté</span>
        </label>
        {/* Un lien direct, à sa place habituelle, au lieu d'une phrase dont
            le lien tombait au milieu. */}
        <Link className="lien-oubli" href="/mot-de-passe-oublie">
          Mot de passe oublié ?
        </Link>
      </div>

      {erreur ? (
        <p className="msg-erreur" id="connexion-erreur" role="alert">
          {etat.erreur}
        </p>
      ) : null}

      {/* La maquette mettait cette action en bleu ; le bleu ne dit que
          « vérifié » (règle 6), les actions restent vertes. */}
      <button
        type="submit"
        className="primary connexion-envoyer"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
