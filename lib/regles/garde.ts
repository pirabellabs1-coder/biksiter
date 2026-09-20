import { SEUIL_DESISTEMENT_TARDIF_HEURES } from './annulation';

/**
 * Le déroulé d'une garde.
 *
 * Chaque état ne permet que certains gestes, et chaque geste appartient à une
 * seule des deux personnes. Rien d'autre ne fait avancer une garde : ni un
 * écran, ni un bouton oublié, ni une requête écrite à la main.
 */

export type EtatDeGarde =
  | 'demande'
  | 'accepte'
  | 'arrivee'
  | 'en_cours'
  | 'reprise_demandee'
  | 'termine'
  | 'refuse'
  | 'annule'
  | 'expire'
  | 'litige';

export type Acteur = 'cycliste' | 'bike_sitter';

export type Geste =
  | 'accepter'
  | 'refuser'
  | 'annuler'
  | 'absence'
  | 'arriver'
  | 'personne_n_ouvre'
  | 'recevoir'
  | 'reprendre'
  | 'restituer'
  | 'signaler';

export type Transition = {
  geste: Geste;
  vers: EtatDeGarde;
  acteur: Acteur;
  style: 'primary' | 'danger' | 'ghost';
};

export const TRANSITIONS: Readonly<Record<EtatDeGarde, readonly Transition[]>> =
  {
    demande: [
      {
        geste: 'accepter',
        vers: 'accepte',
        acteur: 'bike_sitter',
        style: 'primary',
      },
      {
        geste: 'refuser',
        vers: 'refuse',
        acteur: 'bike_sitter',
        style: 'danger',
      },
      { geste: 'annuler', vers: 'annule', acteur: 'cycliste', style: 'ghost' },
    ],
    accepte: [
      {
        geste: 'arriver',
        vers: 'arrivee',
        acteur: 'cycliste',
        style: 'primary',
      },
      { geste: 'annuler', vers: 'annule', acteur: 'cycliste', style: 'ghost' },
      {
        geste: 'annuler',
        vers: 'annule',
        acteur: 'bike_sitter',
        style: 'ghost',
      },
      {
        geste: 'absence',
        vers: 'annule',
        acteur: 'bike_sitter',
        style: 'ghost',
      },
    ],
    arrivee: [
      {
        geste: 'recevoir',
        vers: 'en_cours',
        acteur: 'bike_sitter',
        style: 'primary',
      },
      {
        geste: 'personne_n_ouvre',
        vers: 'annule',
        acteur: 'cycliste',
        style: 'ghost',
      },
      {
        geste: 'absence',
        vers: 'annule',
        acteur: 'bike_sitter',
        style: 'ghost',
      },
    ],
    en_cours: [
      {
        geste: 'reprendre',
        vers: 'reprise_demandee',
        acteur: 'cycliste',
        style: 'primary',
      },
      { geste: 'signaler', vers: 'litige', acteur: 'cycliste', style: 'ghost' },
      {
        geste: 'signaler',
        vers: 'litige',
        acteur: 'bike_sitter',
        style: 'ghost',
      },
    ],
    reprise_demandee: [
      {
        geste: 'restituer',
        vers: 'termine',
        acteur: 'cycliste',
        style: 'primary',
      },
      { geste: 'signaler', vers: 'litige', acteur: 'cycliste', style: 'ghost' },
    ],
    termine: [],
    refuse: [],
    annule: [],
    expire: [],
    // Seule la modération clôt un litige.
    litige: [],
  };

export function gestesPossibles(
  etat: EtatDeGarde,
  acteur: Acteur,
): readonly Transition[] {
  return TRANSITIONS[etat].filter((t) => t.acteur === acteur);
}

export function transitionPermise(
  etat: EtatDeGarde,
  geste: Geste,
  acteur: Acteur,
): Transition | null {
  return gestesPossibles(etat, acteur).find((t) => t.geste === geste) ?? null;
}

