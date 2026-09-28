'use client';

import { useActionState, useOptimistic, useTransition } from 'react';

import { Icone } from '@/components/app/icone';

import {
  changerDisponibiliteImmediate,
  type EtatDeLaDisponibilite,
} from '@/app/(reseau)/(membre)/accueil/actions';

const HEURE = new Intl.DateTimeFormat('fr-BE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Brussels',
});

/**
 * « Disponible tout de suite » : un interrupteur qui enregistre dès qu'on le
 * touche. Le serveur fixe l'heure de fin (une heure) ; l'écran la redit, pour
 * que le bike sitter sache jusqu'à quand il apparaît en tête.
 *
 * L'interrupteur bascule à l'instant (mise à jour optimiste), comme sur le
 * téléphone ; si l'enregistrement échoue, il revient à l'état réel. L'envoi
 * ne passe pas par un `<form action>` : React y remettrait la case à son état
 * initial après chaque réponse, et l'interrupteur semblerait ne pas réagir.
 */
export function DisponibleMaintenant({
  jusqua,
  attente,
}: {
  jusqua: string | null;
  /**
   * Hors des horaires d'accueil, pourquoi l'interrupteur attend, et jusqu'à
   * quand ; `null` quand on peut l'allumer maintenant.
   */
  attente: string | null;
}) {
  const [etat, envoyer] = useActionState<EtatDeLaDisponibilite, FormData>(
    changerDisponibiliteImmediate,
    { jusqua, erreur: null },
  );
  const [enCours, demarrer] = useTransition();
  const ouverteReellement =
    etat.jusqua !== null && new Date(etat.jusqua) > new Date();
  const [ouverte, basculerTout] = useOptimistic(
    ouverteReellement,
    (_actuel, voulu: boolean) => voulu,
  );

  function basculer() {
    const voulu = !ouverte;
    const donnees = new FormData();
    donnees.set('ouvrir', voulu ? 'oui' : 'non');
    demarrer(() => {
      basculerTout(voulu);
      envoyer(donnees);
    });
  }

  // Allumé, il peut toujours s'éteindre ; éteint, il n'attend que l'heure.
  const enAttente = !ouverte && attente !== null;
  const detail = etat.erreur
    ? etat.erreur
    : enAttente
      ? attente
      : ouverte
      ? etat.jusqua && ouverteReellement
        ? `Vous apparaissez en tête des résultats jusqu’à ${HEURE.format(new Date(etat.jusqua)).replace(':', 'h')}.`
        : 'Vous apparaissez en tête des résultats pendant une heure.'
      : 'Pendant une heure, vous apparaissez en tête des résultats.';

  return (
    <div className="rangee rangee-interrupteur">
      <span className="rangee-icone" aria-hidden="true">
        <Icone nom="position" taille={18} strokeWidth={2} />
      </span>
      <label className="rangee-texte" htmlFor="dispo-maintenant">
        <strong>Disponible tout de suite</strong>
        <span aria-live="polite">{detail}</span>
      </label>
      <input
        id="dispo-maintenant"
        type="checkbox"
        role="switch"
        checked={ouverte}
        aria-checked={ouverte}
        disabled={enAttente}
        aria-busy={enCours || undefined}
        onChange={basculer}
      />
    </div>
  );
}
