import { instantABruxelles, jourABruxelles } from '../temps';

/**
 * La progression d'un bike sitter : niveaux, badges, objectifs et classement.
 *
 * Tout part des gardes menées à terme (règle 3). Un niveau suit les points
 * gagnés au fil des gardes, jamais le solde : échanger un avantage au
 * catalogue ne fait pas redescendre. Les badges ne rapportent pas de points —
 * seule une garde terminée en rapporte.
 */

export const NIVEAUX = [
  { cle: 'nouveau', titre: 'Nouveau Bike Sitter', seuil: 0 },
  { cle: 'confirme', titre: 'Bike Sitter confirmé', seuil: 15 },
  { cle: 'confiance', titre: 'Bike Sitter de confiance', seuil: 50 },
  { cle: 'referent', titre: 'Bike Sitter référent', seuil: 125 },
] as const;

export type Niveau = (typeof NIVEAUX)[number];

export type PositionDeNiveau = {
  actuel: Niveau;
  suivant: Niveau | null;
  /** Points encore à gagner pour le niveau suivant ; 0 au dernier niveau. */
  manquants: number;
  /** Entre 0 et 1, du seuil actuel au seuil suivant. */
  avancement: number;
};

export function niveauPour(pointsGagnes: number): PositionDeNiveau {
  const points = Math.max(0, pointsGagnes);
  let indice = 0;
  NIVEAUX.forEach((niveau, i) => {
    if (points >= niveau.seuil) indice = i;
  });
  const actuel = NIVEAUX[indice]!;
  const suivant = NIVEAUX[indice + 1] ?? null;
  if (!suivant) {
    return { actuel, suivant: null, manquants: 0, avancement: 1 };
  }
  return {
    actuel,
    suivant,
    manquants: suivant.seuil - points,
    avancement: (points - actuel.seuil) / (suivant.seuil - actuel.seuil),
  };
}

/** Ce qu'il faut savoir d'un bike sitter pour dire où il en est de ses badges. */
export type ActiviteDuBikeSitter = {
  gardesTerminees: number;
  gardesDeVeloElectrique: number;
  /** Réponses, acceptations comme refus, données en moins d'une heure. */
  reponsesRapides: number;
  avisCinqEtoiles: number;
  /** Gardes menées à terme depuis sa dernière annulation. */
  serieSansAnnulation: number;
  meilleureSerieSansAnnulation: number;
};

export const DELAI_D_UNE_REPONSE_RAPIDE_MINUTES = 60;

export type UniteDUnBadge = 'gardes' | 'reponses' | 'avis';

type DefinitionDeBadge = {
  cle: string;
  titre: string;
  description: string;
  objectif: number;
  unite: UniteDUnBadge;
  /** Où en est le membre, pour la jauge. */
  mesure: (a: ActiviteDuBikeSitter) => number;
  /** Ce qui l'a débloqué, s'il ne suffit pas de la mesure du moment. */
  debloque?: (a: ActiviteDuBikeSitter) => boolean;
};

export const BADGES = [
  {
    cle: 'premiere_garde',
    titre: 'Première garde',
    description: 'Votre première garde réalisée',
    objectif: 1,
    unite: 'gardes',
    mesure: (a) => a.gardesTerminees,
  },
  {
    cle: 'reponse_rapide',
    titre: 'Réponse rapide',
    description: 'Cinq réponses en moins d’une heure',
    objectif: 5,
    unite: 'reponses',
    mesure: (a) => a.reponsesRapides,
  },
  {
    cle: 'zero_annulation',
    titre: 'Zéro annulation',
    description: 'Cinq gardes d’affilée sans annulation de votre part',
    objectif: 5,
    unite: 'gardes',
    mesure: (a) => a.serieSansAnnulation,
    // Une annulation plus tard ne retire pas un badge déjà gagné.
    debloque: (a) => a.meilleureSerieSansAnnulation >= 5,
  },
  {
    cle: 'accueil_5_etoiles',
    titre: 'Accueil 5 étoiles',
    description: 'Cinq avis à cinq étoiles',
    objectif: 5,
    unite: 'avis',
    mesure: (a) => a.avisCinqEtoiles,
  },
  {
    cle: 'dix_gardes',
    titre: '10 gardes',
    description: 'Dix gardes menées à terme',
    objectif: 10,
    unite: 'gardes',
    mesure: (a) => a.gardesTerminees,
  },
  {
    cle: 'specialiste_vae',
    titre: 'Spécialiste VAE',
    description: 'Cinq vélos électriques gardés',
    objectif: 5,
    unite: 'gardes',
    mesure: (a) => a.gardesDeVeloElectrique,
  },
] as const satisfies readonly DefinitionDeBadge[];

