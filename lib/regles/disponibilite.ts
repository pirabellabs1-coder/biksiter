import { seChevauchent, type Creneau } from './capacite';

/**
 * La frise de disponibilité.
 *
 * Elle remplace une liste de boutons horaires : quinze heures de journée en
 * une bande, et on voit en une seconde s'il reste de la place cet après-midi.
 *
 * Ce qu'elle ne montre pas, et qu'il ne faut pas y ajouter : qui occupe la
 * place, ni pour quel vélo, ni jusqu'à quand précisément. Un cycliste n'a
 * besoin de savoir que « libre » ou « pris » — le reste dirait aux passants
 * quand le bike sitter reçoit du monde chez lui.
 */

/** La journée utile : avant sept heures et après vingt-deux, personne ne dépose. */
export const HEURE_DOUVERTURE = 7;
export const HEURE_DE_FERMETURE = 22;

/** Une demi-heure : assez fin pour être juste, assez gros pour rester lisible. */
export const PAS_EN_MINUTES = 30;

export type Segment = {
  debutEnMinutes: number;
  finEnMinutes: number;
  libre: boolean;
};

/**
 * Découpe la journée en segments libres et pris, puis fusionne les voisins qui
 * se ressemblent — une bande de trente traits identiques ne se lit pas.
 */
export function friseDuJour(
  jour: Date,
  acceptes: readonly Creneau[],
  capacite: number,
): Segment[] {
  const totalEnMinutes = (HEURE_DE_FERMETURE - HEURE_DOUVERTURE) * 60;
  const segments: Segment[] = [];

  for (let debut = 0; debut < totalEnMinutes; debut += PAS_EN_MINUTES) {
    const fin = debut + PAS_EN_MINUTES;

    const tranche: Creneau = {
      debut: instantDe(jour, debut),
      fin: instantDe(jour, fin),
    };

    // La marge entre stationnements compte : une place reprise à midi n'est
    // pas libre à midi cinq.
    const occupees = acceptes.filter((accepte) =>
      seChevauchent(accepte, tranche),
    ).length;

    const libre = occupees < capacite;
    const precedent = segments[segments.length - 1];

    if (precedent && precedent.libre === libre) {
      precedent.finEnMinutes = fin;
    } else {
      segments.push({ debutEnMinutes: debut, finEnMinutes: fin, libre });
    }
  }

  return segments;
}

function instantDe(jour: Date, minutesApresOuverture: number): Date {
  const instant = new Date(jour);
  instant.setHours(HEURE_DOUVERTURE, 0, 0, 0);
  return new Date(instant.getTime() + minutesApresOuverture * 60_000);
}

/** La part de la bande qu'occupe un segment, pour le poser en CSS. */
export function partDuSegment(segment: Segment): number {
  const total = (HEURE_DE_FERMETURE - HEURE_DOUVERTURE) * 60;
  return (segment.finEnMinutes - segment.debutEnMinutes) / total;
}

export function heureDuSegment(minutesApresOuverture: number): string {
  const heures = HEURE_DOUVERTURE + Math.floor(minutesApresOuverture / 60);
  const minutes = minutesApresOuverture % 60;
  return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Vrai s'il reste au moins un moment libre dans la journée. */
export function resteDeLaPlace(segments: readonly Segment[]): boolean {
  return segments.some((segment) => segment.libre);
}
