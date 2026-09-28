'use client';

import Link from 'next/link';
import { useActionState, useState, type ReactNode } from 'react';

import { SANS_ERREUR, type ActionDeFormulaire } from './types';

export type MotifPropose = {
  /** Ce qui est enregistré sur la garde. */
  valeur: string;
  /** La phrase qui explique le motif, sous son titre. */
  detail: string;
};

const LONGUEUR_MAXIMALE = 400;

/**
 * Le choix d'un motif, pour une annulation comme pour un signalement.
 *
 * La maquette marquait le motif choisi par `aria-pressed` : c'est gardé, et
 * le motif voyage dans un champ caché. Rien n'est envoyé tant qu'aucun motif
 * n'est choisi — le bouton le dit plutôt que de laisser partir un formulaire
 * vide.
 */
export function ChoixDuMotif({
  action,
  motifs,
  question,
  libellePrecision,
  exemple,
  confirmer,
  danger,
  retour,
  libelleRetour,
  motifFacultatif = false,
  children,
}: {
  action: ActionDeFormulaire;
  motifs: readonly MotifPropose[];
  question: string;
  libellePrecision: string;
  exemple: string;
  confirmer: string;
  danger: boolean;
  retour: string;
  libelleRetour: string;
  /** Décliner une demande n'exige aucune justification : le motif est libre. */
  motifFacultatif?: boolean;
  /** Ce que la page glisse entre le motif et les boutons. */
  children?: ReactNode;
}) {
  const [etat, envoyer, enCours] = useActionState(action, SANS_ERREUR);
  const [choisi, setChoisi] = useState('');
  const [precision, setPrecision] = useState('');

  return (
    <form action={envoyer}>
      <section className="bloc">
        <h2 id="titre-motifs">{question}</h2>
        <div className="motifs" role="group" aria-labelledby="titre-motifs">
          {motifs.map((motif) => (
            <button
              key={motif.valeur}
              type="button"
              className={choisi === motif.valeur ? 'motif on' : 'motif'}
              aria-pressed={choisi === motif.valeur}
              onClick={() => setChoisi(motif.valeur)}
            >
              <b>{motif.valeur}</b>
              <span>{motif.detail}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="motif" value={choisi} />

        <label className="champ">
          <span>{libellePrecision}</span>
          <textarea
            name="precision"
            rows={3}
            maxLength={LONGUEUR_MAXIMALE}
            placeholder={exemple}
            value={precision}
            onChange={(e) => setPrecision(e.currentTarget.value)}
          />
        </label>
      </section>

      {children}

      {etat.erreur ? (
        <p className="prog-note" role="alert">
          {etat.erreur}
        </p>
      ) : null}

      <div className="actions-fin">
        <button
          type="submit"
          className={danger ? 'danger' : 'primary'}
          disabled={enCours || (!motifFacultatif && choisi === '')}
        >
          {enCours ? 'Envoi…' : confirmer}
        </button>
        <Link className="outline" href={retour}>
          {libelleRetour}
        </Link>
      </div>
      {choisi === '' ? (
        <p className="prog-note">
          {motifFacultatif
            ? 'Le motif est facultatif : vous pouvez décliner sans rien préciser.'
            : 'Choisissez un motif pour continuer.'}
        </p>
      ) : null}
    </form>
  );
}
