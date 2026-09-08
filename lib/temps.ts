/**
 * Les heures saisies sont des heures de Bruxelles.
 *
 * Un cycliste qui écrit « 14h00 » veut dire 14h00 chez lui, pas 14h00 dans le
 * fuseau du serveur. Sans cette conversion, un déploiement en UTC décale
 * chaque stationnement d'une ou deux heures selon la saison — et personne ne
 * s'en aperçoit avant que quelqu'un attende devant une porte fermée.
 *
 * Pas de bibliothèque : `Intl` connaît déjà les règles d'heure d'été de
 * Bruxelles, et elles changent moins souvent que les versions d'une
 * dépendance.
 */

export const FUSEAU = 'Europe/Brussels';

const FORMATEUR = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSEAU,
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Décalage de Bruxelles par rapport à UTC, en millisecondes, à cet instant. */
function decalage(instant: Date): number {
  const parties = Object.fromEntries(
    FORMATEUR.formatToParts(instant).map((partie) => [partie.type, partie.value]),
  );

  const lu = Date.UTC(
    Number(parties.year),
    Number(parties.month) - 1,
    Number(parties.day),
    Number(parties.hour) === 24 ? 0 : Number(parties.hour),
    Number(parties.minute),
    Number(parties.second),
  );

  return lu - instant.getTime();
}

/**
 * Transforme un jour (« 2026-09-12 ») et une heure (« 14:00 ») saisis par un
 * membre en instant absolu.
 *
 * Les deux heures d'une nuit de passage à l'heure d'hiver sont ambiguës : on
 * retient la première. C'est sans conséquence ici — aucun stationnement ne se
 * décide à trois heures du matin le dernier dimanche d'octobre.
 */
export function instantABruxelles(jour: string, heure: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(jour) || !/^\d{2}:\d{2}$/.test(heure)) {
    return null;
  }

  const suppose = new Date(`${jour}T${heure}:00Z`);
  if (Number.isNaN(suppose.getTime())) {
    return null;
  }

  return new Date(suppose.getTime() - decalage(suppose));
}

const JOUR_ET_HEURE = new Intl.DateTimeFormat('fr-BE', {
  timeZone: FUSEAU,
  dateStyle: 'full',
  timeStyle: 'short',
});

const HEURE_SEULE = new Intl.DateTimeFormat('fr-BE', {
  timeZone: FUSEAU,
  timeStyle: 'short',
});

export function enFrancais(instant: Date): string {
  return JOUR_ET_HEURE.format(instant);
}

/** « le mardi 12 septembre, de 14:00 à 19:00 » */
export function creneauEnFrancais(debut: Date, fin: Date): string {
  return `${JOUR_ET_HEURE.format(debut)} → ${HEURE_SEULE.format(fin)}`;
}
