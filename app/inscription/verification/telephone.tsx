'use client';

import { useActionState } from 'react';

import { ChampTexte } from '@/components/champs';
import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';
import { CHIFFRES_DU_CODE } from '@/lib/regles/telephone';

import { confirmerLeCodeSms, demanderUnCodeSms } from './actions';

/**
 * Deux formulaires côte à côte plutôt qu'un assistant en plusieurs écrans :
 * quelqu'un dont le SMS n'arrive pas doit pouvoir redemander un code sans
 * repartir du début, et quelqu'un qui a déjà le code n'a pas à ressaisir son
 * numéro.
 */
export default function VerificationDuTelephone({
  numeroConnu,
  codeEnAttente,
}: {
  numeroConnu: string | null;
  codeEnAttente: boolean;
}) {
  const [etatDuNumero, envoyerLeNumero, numeroEnCours] = useActionState(
    demanderUnCodeSms,
    FORMULAIRE_VIERGE,
  );
  const [etatDuCode, envoyerLeCode, codeEnCours] = useActionState(
    confirmerLeCodeSms,
    FORMULAIRE_VIERGE,
  );

  const erreurDuNumero =
    etatDuNumero.statut === 'erreur' ? etatDuNumero.erreurs.telephone : undefined;
  const erreurDuCode =
    etatDuCode.statut === 'erreur' ? etatDuCode.erreurs.code : undefined;

  const codeAttendu = codeEnAttente || etatDuNumero.statut === 'valide';

  return (
    <>
      <form action={envoyerLeNumero} noValidate>
        <MessageDeFormulaire etat={etatDuNumero} />

        <ChampTexte
          id="telephone"
          label="Votre numéro de mobile"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          defaultValue={numeroConnu ?? ''}
          placeholder="0470 12 34 56"
          aide="Un mobile belge. Il ne sert qu’à cette vérification : les rappels de stationnement passent par courriel."
          erreur={erreurDuNumero}
        />

        <button
          type="submit"
          className="bouton bouton--discret"
          disabled={numeroEnCours}
        >
          {numeroEnCours
            ? 'Envoi…'
            : codeAttendu
              ? 'Renvoyer un code'
              : 'Recevoir un code par SMS'}
        </button>
      </form>

      {codeAttendu ? (
        <form action={envoyerLeCode} noValidate className="formulaire--suite">
          <MessageDeFormulaire etat={etatDuCode} />

          <div className="champ">
            <label htmlFor="code">Le code reçu par SMS</label>
            <span id="code-aide" className="champ__aide">
              {CHIFFRES_DU_CODE} chiffres, valables dix minutes.
            </span>
            <input
              id="code"
              name="code"
              className="saisie-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern={`[0-9]{${CHIFFRES_DU_CODE}}`}
              maxLength={CHIFFRES_DU_CODE}
              aria-invalid={erreurDuCode ? true : undefined}
              aria-describedby={
                erreurDuCode ? 'code-aide code-erreur' : 'code-aide'
              }
            />
            {erreurDuCode ? (
              <span id="code-erreur" className="champ__erreur">
                {erreurDuCode}
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            className="bouton bouton--principal"
            disabled={codeEnCours}
          >
            {codeEnCours ? 'Vérification…' : 'Vérifier mon numéro'}
          </button>
        </form>
      ) : null}
    </>
  );
}
