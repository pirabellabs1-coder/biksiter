import {
  friseDuJour,
  heureDuSegment,
  resteDeLaPlace,
} from '@/lib/regles/disponibilite';
import { MARGE_ENTRE_STATIONNEMENTS_MINUTES } from '@/lib/regles/capacite';
import type { Creneau } from '@/lib/regles/capacite';

/**
 * Les créneaux de la journée, un par ligne.
 *
 * Une bande horizontale se lisait d'un coup d'œil mais ne se lisait qu'à
 * l'œil : les heures y étaient minuscules, et rien n'y était énonçable à voix
 * haute. Une liste dit la même chose en toutes lettres — « 08h30 à 13h00,
 * complet » — et un lecteur d'écran la restitue telle quelle.
 *
 * Le battement de trente minutes entre deux stationnements est nommé plutôt
 * que subi : sans cette ligne, un créneau qui finit à 13h00 et le suivant qui
 * commence à 13h30 ressemblent à un trou inexpliqué.
 */
export default function CreneauxDuJour({
  jour,
  acceptes,
  capacite,
}: {
  jour: Date;
  acceptes: readonly Creneau[];
  capacite: number;
}) {
  const segments = friseDuJour(jour, acceptes, capacite);
  const libre = resteDeLaPlace(segments);

  return (
    <>
      <ul className="creneaux">
        {segments.map((segment, rang) => {
          const precedent = segments[rang - 1];
          const battement = precedent && precedent.libre !== segment.libre;

          return (
            <li key={segment.debutEnMinutes}>
              {battement ? (
                <p className="creneaux__battement">
                  Battement de {MARGE_ENTRE_STATIONNEMENTS_MINUTES} minutes
                  entre deux vélos, le temps de la passation.
                </p>
              ) : null}

              <div
                className={
                  segment.libre ? 'creneau creneau--libre' : 'creneau'
                }
              >
                <span className="creneau__puce" aria-hidden="true" />
                <span className="creneau__corps">
                  <span className="creneau__heures">
                    {heureDuSegment(segment.debutEnMinutes)} à{' '}
                    {heureDuSegment(segment.finEnMinutes)}
                  </span>
                  <span className="creneau__detail">
                    {segment.libre
                      ? 'Emplacement libre, accueil possible'
                      : `Déjà pris — ${capacite > 1 ? 'la capacité est atteinte' : 'un vélo est attendu'}`}
                  </span>
                </span>
                <span
                  className={
                    segment.libre
                      ? 'pastille pastille--verifie'
                      : 'pastille pastille--neutre'
                  }
                >
                  {segment.libre ? 'Libre' : 'Complet'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {libre ? null : (
        <p className="discret">
          Rien de libre aujourd’hui. Un autre jour, ou un autre emplacement du
          quartier, aura de la place.
        </p>
      )}
    </>
  );
}