export type CleDeBadge = (typeof BADGES)[number]['cle'];

export type EtatDUnBadge = {
  cle: CleDeBadge;
  titre: string;
  description: string;
  objectif: number;
  unite: UniteDUnBadge;
  obtenu: boolean;
  /** La mesure du moment, plafonnée à l'objectif. */
  avancement: number;
  reste: number;
};

export function etatDesBadges(activite: ActiviteDuBikeSitter): EtatDUnBadge[] {
  return BADGES.map((badge: DefinitionDeBadge) => {
    const mesure = Math.max(0, badge.mesure(activite));
    const obtenu = badge.debloque
      ? badge.debloque(activite)
      : mesure >= badge.objectif;
    const avancement = obtenu
      ? badge.objectif
      : Math.min(mesure, badge.objectif);
    return {
      cle: badge.cle as CleDeBadge,
      titre: badge.titre,
      description: badge.description,
      objectif: badge.objectif,
      unite: badge.unite,
      obtenu,
      avancement,
      reste: badge.objectif - avancement,
    };
  });
}

/** Les badges encore à gagner, du plus proche au plus lointain. */
export function objectifsEnCours(
  activite: ActiviteDuBikeSitter,
): EtatDUnBadge[] {
  return etatDesBadges(activite)
    .filter((badge) => !badge.obtenu)
    .sort((a, b) => b.avancement / b.objectif - a.avancement / a.objectif);
}

export type IssueDUneGarde = 'menee' | 'annulee';

/**
 * Les annulations qui comptent contre un bike sitter : son propre désistement,
 * et la porte restée close quand le cycliste était là. Déclarer l'absence du
 * cycliste ou refuser une batterie dangereuse n'en sont pas : pénaliser ces
 * gestes découragerait de les faire.
 */
export const ANNULATIONS_IMPUTABLES_AU_BIKE_SITTER = [
  { acteur: 'bike_sitter', geste: 'annuler' },
  { acteur: 'cycliste', geste: 'personne_n_ouvre' },
] as const;

export function annulationImputableAuBikeSitter(evenement: {
  acteur: string;
  geste: string | null;
}): boolean {
  return ANNULATIONS_IMPUTABLES_AU_BIKE_SITTER.some(
    (cas) => cas.acteur === evenement.acteur && cas.geste === evenement.geste,
  );
}

/**
 * Les séries de gardes menées à terme, dans l'ordre où elles se sont
 * terminées. Seule une annulation du bike sitter interrompt une série : un
 * cycliste qui se désiste n'a rien à y voir.
 */
export function seriesSansAnnulation(issues: readonly IssueDUneGarde[]): {
  actuelle: number;
  meilleure: number;
} {
  let actuelle = 0;
  let meilleure = 0;
  for (const issue of issues) {
    actuelle = issue === 'menee' ? actuelle + 1 : 0;
    meilleure = Math.max(meilleure, actuelle);
  }
  return { actuelle, meilleure };
}

/**
 * La fiabilité : la part des gardes acceptées qui sont allées à leur terme,
 * sans annulation du bike sitter. Rien à afficher tant qu'aucune garde n'a
 * abouti d'une façon ou d'une autre.
 */
export function fiabilite(
  menees: number,
  annuleesParLeBikeSitter: number,
): number | null {
  const total = menees + annuleesParLeBikeSitter;
  if (total <= 0) return null;
  return Math.round((menees / total) * 100);
}

export const FILTRES_DU_JOURNAL = [
  { cle: 'tous', titre: 'Tous' },
  { cle: 'gagnes', titre: 'Gagnés' },
  { cle: 'utilises', titre: 'Utilisés' },
] as const;

