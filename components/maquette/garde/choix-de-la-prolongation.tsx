'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { SANS_ERREUR, type ActionDeFormulaire } from './types';

export type CreneauDeProlongation = {
  /** La valeur du choix : le jour et l'heure réunis. */
  valeur: string;
  jour: string;
  heure: string;
  libelle: string;
};

const MOTIFS = [
  'Je risque d’être en retard',
  'Mon rendez-vous s’est prolongé',
  'J’ai besoin de plus de temps',
  'Autre raison',
];

/**
 * La demande de prolongation.
 *
 * La maquette remplissait le menu des heures en JavaScript, d'heure en heure
 * après l'horaire convenu ; les créneaux sont désormais calculés au rendu, à
 * partir de la vraie fin de garde. Le jour et l'heure voyagent séparément
 * parce que c'est ce qu'attend l'action.
 */
export function ChoixDeLaProlongation({
  action,
  creneaux,
  prenom,
  heureConvenue,
  retour,
}: {
  action: ActionDeFormulaire;
  creneaux: readonly CreneauDeProlongation[];
  prenom: string;
  heureConvenue: string;
  retour: string;
}) {
  const [etat, envoyer, enCours] = useActionState(action, SANS_ERREUR);
  const [choisi, setChoisi] = useState(creneaux[0]?.valeur ?? '');
  const creneau = creneaux.find((c) => c.valeur === choisi) ?? creneaux[0];

  return (
    <form action={envoyer}>
      <div className="champs">
        <label>
          <span>Nouvelle heure de retrait</span>
          <select
            value={choisi}
            onChange={(e) => setChoisi(e.currentTarget.value)}
          >
            {creneaux.map((c) => (
              <option key={c.valeur} value={c.valeur}>
                {c.libelle}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Motif (facultatif)</span>
          {/* Facultatif pour de vrai : rien n'est choisi d'avance. */}
          <select name="motif" defaultValue="">
            <option value="">Sans motif</option>
            {MOTIFS.map((motif) => (
              <option key={motif}>{motif}</option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="jour" value={creneau?.jour ?? ''} />
      <input type="hidden" name="heure" value={creneau?.heure ?? ''} />

      <div
        className="bs-alerte"
        style={{
          background: 'rgba(1,118,40,.05)',
          borderColor: 'rgba(1,118,40,.18)',
        }}
      >
        <b style={{ color: 'var(--ink)' }}>{prenom} doit accepter</b>
        <p style={{ color: 'var(--muted)' }}>
          Tant qu’il n’a pas répondu, l’horaire convenu reste celui de{' '}
          {heureConvenue}. S’il refuse, vous repassez à l’heure prévue.
        </p>
      </div>

      {etat.erreur ? (
        <div className="bs-alerte" role="alert">
          <b>La demande n’a pas pu être envoyée</b>
          <p>{etat.erreur}</p>
        </div>
      ) : null}

      <div className="deux-boutons">
        <button type="submit" className="primary" disabled={enCours}>
          {enCours ? 'Envoi…' : 'Envoyer la demande'}
        </button>
        <Link className="outline" href={retour}>
          Ne pas prolonger
        </Link>
      </div>
    </form>
  );
}
