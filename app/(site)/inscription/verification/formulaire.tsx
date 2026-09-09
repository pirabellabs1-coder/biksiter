'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';
import { TYPES_ACCEPTES } from '@/lib/regles/pieces';

import { deposerLaPieceDidentite } from './actions';

export default function FormulaireDePiece() {
  const [etat, envoyer, enCours] = useActionState(
    deposerLaPieceDidentite,
    FORMULAIRE_VIERGE,
  );

  const erreur = etat.statut === 'erreur' ? etat.erreurs.piece : undefined;

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <div className="champ">
        <label htmlFor="piece">Votre pièce d’identité</label>
        <span id="piece-aide" className="champ__aide">
          Une photo lisible du recto suffit : carte d’identité, permis de
          conduire ou passeport. Vous pouvez masquer votre numéro de registre
          national — nous ne le lisons pas et ne le conservons pas.
        </span>
        <input
          id="piece"
          name="piece"
          type="file"
          accept={TYPES_ACCEPTES.join(',')}
          required
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? 'piece-aide piece-erreur' : 'piece-aide'}
        />
        {erreur ? (
          <span id="piece-erreur" className="champ__erreur">
            {erreur}
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Envoi…' : 'Envoyer ma pièce'}
      </button>
    </form>
  );
}