/** Refuser, annuler, déclarer une absence, signaler : ces gestes demandent un motif. */
export function demandeUnMotif(geste: Geste): boolean {
  return [
    'refuser',
    'annuler',
    'absence',
    'personne_n_ouvre',
    'signaler',
  ].includes(geste);
}

/**
 * Le vélo ne change de mains qu'avec un code (règle 5). Au dépôt, le cycliste
 * donne le vélo et détient le code ; à la reprise, c'est le bike sitter.
 */
export type Phase = 'depot' | 'reprise';

export const DETENTEUR_DU_CODE: Readonly<Record<Phase, Acteur>> = {
  depot: 'cycliste',
  reprise: 'bike_sitter',
};

/** Le geste qu'une saisie correcte du code accomplit. */
export const GESTE_DE_LA_REMISE: Readonly<Record<Phase, Geste>> = {
  depot: 'recevoir',
  reprise: 'restituer',
};

export function phaseDuGeste(geste: Geste): Phase | null {
  if (geste === 'recevoir') return 'depot';
  if (geste === 'restituer') return 'reprise';
  return null;
}

/** Les états où quelqu'un compte encore sur l'autre. */
export const ETATS_ENGAGES: readonly EtatDeGarde[] = [
  'accepte',
  'arrivee',
  'en_cours',
  'reprise_demandee',
];

/**
 * Après la reprise, l'adresse reste lisible le temps de repartir, puis
 * disparaît : une ancienne garde ne doit pas devenir un carnet d'adresses.
 */
export const ADRESSE_APRES_REPRISE_HEURES = 2;

/** Une conversation se referme avec le délai pour laisser un avis. */
export const CONVERSATION_APRES_REPRISE_JOURS = 14;

const HEURE_MS = 60 * 60 * 1000;

type Moment = { reprisLe: Date | null; maintenant: Date };

function repriseDepuisMoinsDe(moment: Moment, duree: number): boolean {
  if (!moment.reprisLe) return false;
  const ecart = moment.maintenant.getTime() - new Date(moment.reprisLe).getTime();
  return ecart >= 0 && ecart <= duree;
}

/**
 * Règle 4 : l'adresse exacte n'existe qu'après acceptation. Elle reste lisible
 * pendant un litige tant que le vélo n'est pas repris : c'est là qu'il se trouve.
 */
export function adresseVisible(etat: EtatDeGarde, moment: Moment): boolean {
  if (ETATS_ENGAGES.includes(etat)) return true;
  if (etat === 'litige') return moment.reprisLe === null;
  if (etat === 'termine') {
    return repriseDepuisMoinsDe(moment, ADRESSE_APRES_REPRISE_HEURES * HEURE_MS);
  }
  return false;
}

/**
 * Le numéro de l'autre s'ouvre à l'acceptation et se referme à la clôture.
 * Un litige le laisse ouvert : c'est précisément le moment où il faut se parler.
 */
export function telephoneVisible(etat: EtatDeGarde): boolean {
  return [...ETATS_ENGAGES, 'litige'].includes(etat);
}

/** On s'écrit dès la demande, et jusqu'à la fin du délai pour laisser un avis. */
export function conversationOuverte(etat: EtatDeGarde, moment: Moment): boolean {
  if (['demande', ...ETATS_ENGAGES, 'litige'].includes(etat)) return true;
  return (
    etat === 'termine' &&
    repriseDepuisMoinsDe(moment, CONVERSATION_APRES_REPRISE_JOURS * 24 * HEURE_MS)
  );
}

/**
 * Un blocage coupe la conversation, sauf quand un vélo est en jeu : pendant une
 * garde engagée ou un litige, il faut encore pouvoir se joindre.
 */
export function blocageCoupeLaConversation(etat: EtatDeGarde): boolean {
  return !['accepte', 'arrivee', 'en_cours', 'reprise_demandee', 'litige'].includes(etat);
}

