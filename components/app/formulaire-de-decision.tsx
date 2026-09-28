'use client';

import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import { Icone } from './icone';

type EtatDUneDecision = { erreur: string | null };

/**
 * Une décision de modération : un choix, un motif, un bouton. Le choix et le
 * motif sont tenus ici, pour qu'un refus du serveur n'efface pas ce qui a été
 * écrit.
 *
 * Aucun choix n'est coché d'avance : une décision se prend, elle ne se
 * valide pas par défaut. Et l'envoi ne passe pas par la réinitialisation
 * automatique du formulaire : après une erreur, React remettait les boutons
 * radio sur leur valeur initiale alors que l'écran affichait encore l'autre
 * choix — un refus pouvait repartir en approbation.
 */
export function FormulaireDeDecision({
  action,
  nomDuChoix = 'decision',
  choix = [],
  champsCaches = {},
  avant,
  confirmation,
  confirmationInutilePour = [],
  danger = false,
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
  /** Les choix pour lesquels cette case n'a pas de sens (la garde continue). */
  confirmationInutilePour?: readonly string[];
  /** Vrai quand l'envoi lui-même est lourd de conséquences (suspendre). */
  danger?: boolean;
  textes: {
    legende?: string;
    motif: string;
    aideDuMotif?: string;
    confirmer: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  const [choisi, setChoisi] = useState(
    choix.length === 1 ? (choix[0]?.[0] ?? '') : '',
  );
  const [motif, setMotif] = useState('');
  const [confirme, setConfirme] = useState(false);
  const lourd =
    danger || (choix.find(([valeur]) => valeur === choisi)?.[3] ?? false);
  const choixAttendu = choix.length > 0 && choisi === '';

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (choixAttendu) return;
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    // `action` reste posé : avant l'hydratation, le formulaire part tout de
    // même vers l'action serveur (jamais en GET, motif dans l'URL).
    <form action={envoyer} onSubmit={soumettre} className="pile">
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

      {confirmation && !confirmationInutilePour.includes(choisi) ? (
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
        disabled={enCours || choixAttendu}
      >
        {enCours ? textes.envoi : textes.confirmer}
      </button>
      {choixAttendu ? (
        <p className="aide-champ">Choisissez d’abord une décision.</p>
      ) : null}
    </form>
  );
}
