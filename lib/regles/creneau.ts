/**
 * Le créneau d'une garde, et les horaires d'un emplacement.
 *
 * Les jours s'écrivent « 2026-09-14 » et les heures « 14:30 », tous deux à
 * l'heure de Bruxelles : c'est ce que le membre choisit à l'écran, et c'est
 * ce qu'on compare aux horaires déclarés par le bike sitter.
 */

/** On ne demande pas une garde plus d'une semaine à l'avance. */
export const HORIZON_JOURS = 7;

/**
 * Une garde dure au moins une heure : en dessous, se retrouver, ouvrir, faire
 * les deux constats et repartir représente l'essentiel du rendez-vous.
 */
export const DUREE_MINIMALE_MINUTES = 60;

/**
 * Le dépôt se choisit au quart d'heure — 10:00, 10:15, 10:30 — parce qu'on
 * arrive quand on arrive. C'est la durée qui se compte en heures entières,
 * pas l'heure d'arrivée.
 */
export const PAS_DU_DEPOT_MINUTES = 15;

/** Personne ne dépose avant six heures du matin. */
export const PREMIER_DEPOT_MINUTES = 6 * 60;

/** Ni après vingt-deux heures. */
export const DERNIER_DEPOT_MINUTES = 22 * 60;

/**
 * Jusqu'où les reprises peuvent aller : six heures le lendemain matin, compté
 * depuis minuit du jour du dépôt. Au-delà, c'est une garde de plusieurs jours,
 * qui se demande autrement.
 */
export const DERNIERE_REPRISE_MINUTES = 30 * 60;

/**
 * Les heures de dépôt proposées un jour donné, par quart d'heure.
 *
 * Le jour même, on n'offre pas un créneau déjà passé : on part du quart
 * d'heure suivant, jamais de « maintenant ».
 */
export function depotsPossibles(
  cestAujourdhui: boolean,
  minutesCourantes: number,
): number[] {
  const debut = cestAujourdhui
    ? Math.max(
        PREMIER_DEPOT_MINUTES,
        Math.ceil(minutesCourantes / PAS_DU_DEPOT_MINUTES) *
          PAS_DU_DEPOT_MINUTES,
      )
    : PREMIER_DEPOT_MINUTES;

  const creneaux: number[] = [];
  for (let m = debut; m <= DERNIER_DEPOT_MINUTES; m += PAS_DU_DEPOT_MINUTES) {
    creneaux.push(m);
  }
  return creneaux;
}

/**
 * Les reprises possibles pour un dépôt donné : une heure après, puis d'heure
 * en heure. Les valeurs dépassent 24 h quand la reprise tombe le lendemain.
 */
export function reprisesPossibles(depotMinutes: number): number[] {
  const reprises: number[] = [];
  for (
    let m = depotMinutes + DUREE_MINIMALE_MINUTES;
    m <= DERNIERE_REPRISE_MINUTES;
    m += 60
  ) {
    reprises.push(m);
  }
  return reprises;
}

/** « 14:30 » à partir de minutes qui peuvent dépasser la journée. */
export function heureDuLendemain(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  return `${String(h).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** L'heure se lit « 14h00 » partout : listes, résumés, récapitulatifs. */
export function heureFrancaise(heure: string): string {
  return heure.replace(':', 'h');
}

/** Au-delà de minuit, l'heure seule ne suffit plus. */
export function libelleDeLaReprise(minutes: number): string {
  const heure = heureFrancaise(heureDuLendemain(minutes));
  return minutes >= 24 * 60 ? `${heure} (demain)` : heure;
}

export type HoraireDUnJour = { de: string; a: string };

export type Horaires = {
  /** De 0 (dimanche) à 6 (samedi). */
  jours: readonly number[];
  ouverture: string | null;
  fermeture: string | null;
  parJour: Readonly<Record<string, HoraireDUnJour>>;
  fermetures: readonly string[];
};

export type Creneau = {
  jourDepot: string;
  heureDepot: string;
  jourReprise: string;
  heureReprise: string;
};

const JOUR_ISO = /^\d{4}-\d{2}-\d{2}$/;
const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function estUnJour(valeur: string): boolean {
  if (!JOUR_ISO.test(valeur)) return false;
  const date = new Date(`${valeur}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(valeur);
}

export function estUneHeure(valeur: string): boolean {
  return HEURE.test(valeur);
}

export function minutesDe(heure: string): number {
  const [h = 0, m = 0] = heure.split(':').map(Number);
  return h * 60 + m;
}

export function heureDe(minutes: number): string {
  const borne = Math.max(0, Math.min(23 * 60 + 59, minutes));
  return `${String(Math.floor(borne / 60)).padStart(2, '0')}:${String(borne % 60).padStart(2, '0')}`;
}

/** Le jour de la semaine d'une date, de 0 (dimanche) à 6 (samedi). */
export function jourDeLaSemaine(jour: string): number {
  return new Date(`${jour}T12:00:00Z`).getUTCDay();
}

