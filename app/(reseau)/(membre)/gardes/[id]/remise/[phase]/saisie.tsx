'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';

import { Icone } from '@/components/app/icone';
import type { Phase } from '@/lib/regles/garde';
import { CHIFFRES_DU_CODE_DE_REMISE } from '@/lib/regles/remise';

import { confirmerLaRemise, type EtatDUneAction } from '../../actions';

const VIDE: EtatDUneAction = { erreur: null };

/**
 * L'écran de celui qui montre le code se met à jour tout seul : dès que
 * l'autre a saisi le code, il passe à la suite sans qu'on ait à recharger.
 */
export function Rafraichir({ secondes }: { secondes: number }) {
  const routeur = useRouter();
  useEffect(() => {
    const minuterie = window.setInterval(
      () => routeur.refresh(),
      secondes * 1000,
    );
    return () => window.clearInterval(minuterie);
  }, [routeur, secondes]);
  return null;
}

export function SaisieDuCode({
  id,
  phase,
  reserve,
  textes,
}: {
  id: string;
  phase: Phase;
  /** Au dépôt, le bike sitter peut noter ce que les photos ne montrent pas. */
  reserve: { libelle: string; exemple: string; longueur: number } | null;
  textes: {
    explication: string;
    libelle: string;
    essais: string | null;
    conseil: string;
    confirmer: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(
    confirmerLaRemise.bind(null, id, phase),
    VIDE,
  );
  const [saisie, setSaisie] = useState('');
  // Tenue ici : un code refusé ne doit pas effacer la remarque déjà écrite.
  const [remarque, setRemarque] = useState('');
  const [focus, setFocus] = useState(false);
  const champ = useRef<HTMLInputElement>(null);

  // Un code refusé ne se corrige pas chiffre par chiffre : on le retape en
  // entier, souvent un nouveau code dicté par l'autre personne.
  useEffect(() => {
    if (!etat.erreur) return;
    setSaisie('');
    champ.current?.focus();
  }, [etat]);

  return (
    <form action={envoyer} className="pile">
      <div className="encart">
        <Icone nom="info" taille={22} />
        <span>{textes.explication}</span>
      </div>

      {reserve ? (
        <label className="champ-texte">
          <span>{reserve.libelle}</span>
          <textarea
            name="reserve"
            maxLength={reserve.longueur}
            placeholder={reserve.exemple}
            value={remarque}
            onChange={(e) => setRemarque(e.currentTarget.value)}
          />
        </label>
      ) : null}

      <div className="carte carte-code">
        <label htmlFor="code-remise" className="carte-code-titre">
          <Icone nom="cadenas" taille={20} />
          {textes.libelle}
        </label>
        {/* Six cases pour lire, un seul vrai champ pour écrire : le clavier
            numérique, le collage et la saisie automatique marchent tels quels. */}
        <div className="cases-code" onClick={() => champ.current?.focus()}>
          {Array.from({ length: CHIFFRES_DU_CODE_DE_REMISE }, (_, rang) => (
            <span
              key={rang}
              className={
                focus && rang === Math.min(saisie.length, CHIFFRES_DU_CODE_DE_REMISE - 1)
                  ? 'case active'
                  : 'case'
              }
              aria-hidden="true"
            >
              {saisie[rang] ?? ''}
            </span>
          ))}
          <input
            ref={champ}
            id="code-remise"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CHIFFRES_DU_CODE_DE_REMISE}
            value={saisie}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={(e) =>
              setSaisie(
                e.currentTarget.value
                  .replace(/\D/g, '')
                  .slice(0, CHIFFRES_DU_CODE_DE_REMISE),
              )
            }
            aria-invalid={etat.erreur ? true : undefined}
            aria-describedby={etat.erreur ? 'erreur-remise' : undefined}
            className="champ-code-invisible"
          />
        </div>
      </div>

      {etat.erreur ? (
        <div id="erreur-remise" className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}
      {textes.essais ? (
        <div className="encart ambre">
          <Icone nom="alerte" taille={22} />
          <span>{textes.essais}</span>
        </div>
      ) : null}
      <p className="petit texte-doux">{textes.conseil}</p>

      <button
        type="submit"
        className="bouton plein"
        disabled={enCours || saisie.length !== CHIFFRES_DU_CODE_DE_REMISE}
      >
        {enCours ? textes.envoi : textes.confirmer}
      </button>
    </form>
  );
}
