'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';

import { deciderDeLIdentite } from '../../actions';

/**
 * Deux boutons dans un seul formulaire : le motif est saisi avant de trancher,
 * et c'est le bouton cliqué qui porte la décision. Cela évite d'avoir à
 * dévoiler puis masquer un champ selon le choix — un modérateur qui écrit un
 * motif puis clique « vérifier » n'a rien cassé.
 */
export default function FormulaireDeDecision({
  membreId,
  prenom,
}: {
  membreId: string;
  prenom: string;
}) {
  const [etat, envoyer, enCours] = useActionState(
    deciderDeLIdentite,
    FORMULAIRE_VIERGE,
  );

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};
  const traite = etat.statut === 'valide';

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <input type="hidden" name="membre" value={membreId} />

      <div className="champ">
        <label htmlFor="motif">Motif</label>
        <span id="motif-aide" className="champ__aide">
          Obligatoire en cas de refus : ce message est envoyé tel quel à{' '}
          {prenom}. Indiquez ce qui lui permettra d’envoyer une pièce valide,
          par exemple « la photo est floue » ou « le nom ne correspond pas à
          celui du compte ».
        </span>
        <textarea
          id="motif"
          name="motif"
          disabled={traite}
          aria-invalid={erreurs.motif ? true : undefined}
          aria-describedby={
            erreurs.motif ? 'motif-aide motif-erreur' : 'motif-aide'
          }
        />
        {erreurs.motif ? (
          <span id="motif-erreur" className="champ__erreur">
            {erreurs.motif}
          </span>
        ) : null}
      </div>

      <div className="boutons">
        <button
          type="submit"
          name="decision"
          value="verifiee"
          className="bouton bouton--principal"
          disabled={enCours || traite}
        >
          Vérifier l’identité
        </button>
        <button
          type="submit"
          name="decision"
          value="refusee"
          className="bouton bouton--discret"
          disabled={enCours || traite}
        >
          Refuser, avec le motif
        </button>
      </div>
    </form>
  );
}
