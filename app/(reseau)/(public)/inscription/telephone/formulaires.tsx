'use client';

import { useActionState, useRef } from 'react';

import { Icone } from '@/components/app/icone';

import { BORD_EN_ERREUR, EncartDErreurs } from '../../ecran-de-compte';
import {
  confirmerLeCode,
  demanderUnCode,
  type EtatDuCode,
  type EtatDuNumero,
} from './actions';

const NUMERO_VIERGE: EtatDuNumero = { statut: 'vierge' };
const CODE_VIERGE: EtatDuCode = { statut: 'vierge' };

export function FormulaireDuNumero({
  numeroConnu,
  codeDejaEnvoye,
  libelles,
}: {
  numeroConnu: string | null;
  codeDejaEnvoye: boolean;
  libelles: {
    numero: string;
    recevoir: string;
    renvoyer: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(
    demanderUnCode,
    NUMERO_VIERGE,
  );
  const numero = etat.statut === 'vierge' ? (numeroConnu ?? '') : etat.numero;
  const dejaEnvoye = codeDejaEnvoye || etat.statut === 'envoye';

  return (
    <form action={envoyer} noValidate className="pile">
      <label
        className="champ-app"
        style={etat.statut === 'erreur' ? BORD_EN_ERREUR : undefined}
      >
        <Icone nom="telephone" taille={22} />
        <span className="lecteur">{libelles.numero}</span>
        <input
          key={numero}
          name="telephone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+32 470 12 34 56"
          required
          defaultValue={numero}
          aria-invalid={etat.statut === 'erreur' ? true : undefined}
          aria-describedby={
            etat.statut === 'erreur' ? 'erreur-numero' : undefined
          }
        />
      </label>
      {etat.statut === 'erreur' ? (
        <EncartDErreurs id="erreur-numero" erreurs={[etat.erreur]} />
      ) : null}
      {etat.statut === 'envoye' ? (
        <div className="encart" role="status">
          <Icone nom="envoyer" taille={20} />
          <span>{etat.message}</span>
        </div>
      ) : null}
      <button
        type="submit"
        className="bouton contour"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours
          ? libelles.envoi
          : dejaEnvoye
            ? libelles.renvoyer
            : libelles.recevoir}
      </button>
    </form>
  );
}

export function FormulaireDuCode({
  libelles,
}: {
  libelles: {
    code: string;
    chiffre: string;
    aide: string;
    continuer: string;
    verification: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(confirmerLeCode, CODE_VIERGE);
  const invalide = etat.statut === 'erreur';

  return (
    <form action={envoyer} noValidate className="pile">
      <fieldset className="sans-cadre">
        <legend style={{ padding: 0, marginBottom: 8, fontSize: 14, fontWeight: 700 }}>
          {libelles.code}
        </legend>
        <CasesDuCode
          libelle={libelles.chiffre}
          decrit={invalide ? 'aide-code erreur-code' : 'aide-code'}
          invalide={invalide}
        />
        <small id="aide-code" className="aide-champ" style={{ marginTop: 8 }}>
          {libelles.aide}
        </small>
      </fieldset>
      {invalide ? (
        <EncartDErreurs id="erreur-code" erreurs={[etat.erreur]} />
      ) : null}
      <button
        type="submit"
        className="bouton plein"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? libelles.verification : libelles.continuer}
        {enCours ? null : <Icone nom="chevron" taille={20} />}
      </button>
    </form>
  );
}

/**
 * Quatre cases, un chiffre chacune. Taper passe à la case suivante, effacer
 * revient à la précédente, et coller le code entier le répartit : le code
 * arrive par SMS, souvent copié depuis la notification.
 */
function CasesDuCode({
  libelle,
  decrit,
  invalide,
}: {
  libelle: string;
  decrit: string;
  invalide: boolean;
}) {
  const cases = useRef<(HTMLInputElement | null)[]>([]);

  const remplirDepuis = (rang: number, chiffres: string) => {
    chiffres
      .slice(0, 4 - rang)
      .split('')
      .forEach((chiffre, decalage) => {
        const champ = cases.current[rang + decalage];
        if (champ) {
          champ.value = chiffre;
        }
      });
    cases.current[Math.min(rang + chiffres.length, 3)]?.focus();
  };

  return (
    <div
      className="cases-code"
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', maxWidth: 320 }}
    >
      {[0, 1, 2, 3].map((rang) => (
        <input
          key={rang}
          ref={(champ) => {
            cases.current[rang] = champ;
          }}
          name={`c${rang}`}
          className="case"
          inputMode="numeric"
          autoComplete={rang === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]"
          aria-label={`${libelle} ${rang + 1}`}
          aria-invalid={invalide || undefined}
          aria-describedby={decrit}
          style={{
            width: '100%',
            padding: 0,
            textAlign: 'center',
            ...(invalide ? BORD_EN_ERREUR : null),
          }}
          onInput={(evenement) => {
            const champ = evenement.currentTarget;
            const chiffres = champ.value.replace(/[^0-9]/g, '');
            champ.value = '';
            if (chiffres) {
              remplirDepuis(rang, chiffres);
            }
          }}
          onKeyDown={(evenement) => {
            if (
              evenement.key === 'Backspace' &&
              evenement.currentTarget.value === '' &&
              rang > 0
            ) {
              cases.current[rang - 1]?.focus();
            }
          }}
          onPaste={(evenement) => {
            const chiffres = evenement.clipboardData
              .getData('text')
              .replace(/[^0-9]/g, '');
            if (chiffres) {
              evenement.preventDefault();
              remplirDepuis(rang, chiffres);
            }
          }}
        />
      ))}
    </div>
  );
}
