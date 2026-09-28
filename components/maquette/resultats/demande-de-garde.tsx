'use client';

import { useState } from 'react';

/**
 * Le volet « Demander une garde » de la fiche.
 *
 * Il ne réserve rien : il prépare la demande, que le bike sitter reste libre
 * d'accepter. Le formulaire part en GET vers l'écran de demande, si bien qu'un
 * créneau se partage et revient tel quel avec le bouton précédent.
 */
export function DemandeDeGarde({
  reference,
  lieu,
  jours,
  heures,
  creneau,
  velosAcceptes,
  tousLesVelos,
  monVelo,
}: {
  reference: string;
  lieu: string;
  jours: readonly { valeur: string; libelle: string }[];
  heures: readonly string[];
  creneau: { jour: string; de: string; a: string };
  velosAcceptes: readonly string[];
  tousLesVelos: readonly string[];
  monVelo: string | null;
}) {
  const [jour, setJour] = useState(creneau.jour);
  const [debut, setDebut] = useState(creneau.de);
  const [fin, setFin] = useState(creneau.a);
  const accepte = (velo: string) => velosAcceptes.includes(velo);

  return (
    <div className="carte-cote">
      <h2>Demander une garde</h2>
      <p className="gris petite">Choisissez votre créneau.</p>
      <form action={`/demande/${reference}`} method="get">
        <input type="hidden" name="lieu" value={lieu} />
        <input type="hidden" name="jourFin" value={jour} />
        <div className="cc-grille" id="choixCreneau">
          <label className="champ">
            <span>Date</span>
            <select
              id="ccDate"
              name="jour"
              value={jour}
              onChange={(e) => setJour(e.target.value)}
            >
              {jours.map((j) => (
                <option key={j.valeur} value={j.valeur}>
                  {j.libelle}
                </option>
              ))}
            </select>
          </label>
          <div className="deux">
            <label className="champ">
              <span>Vous déposez</span>
              <select
                id="ccDebut"
                name="de"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
              >
                {heures.map((heure) => (
                  <option key={heure} value={heure}>
                    {heure.replace(':', 'h')}
                  </option>
                ))}
              </select>
            </label>
            <label className="champ">
              <span>Vous reprenez</span>
              <select
                id="ccFin"
                name="a"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
              >
                {heures.map((heure) => (
                  <option key={heure} value={heure}>
                    {heure.replace(':', 'h')}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <p className="note-contrib">
          La garde est gratuite, comme toutes les gardes du réseau.
        </p>
        <label className="champ">
          <span>Type de vélo</span>
          <select id="requestBike" name="velo" aria-label="Vélo à confier">
            {tousLesVelos.map((velo) => {
              const ok = accepte(velo);
              const mien = monVelo !== null && monVelo === velo;
              return (
                <option key={velo} value={velo} disabled={!ok}>
                  {velo}
                  {mien ? ' (le mien)' : ''}
                  {ok ? '' : ' — non accepté'}
                </option>
              );
            })}
          </select>
        </label>
        <label className="fc-case groupee">
          <input
            type="checkbox"
            id="demandeGroupee"
            name="groupee"
            value="oui"
          />
          <span>Envoyer aussi aux deux Bike Sitters les plus proches</span>
        </label>
        <button type="submit" className="bleu" id="requestGuard">
          Demander une garde
        </button>
        {/* Un envoi groupé ne se coche pas d'office : c'est un choix. */}
        <p className="mention">
          À plusieurs, le premier qui accepte prend la garde et les autres
          demandes se ferment aussitôt. Chacun peut répondre jusqu’à l’heure du
          dépôt, au plus tard sous vingt-quatre heures.
        </p>
      </form>
    </div>
  );
}