export type FiltreDuJournal = (typeof FILTRES_DU_JOURNAL)[number]['cle'];

// --- Le classement « Top Bike Sitters » ------------------------------------------

export const PERIODES_DU_CLASSEMENT = [
  { cle: 'jour', titre: 'Aujourd’hui' },
  { cle: 'semaine', titre: 'Semaine' },
  { cle: 'mois', titre: 'Mois' },
] as const;

export type PeriodeDuClassement =
  (typeof PERIODES_DU_CLASSEMENT)[number]['cle'];

export const TAILLE_DU_CLASSEMENT = 10;

function decaler(jour: string, jours: number): string {
  const [annee, mois, date] = jour.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  return new Date(Date.UTC(annee, mois - 1, date + jours))
    .toISOString()
    .slice(0, 10);
}

/**
 * Les bornes d'une période, en jours de Bruxelles : une semaine va du lundi
 * au dimanche, un mois du premier au dernier jour. `fin` est exclue.
 */
export function bornesDeLaPeriode(
  periode: PeriodeDuClassement,
  maintenant: Date = new Date(),
): { debut: Date; fin: Date; premierJour: string; dernierJour: string } {
  const aujourdhui = jourABruxelles(maintenant);
  let premierJour = aujourdhui;
  let jourSuivant = decaler(aujourdhui, 1);

  if (periode === 'semaine') {
    const [annee, mois, date] = aujourdhui.split('-').map(Number) as [
      number,
      number,
      number,
    ];
    const depuisLundi =
      (new Date(Date.UTC(annee, mois - 1, date)).getUTCDay() + 6) % 7;
    premierJour = decaler(aujourdhui, -depuisLundi);
    jourSuivant = decaler(premierJour, 7);
  } else if (periode === 'mois') {
    premierJour = `${aujourdhui.slice(0, 7)}-01`;
    const [annee, mois] = aujourdhui.split('-').map(Number) as [number, number];
    jourSuivant = new Date(Date.UTC(annee, mois, 1)).toISOString().slice(0, 10);
  }

  return {
    debut: instantABruxelles(premierJour, '00:00')!,
    fin: instantABruxelles(jourSuivant, '00:00')!,
    premierJour,
    dernierJour: decaler(jourSuivant, -1),
  };
}

/**
 * Ce qu'un classement montre d'un bike sitter, et rien d'autre : ni adresse,
 * ni quartier, ni nom de famille (règle 3). La liste est fermée ; une colonne
 * de plus dans la requête ne passe pas jusqu'à l'écran.
 */
export const CHAMPS_DU_CLASSEMENT = [
  'prenom',
  'initiale',
  'verifie',
  'points',
  'gardes',
  'fiabilite',
  'note',
] as const;

export type LigneDuClassement = {
  prenom: string;
  initiale: string;
  verifie: boolean;
  points: number;
  gardes: number;
  fiabilite: number | null;
  note: number | null;
};

export function ligneDuClassement(
  source: LigneDuClassement,
): LigneDuClassement {
  return Object.fromEntries(
    CHAMPS_DU_CLASSEMENT.map((champ) => [champ, source[champ]]),
  ) as LigneDuClassement;
}

/** On n'apparaît que si on l'a choisi, et avec au moins un point sur la période. */
export function figureAuClassement(membre: {
  apparaitAuClassement: boolean;
  supprime: boolean;
  suspendu: boolean;
  points: number;
}): boolean {
  return (
    membre.apparaitAuClassement &&
    !membre.supprime &&
    !membre.suspendu &&
    membre.points > 0
  );
}

/**
 * Le rang : à égalité de points, même rang, et le suivant saute d'autant
 * (1, 1, 3). L'ordre d'affichage entre ex æquo vient de la requête.
 */
export function rangsDuClassement<T extends { points: number }>(
  lignes: readonly T[],
): (T & { rang: number })[] {
  const triees = [...lignes].sort((a, b) => b.points - a.points);
  return triees.map((ligne, i) => {
    const premierExAequo = triees.findIndex(
      (autre) => autre.points === ligne.points,
    );
    return { ...ligne, rang: (premierExAequo === -1 ? i : premierExAequo) + 1 };
  });
}
