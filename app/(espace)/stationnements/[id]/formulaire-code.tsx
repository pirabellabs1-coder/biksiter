'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';

import { saisirLeCode } from './actions';

export default function FormulaireDuCode({
  stationnement,
  quiRemet,
}: {
  stationnement: string;
  quiRemet: string;
}) {
  const [etat, envoyer, enCours] = useActionState(
    saisirLeCode,
    FORMULAIRE_VIERGE,
  );

  const erreur = etat.statut === 'erreur' ? etat.erreurs.code : undefined;

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <input type="hidden" name="stationnement" value={stationnement} />

      <div className="champ">
        <label htmlFor="code">Le code que {quiRemet} vous dicte</label>
        <span id="code-aide" className="champ__aide">
          Quatre chiffres. Il se dit à voix haute — pas besoin de réseau ni
          d’enlever ses gants.
        </span>
        <input
          id="code"
          name="code"
          className="saisie-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{4}"
          maxLength={4}
          placeholder="••••"
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? 'code-aide code-erreur' : 'code-aide'}
        />
        {erreur ? (
          <span id="code-erreur" className="champ__erreur">
            {erreur}
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Vérification…' : 'Valider le code'}
      </button>
    </form>
  );
}