/** La couleur d'une pastille d'état (règle 6). */
export const TON_DE_L_ETAT: Readonly<
  Record<EtatDeGarde, 'trust' | 'lamp' | 'alert'>
> = {
  demande: 'trust',
  accepte: 'trust',
  arrivee: 'trust',
  en_cours: 'lamp',
  reprise_demandee: 'trust',
  termine: 'trust',
  refuse: 'alert',
  annule: 'alert',
  expire: 'alert',
  litige: 'alert',
};

/** Les rubriques de l'écran Activité, dans leur ordre. */
/** Les onglets de « Mes gardes », dans leur ordre. */
export const ONGLETS_DES_GARDES = [
  { cle: 'a-venir', titre: 'À venir', etats: ['demande', 'accepte'] },
  {
    cle: 'en-cours',
    titre: 'En cours',
    etats: ['arrivee', 'en_cours', 'reprise_demandee', 'litige'],
  },
  { cle: 'terminees', titre: 'Terminées', etats: ['termine'] },
  { cle: 'annulees', titre: 'Annulées', etats: ['refuse', 'annule', 'expire'] },
] as const satisfies readonly {
  cle: string;
  titre: string;
  etats: readonly EtatDeGarde[];
}[];

export type OngletDesGardes = (typeof ONGLETS_DES_GARDES)[number]['cle'];

/** Chaque état tombe dans un onglet, et un seul. */
export function ongletDeLEtat(etat: EtatDeGarde): OngletDesGardes {
  return ONGLETS_DES_GARDES.find((onglet) =>
    (onglet.etats as readonly EtatDeGarde[]).includes(etat),
  )!.cle;
}

/** Une demande sans réponse expire au bout de vingt-quatre heures. */
export const EXPIRATION_D_UNE_DEMANDE_HEURES = 24;

/** Le seuil d'un désistement tardif vit avec la règle d'annulation. */
export const DESISTEMENT_TARDIF_HEURES = SEUIL_DESISTEMENT_TARDIF_HEURES;

/** Au bout de dix minutes devant la porte, on rappelle qu'on a le numéro. */
export const ATTENTE_AVANT_D_APPELER_MINUTES = 10;

/** Au bout de vingt, le cycliste peut clore la garde et repartir. */
export const ATTENTE_AVANT_DE_REPARTIR_MINUTES = 20;

/** En dessous de trente minutes de retard, c'est la vie courante. */
export const RETARD_TOLERE_MINUTES = 30;

const MINUTE = 60 * 1000;

export function minutesEcoulees(depuis: Date, maintenant: Date): number {
  return Math.max(
    0,
    Math.floor((maintenant.getTime() - depuis.getTime()) / MINUTE),
  );
}

export function estUnDesistementTardif(debut: Date, maintenant: Date): boolean {
  return (
    debut.getTime() - maintenant.getTime() <
    DESISTEMENT_TARDIF_HEURES * 60 * MINUTE
  );
}

/** « Personne ne m'a ouvert » n'est possible qu'après vingt minutes d'attente. */
export function peutRepartirSansDeposer(
  arriveLe: Date,
  maintenant: Date,
): boolean {
  return (
    minutesEcoulees(arriveLe, maintenant) >= ATTENTE_AVANT_DE_REPARTIR_MINUTES
  );
}

/**
 * Une demande sans réponse expire au bout de vingt-quatre heures, ou dès que
 * l'heure du dépôt est passée : accepter ensuite engagerait sur un créneau que
 * le cycliste a déjà dû remplacer.
 */
export function demandeExpiree(
  demandeLe: Date,
  debut: Date,
  maintenant: Date,
): boolean {
  return (
    minutesEcoulees(demandeLe, maintenant) >= EXPIRATION_D_UNE_DEMANDE_HEURES * 60 ||
    maintenant.getTime() > debut.getTime()
  );
}

