'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE, type EtatDuFormulaire } from '@/lib/formulaires/etat';

/**
 * Le retrait est séparé du reste de la page, et demande une confirmation
 * explicite : c'est la seule action de tout le produit qui efface quelque
 * chose sans retour possible.
 */
export default function Retrait({
  action,
  retenu,
}: {
  action: (
    etat: EtatDuFormulaire,
    donnees: FormData,
  ) => Promise<EtatDuFormulaire>;
  /** Nombre de stationnements qui empêchent le retrait, zéro si aucun. */
  retenu: number;
}) {
  const [etat, envoyer, enCours] = useActionState(action, FORMULAIRE_VIERGE);

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      {retenu > 0 ? (
        <div className="encart">
          <p>
            <strong>
              Cet emplacement ne peut pas être retiré pour l’instant.
            </strong>{' '}
            {retenu} stationnement{retenu > 1 ? 's' : ''} y{' '}
            {retenu > 1 ? 'sont' : 'est'} en cours ou en attente de réponse.
            Mettez-le en pause : il disparaît de la carte, ne reçoit plus de
            demande, et laisse vivre ce qui est déjà convenu.
          </p>
        </div>
      ) : null}

      <div className="champ">
        <div className="case">
          <input
            type="checkbox"
            id="confirmation"
            name="confirmation"
            value="oui"
            disabled={retenu > 0}
            aria-invalid={erreurs.confirmation ? true : undefined}
            aria-describedby={
              erreurs.confirmation ? 'confirmation-erreur' : undefined
            }
          />
          <label htmlFor="confirmation">
            Je comprends que les stationnements passés de cet emplacement seront
            effacés avec lui.
          </label>
        </div>
        {erreurs.confirmation ? (
          <span id="confirmation-erreur" className="champ__erreur">
            {erreurs.confirmation}
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        className="bouton bouton--discret"
        disabled={enCours || retenu > 0}
      >
        {enCours ? 'Retrait…' : 'Retirer définitivement'}
      </button>
    </form>
  );
}
