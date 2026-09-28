'use client';

import { useState } from 'react';

import { creneauDansLesBornes } from '@/lib/regles/creneau';

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
  // La garde se reprend le jour même : le créneau venu de la recherche est
  // ramené dans ce que les listes proposent, sinon l'écran afficherait une
  // heure et le formulaire en enverrait une autre (dépôt à la dernière heure,
  // reprise du lendemain — voir lib/regles/heures-proposees.ts).
  const borne = creneauDansLesBornes(
    {
      jourDepot: creneau.jour,
      heureDepot: creneau.de,
      jourReprise: creneau.jour,
      heureReprise: creneau.a,
    },
    { jours: jours.map((j) => j.valeur), heures, joursMaximum: 1 },
  );
  const [jour, setJour] = useState(borne.jourDepot);
  const [debut, setDebut] = useState(borne.heureDepot);
  const [fin, setFin] = useState(borne.heureReprise);
  const accepte = (velo: string) => velosAcceptes.includes(velo);
  // Le vélo du membre d'abord, s'il est accepté ; sinon le premier accepté.
  // Sans valeur choisie, la liste retombait sur « Ville », même pour un VTC.
  const veloPropose =
    monVelo !== null && accepte(monVelo)
      ? monVelo
      : (tousLesVelos.find(accepte) ?? tousLesVelos[0]);
  // La garde se reprend le jour même : la reprise suit toujours le dépôt.
  const heuresDeDepot = heures.slice(0, -1);
  const heuresDeReprise = heures.filter((heure) => heure > debut);
  const changerLeDepot = (valeur: string) => {
    setDebut(valeur);
    if (fin <= valeur) setFin(heures.find((heure) => heure > valeur) ?? fin);
  };

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
                onChange={(e) => changerLeDepot(e.target.value)}
              >
                {heuresDeDepot.map((heure) => (
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
                {heuresDeReprise.map((heure) => (
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
          <select
            id="requestBike"
            name="velo"
            aria-label="Vélo à confier"
            defaultValue={veloPropose}
          >
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
