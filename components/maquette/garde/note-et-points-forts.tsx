'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { SANS_ERREUR, type ActionDeFormulaire } from './types';

const NOTES = [1, 2, 3, 4, 5];
const LONGUEUR_MAXIMALE = 400;

/**
 * L'avis après une garde : une note, ce qui s'est bien passé, un mot.
 *
 * Les étoiles et les pastilles sont de vrais boutons : elles s'atteignent au
 * clavier et disent leur état par `aria-pressed`, là où la maquette se
 * contentait d'une classe. La note voyage dans un champ caché, chaque
 * pastille allumée vaut cinq sur son critère.
 */
export function NoteEtPointsForts({
  action,
  criteres,
  retour,
}: {
  action: ActionDeFormulaire;
  /** Les critères permis pour ce sens d'avis. */
  criteres: readonly string[];
  retour: string;
}) {
  const [etat, envoyer, enCours] = useActionState(action, SANS_ERREUR);
  const [note, setNote] = useState(0);
  const [allumes, setAllumes] = useState<readonly string[]>([]);
  const [texte, setTexte] = useState('');

  return (
    <form action={envoyer}>
      <h2 className="prog-titre" id="titre-note">
        Votre note
      </h2>
      <div className="etoiles" role="group" aria-labelledby="titre-note">
        {NOTES.map((n) => (
          <button
            key={n}
            type="button"
            className={n <= note ? 'on' : undefined}
            aria-label={`${n} sur 5`}
            aria-pressed={n === note}
            onClick={() => setNote(n)}
          >
            <span aria-hidden="true">★</span>
          </button>
        ))}
      </div>
      <input type="hidden" name="note" value={note || ''} />

      <h2 className="prog-titre" id="titre-points-forts">
        Ce qui s’est bien passé
      </h2>
      <div className="pastilles" role="group" aria-labelledby="titre-points-forts">
        {criteres.map((critere) => {
          const allume = allumes.includes(critere);
          return (
            <button
              key={critere}
              type="button"
              className={allume ? 'pf on' : 'pf'}
              aria-pressed={allume}
              onClick={() =>
                setAllumes((choisis) =>
                  allume
                    ? choisis.filter((c) => c !== critere)
                    : [...choisis, critere],
                )
              }
            >
              {critere}
            </button>
          );
        })}
      </div>
      {allumes.map((critere) => (
        <input key={critere} type="hidden" name={`critere:${critere}`} value="5" />
      ))}

      <h2 className="prog-titre" id="titre-avis">
        Votre avis
      </h2>
      <textarea
        aria-labelledby="titre-avis"
        name="texte"
        className="zone-texte"
        maxLength={LONGUEUR_MAXIMALE}
        placeholder="Ce que vous voulez dire aux prochains cyclistes. Facultatif."
        value={texte}
        onChange={(e) => setTexte(e.currentTarget.value)}
      />
      <p className="prog-note">
        Votre avis est public et signé de votre prénom. Il ne doit contenir ni
        adresse, ni numéro de téléphone.
      </p>

      {etat.erreur ? (
        <p className="prog-note" role="alert">
          {etat.erreur}
        </p>
      ) : null}

      <div className="deux-boutons">
        <button
          type="submit"
          className="primary"
          disabled={enCours || note === 0}
        >
          {enCours ? 'Envoi…' : 'Publier mon avis'}
        </button>
        <Link className="outline" href={retour}>
          Passer cette étape
        </Link>
      </div>
      {note === 0 ? (
        <p className="prog-note">
          Une note générale ouvre la publication de l’avis.
        </p>
      ) : null}
    </form>
  );
}
