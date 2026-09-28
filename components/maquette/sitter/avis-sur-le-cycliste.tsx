'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

type Etat = { erreur: string | null };

/**
 * L'avis du bike sitter sur le cycliste, après une garde menée à son terme.
 *
 * La note se choisit d'un clic sur les étoiles ; une étiquette cochée dit que
 * ce point s'est bien passé, et vaut cinq sur cinq pour ce critère.
 */
export function AvisSurLeCycliste({
  action,
  criteres,
  retour,
}: {
  action: (etat: Etat, donnees: FormData) => Promise<Etat>;
  criteres: readonly string[];
  retour: string;
}) {
  const [etat, soumettre, enCours] = useActionState(action, { erreur: null });
  const [note, setNote] = useState(0);
  const [choisis, setChoisis] = useState<readonly string[]>([]);

  const basculer = (critere: string) =>
    setChoisis((liste) =>
      liste.includes(critere)
        ? liste.filter((autre) => autre !== critere)
        : [...liste, critere],
    );

  return (
    <form action={soumettre}>
      <section className="bloc">
        <h2>Votre note</h2>
        <div className="etoiles" role="group" aria-label="Note">
          {[1, 2, 3, 4, 5].map((valeur) => (
            <button
              type="button"
              key={valeur}
              className={valeur <= note ? 'on' : undefined}
              aria-pressed={valeur <= note}
              aria-label={valeur === 1 ? '1 étoile' : `${valeur} étoiles`}
              onClick={() => setNote(valeur)}
            >
              ★
            </button>
          ))}
        </div>
        <p className="prog-note" aria-live="polite">
          {note === 0
            ? 'Choisissez une note de une à cinq étoiles.'
            : `Note choisie : ${note} sur 5.`}
        </p>
        <input type="hidden" name="note" value={note} />

        <h3 className="sous-titre">Ce qui s’est bien passé</h3>
        <div className="etiquettes">
          {criteres.map((critere) => {
            const choisi = choisis.includes(critere);
            return (
              <button
                type="button"
                key={critere}
                className={choisi ? 'etiquette on' : 'etiquette'}
                aria-pressed={choisi}
                onClick={() => basculer(critere)}
              >
                {critere}
              </button>
            );
          })}
        </div>
        {choisis.map((critere) => (
          <input key={critere} type="hidden" name={`critere:${critere}`} value="5" />
        ))}

        <label className="champ">
          <span>Un mot, si vous voulez</span>
          <textarea
            rows={3}
            name="texte"
            maxLength={1000}
            placeholder="Ce que le prochain Bike Sitter gagnerait à savoir."
          />
        </label>
      </section>

      <section className="bloc">
        <h2>Ce que votre avis devient</h2>
        <ul className="liste-nette">
          <li>
            <b>Il apparaît sur le profil du cycliste</b>, visible des seuls
            Bike Sitters qu’il contacte.
          </li>
          <li>
            <b>Signé de votre prénom</b>, comme le sien l’est du vôtre.
          </li>
          <li>
            <b>Publié quand l’autre a noté</b>, ou au bout de sept jours.
          </li>
        </ul>
      </section>

      {etat.erreur ? (
        <p className="bs-alerte" role="alert">
          <b>À revoir</b>
          {etat.erreur}
        </p>
      ) : null}

      <div className="actions-fin">
        <button
          type="submit"
          className="bleu"
          data-action="avis-bs"
          disabled={enCours || note === 0}
        >
          {enCours ? 'Envoi…' : 'Envoyer mon avis'}
        </button>
        <Link className="outline" href={retour}>
          Noter plus tard
        </Link>
      </div>
    </form>
  );
}
