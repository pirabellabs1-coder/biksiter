'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import {
  FORMULAIRE_VIERGE,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { LONGUEUR_MAXIMALE_DU_MESSAGE } from '@/lib/regles/echanges';

export default function Echange({
  action,
  prenomDeLAutre,
}: {
  action: (
    etat: EtatDuFormulaire,
    donnees: FormData,
  ) => Promise<EtatDuFormulaire>;
  prenomDeLAutre: string;
}) {
  const [etat, envoyer, enCours] = useActionState(action, FORMULAIRE_VIERGE);

  const erreur = etat.statut === 'erreur' ? etat.erreurs.corps : undefined;

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <div className="champ">
        <label htmlFor="corps">Écrire à {prenomDeLAutre}</label>
        <span id="corps-aide" className="champ__aide">
          Votre message est envoyé par e-mail. Chacun répond quand il le peut,
          sans délai imposé.
        </span>
        <textarea
          id="corps"
          name="corps"
          maxLength={LONGUEUR_MAXIMALE_DU_MESSAGE}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? 'corps-aide corps-erreur' : 'corps-aide'}
        />
        {erreur ? (
          <span id="corps-erreur" className="champ__erreur">
            {erreur}
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        className="bouton bouton--principal"
        disabled={enCours}
      >
        {enCours ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  );
}