/** On signale son arrivée devant la porte, pas la veille depuis son canapé. */
export const ARRIVEE_AVANT_L_HEURE_MINUTES = 30;

export function peutSignalerSonArrivee(
  debut: Date,
  fin: Date,
  maintenant: Date,
): boolean {
  return (
    maintenant.getTime() >= debut.getTime() - ARRIVEE_AVANT_L_HEURE_MINUTES * 60_000 &&
    maintenant.getTime() < fin.getTime()
  );
}

/**
 * Les refus d'un geste qui disent quoi faire. Ils passent d'un écran à l'autre
 * par leur code, jamais par leur texte : une phrase lue dans l'adresse pourrait
 * avoir été écrite par n'importe qui.
 */
export const REFUS_D_UN_GESTE = {
  pause: 'Cet emplacement est en pause. Republiez-le avant d’accepter.',
  ailleurs:
    'Vous accueillez déjà un vélo à un autre emplacement sur ce créneau : vous ne pouvez pas être à deux endroits à la fois.',
  capacite: 'Capacité atteinte sur ce créneau.',
  expiree: 'Cette demande a expiré : elle n’a pas reçu de réponse à temps.',
  arrivee:
    'Vous pourrez signaler votre arrivée une demi-heure avant l’heure du dépôt.',
} as const;

export type RefusDUnGeste = keyof typeof REFUS_D_UN_GESTE;

export function codeDuRefus(texte: string): RefusDUnGeste | null {
  const trouve = Object.entries(REFUS_D_UN_GESTE).find(([, phrase]) => phrase === texte);
  return trouve ? (trouve[0] as RefusDUnGeste) : null;
}

/**
 * « Le vélo n'a pas été remis » n'est possible qu'une fois l'heure de dépôt
 * dépassée d'une bonne marge : trop tôt, il annulerait une garde qui allait
 * avoir lieu.
 */
export function peutDeclarerLAbsence(
  etat: EtatDeGarde,
  debut: Date,
  maintenant: Date,
): boolean {
  if (etat === 'arrivee') return true;
  return (
    minutesEcoulees(debut, maintenant) >= RETARD_TOLERE_MINUTES &&
    maintenant.getTime() > debut.getTime()
  );
}

export function estEnRetardAuDepot(
  etat: EtatDeGarde,
  debut: Date,
  maintenant: Date,
): boolean {
  return (
    etat === 'accepte' &&
    maintenant.getTime() > debut.getTime() &&
    minutesEcoulees(debut, maintenant) >= RETARD_TOLERE_MINUTES
  );
}

/** Les motifs proposés, selon le geste et la personne. */
export function motifsProposes(
  geste: Geste,
  acteur: Acteur,
): readonly string[] {
  switch (geste) {
    case 'absence':
      return [
        "Personne ne s'est présenté",
        'Prévenu trop tard',
        'Rendez-vous manqué',
        'Autre',
      ];
    case 'signaler':
      return [
        "Le vélo n'a pas été restitué",
        "L'autre personne est injoignable",
        'Le vélo est endommagé',
        "Le lieu ne correspond pas à l'annonce",
        'Autre',
      ];
    case 'refuser':
      return [
        'Plus de place ce jour-là',
        'Créneau qui ne me convient pas',
        'Type de vélo non accepté',
        'Je préfère ne pas répondre',
      ];
    case 'personne_n_ouvre':
      return [
        "Personne n'a répondu à la porte",
        'Injoignable par téléphone',
        'Autre',
      ];
    default:
      return acteur === 'bike_sitter'
        ? [
            'Absence imprévue',
            "L'emplacement n'est plus accessible",
            'Problème de santé',
            'Erreur de ma part',
            'Autre',
          ]
        : [
            'Changement de programme',
            "J'ai trouvé une autre solution",
            'Erreur dans ma demande',
            'Autre',
          ];
  }
}
