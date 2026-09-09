import {
  HEURE_DE_FERMETURE,
  HEURE_DOUVERTURE,
  friseDuJour,
  heureDuSegment,
  partDuSegment,
  resteDeLaPlace,
} from '@/lib/regles/disponibilite';
import type { Creneau } from '@/lib/regles/capacite';

/**
 * La frise remplace une liste de boutons horaires : quinze heures en une
 * bande, et on voit d'un coup s'il reste de la place cet après-midi.
 *
 * Le vert dit « libre » et le gris « pris ». C'est le seul endroit du produit
 * où le vert ne dit pas « vérifié » — et c'est assumé : sur une frise
 * horaire, un créneau vert ne peut vouloir dire qu'une chose. Le texte sous la
 * bande le nomme quand même, pour qui ne distingue pas les deux teintes.
 */
export default function FriseDeDisponibilite({
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

  const resume = libre
    ? segments
        .filter((segment) => segment.libre)
        .map(
          (segment) =>
            `de ${heureDuSegment(segment.debutEnMinutes)} à ${heureDuSegment(segment.finEnMinutes)}`,
        )
        .join(', ')
    : 'aucun créneau libre aujourd’hui';

  return (
    <div className="frise">
      <p className="frise__titre">Disponibilité aujourd’hui</p>

      <div
        className="frise__bande"
        role="img"
        aria-label={`Disponibilité de ${HEURE_DOUVERTURE} h à ${HEURE_DE_FERMETURE} h : ${resume}.`}
      >
        {segments.map((segment) => (
          <span
            key={segment.debutEnMinutes}
            className={
              segment.libre ? 'frise__part frise__part--libre' : 'frise__part'
            }
            style={{ flexGrow: partDuSegment(segment) }}
          />
        ))}
      </div>

      <div className="frise__heures" aria-hidden="true">
        <span>{heureDuSegment(0)}</span>
        <span>{heureDuSegment(4 * 60)}</span>
        <span>{heureDuSegment(8 * 60)}</span>
        <span>{heureDuSegment(11 * 60)}</span>
        <span>
          {heureDuSegment((HEURE_DE_FERMETURE - HEURE_DOUVERTURE) * 60)}
        </span>
      </div>

      <p className="frise__legende">
        <span className="frise__puce frise__puce--libre" aria-hidden="true" />
        Libre
        <span className="frise__puce" aria-hidden="true" />
        Déjà pris
      </p>
    </div>
  );
}
