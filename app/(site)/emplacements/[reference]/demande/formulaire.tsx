'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';
import { TYPES_VELO } from '@/lib/regles/velos';

import { demanderUnStationnement } from './actions';

export default function FormulaireDeDemande({
  reference,
  prenomDuBikeSitter,
}: {
  reference: string;
  prenomDuBikeSitter: string;
}) {
  const [etat, envoyer, enCours] = useActionState(
    demanderUnStationnement,
    FORMULAIRE_VIERGE,
  );

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <input type="hidden" name="reference" value={reference} />

      <div className="duo">
        <div className="champ">
          <label htmlFor="jour">Jour du dépôt</label>
          <input
            id="jour"
            name="jour"
            type="date"
            required
            aria-invalid={erreurs.jour ? true : undefined}
            aria-describedby={erreurs.jour ? 'jour-erreur' : undefined}
          />
          {erreurs.jour ? (
            <span id="jour-erreur" className="champ__erreur">
              {erreurs.jour}
            </span>
          ) : null}
        </div>

        <div className="champ">
          <label htmlFor="velo">Votre vélo</label>
          <select
            id="velo"
            name="velo"
            defaultValue=""
            required
            aria-invalid={erreurs.velo ? true : undefined}
            aria-describedby={erreurs.velo ? 'velo-erreur' : undefined}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {TYPES_VELO.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {erreurs.velo ? (
            <span id="velo-erreur" className="champ__erreur">
              {erreurs.velo}
            </span>
          ) : null}
        </div>
      </div>

      <div className="duo">
        <div className="champ">
          <label htmlFor="arrivee">Heure du dépôt</label>
          <input
            id="arrivee"
            name="arrivee"
            type="time"
            required
            aria-invalid={erreurs.arrivee ? true : undefined}
            aria-describedby={erreurs.arrivee ? 'arrivee-erreur' : undefined}
          />
          {erreurs.arrivee ? (
            <span id="arrivee-erreur" className="champ__erreur">
              {erreurs.arrivee}
            </span>
          ) : null}
        </div>

        <div className="champ">
          <label htmlFor="retour">Heure de la reprise</label>
          <input
            id="retour"
            name="retour"
            type="time"
            required
            aria-invalid={erreurs.retour ? true : undefined}
            aria-describedby={erreurs.retour ? 'retour-erreur' : undefined}
          />
          {erreurs.retour ? (
            <span id="retour-erreur" className="champ__erreur">
              {erreurs.retour}
            </span>
          ) : null}
        </div>
      </div>

      <div className="champ">
        <label htmlFor="message">Un mot pour {prenomDuBikeSitter}</label>
        <span id="message-aide" className="champ__aide">
          Facultatif. Ce qui l’aide à décider : d’où vous venez, pourquoi vous
          passez par là.
        </span>
        <textarea id="message" name="message" aria-describedby="message-aide" />
      </div>

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Envoi…' : 'Envoyer ma demande'}
      </button>
    </form>
  );
}
