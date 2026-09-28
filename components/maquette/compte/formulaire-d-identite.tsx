'use client';

import { useActionState } from 'react';

import {
  modifierMonNom,
  type EtatSimple,
} from '@/app/(reseau)/(membre)/profil/actions';

const VIERGE: EtatSimple = { erreur: null };

/**
 * L'identité visible du compte.
 *
 * L'adresse e-mail et le téléphone se lisent ici mais se changent par une
 * vérification : une saisie libre laisserait croire qu'un numéro non confirmé
 * sert à recevoir un code.
 */
export function FormulaireDIdentite({
  prenom,
  initiale,
  email,
  telephone,
  modifiable,
}: {
  prenom: string;
  initiale: string;
  email: string;
  telephone: string;
  /**
   * Faux une fois l'identité vérifiée (ou en cours d'examen) : le nom est
   * celui de la pièce. On le montre alors en lecture seule d'emblée, plutôt
   * que de laisser modifier des champs pour refuser à l'enregistrement.
   */
  modifiable: boolean;
}) {
  const [etat, envoyer, enCours] = useActionState(modifierMonNom, VIERGE);

  return (
    <form className="bloc" action={envoyer} noValidate>
      <h2>Votre identité</h2>
      {modifiable ? (
        <div className="deux">
          <label className="champ">
            <span>Prénom</span>
            <input
              type="text"
              name="prenom"
              autoComplete="given-name"
              defaultValue={prenom}
              className={etat.erreur ? 'champ-faux' : undefined}
            />
          </label>
          <label className="champ">
            <span>Initiale du nom</span>
            <input
              type="text"
              name="nom"
              autoComplete="family-name"
              defaultValue={initiale}
              maxLength={2}
              className={etat.erreur ? 'champ-faux' : undefined}
            />
          </label>
        </div>
      ) : null}
      {/* L'e-mail et le téléphone se lisent ici mais se changent par une
          vérification : on les montre comme des informations, pas comme des
          champs qu'on croirait pouvoir modifier. */}
      <dl className="infos-compte">
        {modifiable ? null : (
          <div>
            <dt>Nom visible</dt>
            <dd>
              {prenom} {initiale}.
            </dd>
          </div>
        )}
        <div>
          <dt>Adresse e-mail</dt>
          <dd>{email}</dd>
        </div>
        <div>
          <dt>Téléphone</dt>
          <dd>{telephone}</dd>
        </div>
      </dl>
      {etat.erreur ? (
        <p className="msg-erreur" role="alert">
          {etat.erreur}
        </p>
      ) : null}
      <p className="mention">
        Seuls votre prénom et l’initiale sont visibles. Le téléphone n’est
        communiqué qu’à la personne avec qui vous avez une garde confirmée, et
        seulement le temps de cette garde.
        {modifiable ? null : (
          <>
            {' '}
            Votre nom est celui de la pièce vérifiée : pour le corriger,{' '}
            <a href="/contact">écrivez-nous</a>.
          </>
        )}
      </p>
      {modifiable ? (
        <div className="actions-fin">
          <button
            type="submit"
            className="primary"
            disabled={enCours}
            aria-busy={enCours || undefined}
          >
            {enCours ? 'Enregistrement…' : 'Enregistrer mon nom'}
          </button>
        </div>
      ) : null}
    </form>
  );
}