export function ajouterJours(jour: string, nombre: number): string {
  const date = new Date(`${jour}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + nombre);
  return date.toISOString().slice(0, 10);
}

export function ecartEnJours(de: string, a: string): number {
  return Math.round(
    (new Date(`${a}T12:00:00Z`).getTime() -
      new Date(`${de}T12:00:00Z`).getTime()) /
      (24 * 60 * 60 * 1000),
  );
}

/** Les jours qu'on peut choisir pour un dépôt, à partir d'aujourd'hui. */
export function joursReservables(aujourdhui: string): string[] {
  return Array.from({ length: HORIZON_JOURS }, (_, rang) =>
    ajouterJours(aujourdhui, rang),
  );
}

/** Nombre de journées entamées, au minimum une. */
export function nombreDeJours(creneau: Creneau): number {
  return Math.max(1, ecartEnJours(creneau.jourDepot, creneau.jourReprise) + 1);
}

/** Les heures du jour, ou `null` si l'emplacement n'accueille pas ce jour-là. */
export function horairesDuJour(
  horaires: Horaires,
  jour: string,
): HoraireDUnJour | null {
  if (horaires.fermetures.includes(jour)) return null;
  const semaine = jourDeLaSemaine(jour);
  if (!horaires.jours.includes(semaine)) return null;
  const particulier = horaires.parJour[String(semaine)];
  if (particulier) return particulier;
  if (!horaires.ouverture || !horaires.fermeture) return null;
  return { de: horaires.ouverture, a: horaires.fermeture };
}

/**
 * Le dépôt tombe dans les horaires du premier jour, la reprise dans ceux du
 * dernier. Entre les deux, le vélo dort sur place : les heures de fermeture
 * ne comptent pas, seuls les jours d'accueil du dépôt et de la reprise.
 */
export function dansLesHoraires(horaires: Horaires, creneau: Creneau): boolean {
  const premier = horairesDuJour(horaires, creneau.jourDepot);
  const dernier = horairesDuJour(horaires, creneau.jourReprise);
  if (!premier || !dernier) return false;
  const depot = minutesDe(creneau.heureDepot);
  const reprise = minutesDe(creneau.heureReprise);
  if (depot < minutesDe(premier.de) || depot > minutesDe(premier.a))
    return false;
  if (reprise < minutesDe(dernier.de) || reprise > minutesDe(dernier.a))
    return false;
  return true;
}

/** Un emplacement sans jour ni heure d'accueil est un brouillon. */
export function horairesRenseignes(horaires: Horaires): boolean {
  return (
    horaires.jours.length > 0 &&
    horaires.jours.every((jour) => {
      const particulier = horaires.parJour[String(jour)];
      return Boolean(particulier || (horaires.ouverture && horaires.fermeture));
    })
  );
}

/** La reprise suit le dépôt. */
export function repriseApresDepot(creneau: Creneau): boolean {
  const ecart = ecartEnJours(creneau.jourDepot, creneau.jourReprise);
  if (ecart < 0) return false;
  if (ecart > 0) return true;
  return minutesDe(creneau.heureReprise) > minutesDe(creneau.heureDepot);
}

/** La durée d'une garde tenue dans une seule journée, en minutes. */
export function dureeDansLaJournee(creneau: Creneau): number {
  return minutesDe(creneau.heureReprise) - minutesDe(creneau.heureDepot);
}

export const JOURS_ABREGES = [
  'Dim',
  'Lun',
  'Mar',
  'Mer',
  'Jeu',
  'Ven',
  'Sam',
] as const;

/**
 * Les horaires en une ligne, en regroupant les jours qui ont les mêmes
 * heures : « Lun, Mar, Mer · 07:30 → 20:00   Sam · 09:00 → 17:00 ».
 */
export function libelleDesHoraires(
  horaires: Horaires,
  abrege: (jour: number) => string = (jour) => JOURS_ABREGES[jour] ?? '',
): string {
  const groupes = new Map<string, string[]>();
  for (const jour of [...horaires.jours].sort(
    (a, b) => ((a + 6) % 7) - ((b + 6) % 7),
  )) {
    const heures =
      horaires.parJour[String(jour)] ??
      (horaires.ouverture && horaires.fermeture
        ? { de: horaires.ouverture, a: horaires.fermeture }
        : null);
    if (!heures) continue;
    // Les heures s'écrivent comme partout ailleurs à l'écran : « 08h00 – 21h00 ».
    const cle = `${heureFrancaise(heures.de)} – ${heureFrancaise(heures.a)}`;
    groupes.set(cle, [...(groupes.get(cle) ?? []), abrege(jour)]);
  }
  return [...groupes.entries()]
    .map(([heures, jours]) => `${jours.join(', ')} · ${heures}`)
    .join('   ');
}

/**
 * La durée d'affilée qu'un bike sitter accepte, en heures.
 *
 * Le réseau plafonne à cinq heures ; trois est la valeur proposée par défaut.
 * Au-delà, la garde se demande autrement — c'est ce que dit l'écran des
 * disponibilités, et c'est ce que porte cette liste.
 */
export const DUREES_MAX_HEURES: Readonly<Record<number, string>> = {
  1: '1 heure',
  2: '2 heures',
  3: '3 heures',
  4: '4 heures',
  5: '5 heures',
};

/** Ce qu'on propose quand le bike sitter n'a rien choisi. */
export const DUREE_MAX_PAR_DEFAUT_HEURES = 3;

/** Au-delà d'une journée, la modération ouvre le multi-jours. */
export const DUREES_MAX_JOURS: Readonly<Record<number, string>> = {
  1: 'Une journée',
  7: 'Plusieurs jours — ouvert par la modération',
  99: 'Au-delà d’une semaine, à convenir',
};

export const A_CONVENIR = 99;

export const DELAIS_DE_REPONSE: Readonly<Record<string, string>> = {
  heure: "Répond généralement dans l'heure",
  jour: 'Répond dans la journée',
  h24: 'Répond sous 24 heures',
  veille: 'Prévenez la veille — ne répond pas dans l’urgence',
};

export const RYTHMES: Readonly<Record<string, string>> = {
  ponctuel: 'Occasionnellement',
  regulier: 'Souvent',
};

export const RYTHMES_PUBLICS: Readonly<Record<string, string>> = {
  ponctuel: 'Accueille occasionnellement',
  regulier: 'Accueille souvent',
};

/** « 14/09/2026 ». */
export function jourAffiche(jour: string): string {
  const [annee, mois, date] = jour.split('-');
  return `${date}/${mois}/${annee}`;
}

/** « 14/09 », pour les champs où la place manque. */
export function jourCourt(jour: string): string {
  return jourAffiche(jour).slice(0, 5);
}

/**
 * Le créneau en une ligne, sous forme de phrase à emplacements : « 14/09/2026
 * · 09:00 → 17:00 », ou « … (une nuit) », « … (3 jours) ».
 */
export function libelleDuCreneau(creneau: Creneau): {
  texte: string;
  valeurs: Record<string, string | number>;
} {
  const jours = nombreDeJours(creneau);
  const valeurs = {
    jour: jourAffiche(creneau.jourDepot),
    de: creneau.heureDepot,
    jourFin: jourAffiche(creneau.jourReprise),
    a: creneau.heureReprise,
    jours,
  };
  if (jours === 1) return { texte: '{jour} · {de} → {a}', valeurs };
  if (jours === 2) {
    return { texte: '{jour} {de} → {jourFin} {a} (une nuit)', valeurs };
  }
  return { texte: '{jour} {de} → {jourFin} {a} ({jours} jours)', valeurs };
}

export type ChoixDuCreneau = {
  jourDepot: string;
  heureDepot: string;
  jourReprise: string;
  heureReprise: string;
};

/**
 * Les jours de reprise que le formulaire propose : du jour du dépôt jusqu'au
 * nombre de journées que le bike sitter accepte (null : à convenir).
 */
export function joursDeReprisePermis(
  jours: readonly string[],
  jourDepot: string,
  joursMaximum: number | null,
): string[] {
  return jours
    .filter((jour) => jour >= jourDepot)
    .slice(0, joursMaximum ?? jours.length);
}

/**
 * Ramène un créneau dans ce que le formulaire propose. Le jour de reprise se
 * borne d'abord — c'est lui qui décide des heures possibles —, puis l'heure :
 * le même jour, la reprise vient après le dépôt. Sans cela, une liste pourrait
 * afficher une valeur et le formulaire en envoyer une autre.
 */
export function creneauDansLesBornes<T extends ChoixDuCreneau>(
  choix: T,
  bornes: {
    jours: readonly string[];
    heures: readonly string[];
    joursMaximum: number | null;
  },
): T {
  const { jours, heures, joursMaximum } = bornes;
  const permis = joursDeReprisePermis(jours, choix.jourDepot, joursMaximum);
  const dernier = permis.at(-1) ?? choix.jourDepot;

  // Un dépôt à la dernière heure n'a de reprise possible que le lendemain.
  let heureDepot = choix.heureDepot;
  const derniereHeure = heures.at(-1);
  if (permis.length <= 1 && heureDepot === derniereHeure && heures.length > 1) {
    heureDepot = heures.at(-2) ?? heureDepot;
  }

  let jourReprise =
    choix.jourReprise < choix.jourDepot
      ? choix.jourDepot
      : choix.jourReprise > dernier
        ? dernier
        : choix.jourReprise;
  let heureReprise = choix.heureReprise;
  if (jourReprise === choix.jourDepot && heureReprise <= heureDepot) {
    const suivante = heures.find((heure) => heure > heureDepot);
    if (suivante) heureReprise = suivante;
    else if (permis[1]) jourReprise = permis[1];
  }
  if (
    heureDepot === choix.heureDepot &&
    jourReprise === choix.jourReprise &&
    heureReprise === choix.heureReprise
  ) {
    return choix;
  }
  return { ...choix, heureDepot, jourReprise, heureReprise };
}
