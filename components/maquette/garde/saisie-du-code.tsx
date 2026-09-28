'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';

import { LONGUEUR_D_UNE_RESERVE } from '@/lib/regles/constat';
import { CHIFFRES_DU_CODE_DE_REMISE } from '@/lib/regles/remise';

import { SANS_ERREUR, type ActionDeFormulaire } from './types';

/** « 123456 » s'affiche « 123 456 », comme on le dicte. */
function enDeuxGroupes(chiffres: string): string {
  const moitie = CHIFFRES_DU_CODE_DE_REMISE / 2;
  return chiffres.length > moitie
    ? `${chiffres.slice(0, moitie)} ${chiffres.slice(moitie)}`
    : chiffres;
}

/**
 * La saisie du code, sur l'écran de remise.
 *
 * Règle 5 — celui qui reçoit le vélo saisit le code que l'autre lui dicte.
 * Six chiffres, trois essais, puis un nouveau code : le message d'aide
 * devient rouge et dit quoi faire, il ne se contente pas de refuser.
 */
export function SaisieDuCode({
  action,
  intro,
  aide,
  confirmer,
  lienAvis,
  libelleDuChamp,
  reserve = null,
}: {
  action: ActionDeFormulaire;
  intro: string;
  aide: string;
  confirmer: string;
  /** Ce que dit le lecteur d'écran du champ : code de dépôt ou de récupération. */
  libelleDuChamp: string;
  /**
   * Au dépôt, le bike sitter peut nuancer ce que le cycliste a déclaré (une
   * rayure, un pneu à plat) : la remarque est jointe au constat et le
   * cycliste en est prévenu.
   */
  reserve?: { libelle: string; aide: string } | null;
  /** Proposé seulement quand la garde peut déjà recevoir un avis. */
  lienAvis: string | null;
}) {
  const [etat, envoyer, enCours] = useActionState(action, SANS_ERREUR);
  const [saisie, setSaisie] = useState('');
  // La remarque est tenue ici : un code refusé ne doit pas l'effacer.
  const [remarque, setRemarque] = useState('');
  const champ = useRef<HTMLInputElement>(null);

  // Un code refusé se retape en entier, souvent parce qu'un nouveau vient
  // d'être généré : on vide le champ plutôt que d'y laisser corriger un
  // chiffre.
  useEffect(() => {
    if (!etat.erreur) return;
    setSaisie('');
    champ.current?.focus();
  }, [etat]);

  return (
    <form className="code-box2" action={envoyer}>
      {/* La remarque vient avant le code : on regarde le vélo, on note ce
          qui manque aux photos, puis on confirme la remise. */}
      {reserve ? (
        <label className="champ code-reserve">
          <span>{reserve.libelle}</span>
          <textarea
            name="reserve"
            maxLength={LONGUEUR_D_UNE_RESERVE}
            rows={3}
            aria-describedby="code-reserve-aide"
            value={remarque}
            onChange={(e) => setRemarque(e.currentTarget.value)}
          />
          <small className="aide-champ" id="code-reserve-aide">
            {reserve.aide}
          </small>
        </label>
      ) : null}
      <p className="code-intro">{intro}</p>
      <label className="code-libelle" htmlFor="code-de-remise">
        {libelleDuChamp}
      </label>
      {/* L'aide, et l'erreur qui la remplace, se lisent au-dessus du champ :
          sous le bouton, le clavier du téléphone les cacherait. */}
      <p
        className={etat.erreur ? 'code-aide faux' : 'code-aide'}
        id="code-de-remise-aide"
        role={etat.erreur ? 'alert' : undefined}
      >
        {etat.erreur ?? aide}
      </p>
      <div className="code-row">
        <input
          ref={champ}
          id="code-de-remise"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          // Le code se dicte en deux groupes de trois : il s'écrit de même.
          maxLength={CHIFFRES_DU_CODE_DE_REMISE + 1}
          placeholder="000 000"
          aria-invalid={etat.erreur ? true : undefined}
          aria-describedby="code-de-remise-aide"
          value={enDeuxGroupes(saisie)}
          onChange={(e) =>
            setSaisie(
              e.currentTarget.value
                .replace(/\D/g, '')
                .slice(0, CHIFFRES_DU_CODE_DE_REMISE),
            )
          }
        />
        <button
          type="submit"
          className="primary"
          disabled={enCours || saisie.length !== CHIFFRES_DU_CODE_DE_REMISE}
        >
          {enCours ? 'Vérification…' : confirmer}
        </button>
        {lienAvis ? (
          <Link className="outline" href={lienAvis}>
            Laisser un avis
          </Link>
        ) : null}
      </div>
    </form>
  );
}
