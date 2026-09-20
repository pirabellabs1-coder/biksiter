'use client';

import { useActionState, useState, type ReactNode } from 'react';

import { Icone } from './icone';

type EtatDUneDecision = { erreur: string | null };

/**
 * Une décision de modération : un choix, un motif, un bouton. Le choix et le
 * motif sont tenus ici, pour qu'un refus du serveur n'efface pas ce qui a été
 * écrit.
 */
export function FormulaireDeDecision({
  action,
  nomDuChoix = 'decision',
  choix = [],
  champsCaches = {},
  avant,
  confirmation,
  textes,
}: {
  action: (
    precedent: EtatDUneDecision,
    donnees: FormData,
  ) => Promise<EtatDUneDecision>;
  nomDuChoix?: string;
  /** La valeur, son titre, sa description, et vrai si le choix est lourd de conséquences. */
  choix?: readonly (readonly [string, string, string, boolean])[];
  champsCaches?: Readonly<Record<string, string>>;
  avant?: ReactNode;
  /** Une case à cocher qui engage la personne (« le vélo a été rendu »). */
  confirmation?: string;
  textes: {
    legende?: string;
    motif: string;
    aideDuMotif?: string;
    confirmer: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  const [choisi, setChoisi] = useState(choix[0]?.[0] ?? '');
  const [motif, setMotif] = useState('');
  const [confirme, setConfirme] = useState(false);
  const lourd = choix.find(([valeur]) => valeur === choisi)?.[3] ?? false;

  return (
    <form action={envoyer} className="pile">
      {Object.entries(champsCaches).map(([nom, valeur]) => (
        <input key={nom} type="hidden" name={nom} value={valeur} />
      ))}
      {avant}
      {choix.length > 0 ? (
        <fieldset className="sans-cadre">
          {textes.legende ? (
            <legend className="titre-section">{textes.legende}</legend>
          ) : null}
          <div className="liste" role="radiogroup">
            {choix.map(([valeur, titre, description]) => (
              <label key={valeur} className="ligne">
                <input
                  type="radio"
                  name={nomDuChoix}
                  value={valeur}
                  checked={choisi === valeur}
                  onChange={() => setChoisi(valeur)}
                  className="radio-app"
                />
                <span className="ligne-texte">
                  <strong>{titre}</strong>
                  <span>{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <label className="champ-texte">
        <span>{textes.motif}</span>
        <textarea
          name="motif"
          maxLength={600}
          value={motif}
          onChange={(e) => setMotif(e.currentTarget.value)}
          aria-describedby={textes.aideDuMotif ? 'aide-du-motif' : undefined}
        />
        {textes.aideDuMotif ? (
          <small id="aide-du-motif" className="aide-champ">
            {textes.aideDuMotif}
          </small>
        ) : null}
      </label>

      {confirmation ? (
        <label className="check">
          <input
            type="checkbox"
            name="confirmation"
            value="oui"
            checked={confirme}
            onChange={(e) => setConfirme(e.currentTarget.checked)}
          />
          <span>{confirmation}</span>
        </label>
      ) : null}

      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}

      <button
        type="submit"
        className={lourd ? 'bouton danger' : 'bouton plein'}
        disabled={enCours}
      >
        {enCours ? textes.envoi : textes.confirmer}
      </button>
    </form>
  );
}
