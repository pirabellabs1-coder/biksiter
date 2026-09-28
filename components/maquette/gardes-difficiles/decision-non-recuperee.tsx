'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { SANS_ERREUR, type ActionDeFormulaire } from '../garde/types';

/**
 * Ce que le bike sitter peut encore faire. Sa réponse part avec le
 * signalement : le modérateur sait ainsi jusqu'à quand le vélo peut rester.
 */
const DECISIONS: readonly { valeur: string; detail: string }[] = [
  {
    valeur: 'Je peux garder le vélo cette nuit',
    detail: 'Le modérateur organise la reprise pour demain',
  },
  {
    valeur: 'Quelqu’un chez moi peut rendre le vélo',
    detail: 'Une autre personne du foyer pourra ouvrir',
  },
  {
    valeur: 'Je ne peux pas le garder plus longtemps',
    detail: 'Le modérateur cherche une solution en priorité',
  },
];

/**
 * La décision du bike sitter quand le vélo n'est pas repris : elle ouvre un
 * signalement, que la modération suit jusqu'à la reprise du vélo.
 */
export function DecisionNonRecuperee({
  action,
  prenom,
  conversation,
}: {
  action: ActionDeFormulaire;
  prenom: string;
  conversation: string;
}) {
  const [etat, envoyer, enCours] = useActionState(action, SANS_ERREUR);
  const [choisie, setChoisie] = useState('');

  return (
    <form action={envoyer}>
      <section className="bloc">
        <h2 id="titre-decisions">Ce que vous pouvez faire</h2>
        <div className="motifs" role="group" aria-labelledby="titre-decisions">
          {DECISIONS.map((decision) => (
            <button
              key={decision.valeur}
              type="button"
              className={choisie === decision.valeur ? 'motif on' : 'motif'}
              aria-pressed={choisie === decision.valeur}
              onClick={() => setChoisie(decision.valeur)}
            >
              <b>{decision.valeur}</b>
              <span>{decision.detail}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="motif" value={choisie} />
        <p className="mention">
          Vous n’avez pas à déplacer le vélo ni à le laisser dehors : il reste
          sous la responsabilité de son propriétaire.
        </p>

        {etat.erreur ? (
          <p className="prog-note" role="alert">
            {etat.erreur}
          </p>
        ) : null}

        <div className="actions-fin">
          <button
            type="submit"
            className="primary"
            disabled={enCours || choisie === ''}
          >
            {enCours ? 'Envoi…' : 'Prévenir un modérateur'}
          </button>
          <Link className="outline" href={conversation}>
            Écrire à {prenom}
          </Link>
        </div>
        {choisie === '' ? (
          <p className="prog-note">
            Choisissez ce que vous pouvez faire : le modérateur s’organise en
            conséquence.
          </p>
        ) : null}
      </section>
    </form>
  );
}
