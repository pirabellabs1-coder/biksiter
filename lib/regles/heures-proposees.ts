import { minutesDe } from './creneau';

/** Une plage d'accueil, « 08:00 » → « 21:00 ». */
export type PlageDAccueil = { de: string; a: string };

/**
 * Les heures qu'un formulaire de demande propose, pour un bike sitter donné.
 *
 * On ne propose que ce qu'il peut accepter : de sa première ouverture à sa
 * dernière fermeture, tous jours confondus. Le détail jour par jour reste
 * vérifié à l'envoi ; ici, on évite d'offrir minuit ou quatre heures du matin
 * à quelqu'un qui accueille de huit à vingt et une heures.
 */
export function heuresDansLAccueil(
  heures: readonly string[],
  plages: readonly PlageDAccueil[],
): string[] {
  if (plages.length === 0) return [...heures];
  const debut = Math.min(...plages.map((plage) => minutesDe(plage.de)));
  const fin = Math.max(...plages.map((plage) => minutesDe(plage.a)));
  return heures.filter((heure) => {
    const minutes = minutesDe(heure);
    return minutes >= debut && minutes <= fin;
  });
}

/** Les plages d'un emplacement : ses horaires généraux et ceux de chaque jour. */
export function plagesDAccueil(emplacement: {
  ouverture: string | null;
  fermeture: string | null;
  parJour?: Readonly<Record<string, PlageDAccueil>> | null;
}): PlageDAccueil[] {
  return [
    ...(emplacement.ouverture && emplacement.fermeture
      ? [{ de: emplacement.ouverture, a: emplacement.fermeture }]
      : []),
    ...Object.values(emplacement.parJour ?? {}),
  ];
}

/**
 * Les heures proposées, plus celles déjà choisies.
 *
 * Un menu déroulant dont la valeur n'a pas d'option affiche la première et
 * l'envoie : une demande préparée à 15:00 partirait à 08:00. L'heure choisie
 * (par la recherche ou par une demande existante) reste donc toujours dans la
 * liste, même hors des heures d'accueil — la vérification dira pourquoi elle
 * ne convient pas.
 */
export function avecLesHeuresChoisies(
  heures: readonly string[],
  ...choisies: readonly (string | null | undefined)[]
): string[] {
  const valides = choisies.filter(
    (heure): heure is string => typeof heure === 'string' && /^\d{2}:\d{2}$/.test(heure),
  );
  return [...new Set([...heures, ...valides])].sort(
    (a, b) => minutesDe(a) - minutesDe(b),
  );
}
