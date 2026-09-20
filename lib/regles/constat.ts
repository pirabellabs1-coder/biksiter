import {
  DETENTEUR_DU_CODE,
  type Acteur,
  type EtatDeGarde,
  type Phase,
} from './garde';

/**
 * Le constat d'état, au dépôt et à la reprise.
 *
 * Des photos et un état déclaré. C'est ce constat qui permet de trancher
 * « ma roue était droite en arrivant » — sans lui, un désaccord oppose deux
 * paroles. Le code dit « nous étions là », le constat dit « dans quel état ».
 *
 * Il se fait en deux temps, des deux côtés (planche 15). Le cycliste
 * photographie son vélo devant la porte, au moment de le remettre puis au
 * moment de le reprendre. Le bike sitter voit ces photos avant de saisir le
 * code du dépôt : en le saisissant, il valide ce qu'il a sous les yeux, et
 * peut y joindre une réserve.
 */

export const ETATS_DU_VELO = {
  ok: 'Bon état, rien à signaler',
  usure: "Traces d'usage habituelles",
  defaut: 'Défaut visible',
  batterie: 'Batterie inquiétante — gonflée, chaude ou odorante',
} as const;

export type EtatDuVelo = keyof typeof ETATS_DU_VELO;

export function estUnEtatDuVelo(valeur: string): valeur is EtatDuVelo {
  return Object.hasOwn(ETATS_DU_VELO, valeur);
}

/**
 * Ce que le cycliste peut déclarer. Une batterie inquiétante ne se déclare pas
 * soi-même : c'est le bike sitter qui refuse le vélo en le voyant. L'état reste
 * dans la liste pour lire les constats plus anciens.
 */
export const ETATS_DECLARABLES: readonly EtatDuVelo[] = [
  'ok',
  'usure',
  'defaut',
];

export function estUnEtatDeclarable(valeur: string): valeur is EtatDuVelo {
  return (ETATS_DECLARABLES as readonly string[]).includes(valeur);
}

/** Le cycliste documente son vélo, aux deux remises. */
export const AUTEUR_DU_CONSTAT: Readonly<Record<Phase, Acteur>> = {
  depot: 'cycliste',
  reprise: 'cycliste',
};

/**
 * Les photos et le code se font devant la porte : après l'arrivée pour le
 * dépôt, après la demande de reprise pour le retour. Une fois le code saisi,
 * le vélo a changé de mains et un constat ne prouverait plus rien.
 */
export const ETAT_DE_LA_REMISE: Readonly<Record<Phase, EtatDeGarde>> = {
  depot: 'arrivee',
  reprise: 'reprise_demandee',
};

export function constatPossible(
  phase: Phase,
  garde: { etat: string },
): boolean {
  return garde.etat === ETAT_DE_LA_REMISE[phase];
}

export type RefusDeLaSaisie =
  'garde_changee' | 'code_a_montrer' | 'photos_d_abord';

/**
 * Pourquoi une saisie de code est refusée avant même de lire les chiffres.
 * Refusée ici, elle ne consomme ni essai ni refus du jour.
 */
export function refusDeLaSaisie(saisie: {
  phase: Phase;
  etat: string;
  acteur: Acteur;
  constatEtabli: boolean;
}): RefusDeLaSaisie | null {
  if (saisie.etat !== ETAT_DE_LA_REMISE[saisie.phase]) return 'garde_changee';
  if (DETENTEUR_DU_CODE[saisie.phase] === saisie.acteur)
    return 'code_a_montrer';
  if (!saisie.constatEtabli) return 'photos_d_abord';
  return null;
}

/**
 * Seul le détenteur fait émettre un code. Quand il est aussi l'auteur des
 * photos — le cycliste au dépôt —, le code attend qu'elles soient prises.
 */
export function codeEmissible(emission: {
  phase: Phase;
  etat: string;
  acteur: Acteur;
  constatEtabli: boolean;
}): boolean {
  if (emission.etat !== ETAT_DE_LA_REMISE[emission.phase]) return false;
  if (DETENTEUR_DU_CODE[emission.phase] !== emission.acteur) return false;
  return (
    AUTEUR_DU_CONSTAT[emission.phase] !== emission.acteur ||
    emission.constatEtabli
  );
}

/**
 * Le bike sitter peut refuser un vélo électrique dont la batterie l'inquiète,
 * en le voyant devant sa porte : il serait rangé dans un local fermé, souvent
 * sous une habitation.
 */
export function refusPourLaBatteriePossible(
  acteur: Acteur,
  garde: { etat: string; typeVelo: string },
): boolean {
  return (
    acteur === 'bike_sitter' &&
    garde.etat === ETAT_DE_LA_REMISE.depot &&
    garde.typeVelo === 'Électrique'
  );
}

/**
 * Les photos d'un constat : deux angles indispensables, deux facultatifs. Le
 * rang d'une photo dit ce qu'elle montre.
 */
export const PHOTOS_DU_CONSTAT = [
  { rang: 0, titre: 'Côté gauche', requise: true },
  { rang: 1, titre: 'Côté droit', requise: true },
  { rang: 2, titre: 'Avant et accessoires', requise: false },
  { rang: 3, titre: 'Dégâts existants', requise: false },
] as const;

export const PHOTOS_MAXIMUM_PAR_CONSTAT = PHOTOS_DU_CONSTAT.length;

/**
 * Quatre photos doivent tenir dans un seul envoi : le formulaire les réduit
 * avant de les envoyer, et une photo réduite pèse bien moins que cela.
 */
export const TAILLE_MAXIMALE_D_UNE_PHOTO_DE_CONSTAT = 4 * 1024 * 1024;

export function estUnRangDePhoto(rang: number): boolean {
  return PHOTOS_DU_CONSTAT.some((photo) => photo.rang === rang);
}

export function titreDeLaPhoto(rang: number): string {
  return (
    PHOTOS_DU_CONSTAT.find((photo) => photo.rang === rang)?.titre ??
    'Photo du vélo'
  );
}

export const MOTIFS_DU_CONSTAT = [
  'Ajoutez les photos du côté gauche et du côté droit du vélo.',
  "Indiquez l'état constaté.",
  'Décrivez le défaut constaté.',
  'Confirmez que la batterie ne présente aucun signe inquiétant.',
] as const;

export const LONGUEUR_D_UNE_NOTE = 600;
export const LONGUEUR_D_UNE_RESERVE = 600;

export function motifsDuConstat(brouillon: {
  /** Les rangs des photos jointes. */
  rangs: readonly number[];
  etat: string;
  note: string;
  electrique: boolean;
  batterieVerifiee: boolean;
}): string[] {
  const motifs: string[] = [];
  const manquante = PHOTOS_DU_CONSTAT.some(
    (photo) => photo.requise && !brouillon.rangs.includes(photo.rang),
  );
  if (manquante) {
    motifs.push(MOTIFS_DU_CONSTAT[0]);
  }
  if (!estUnEtatDeclarable(brouillon.etat)) {
    motifs.push(MOTIFS_DU_CONSTAT[1]);
  }
  if (brouillon.etat === 'defaut' && brouillon.note.trim() === '') {
    motifs.push(MOTIFS_DU_CONSTAT[2]);
  }
  if (brouillon.electrique && !brouillon.batterieVerifiee) {
    motifs.push(MOTIFS_DU_CONSTAT[3]);
  }
  return motifs;
}

/**
 * Une description ne se garde qu'avec un défaut : un constat définitif ne doit
 * pas afficher « Bon état » à côté d'un défaut qu'on a décrit puis abandonné.
 */
export function noteDuConstat(etat: string, note: string): string | null {
  const texte = retirerLesCaracteresDeControle(note)
    .trim()
    .slice(0, LONGUEUR_D_UNE_NOTE);
  return etat === 'defaut' && texte !== '' ? texte : null;
}

/** Un caractère de contrôle n'a rien à faire dans un texte écrit à la main. */
export function retirerLesCaracteresDeControle(texte: string): string {
  return texte.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

const GRAVITE: Readonly<Record<EtatDuVelo, number>> = {
  ok: 0,
  usure: 1,
  defaut: 2,
  batterie: 3,
};

/**
 * Le constat de reprise se compare à celui du dépôt : c'est là son utilité.
 * Un vélo rendu en meilleur état n'a pas à alerter qui que ce soit.
 */
export function leRetourEstMoinsBon(
  depot: EtatDuVelo | null,
  reprise: EtatDuVelo,
): boolean {
  return depot !== null && GRAVITE[reprise] > GRAVITE[depot];
}

/**
 * Les photos d'un constat restent visibles aux deux membres pendant la garde,
 * puis quatorze jours après sa clôture : le temps de déposer un avis et de
 * revenir sur l'état du vélo. Prises devant la porte, elles peuvent montrer
 * l'entrée d'une habitation (règle 4). La modération garde son accès aux
 * gardes signalées, pour trancher un litige.
 */
export const JOURS_D_ACCES_AUX_PHOTOS = 14;

/** Les états où une garde est close : sa dernière clôture fait partir le délai. */
export const ETATS_CLOS: readonly EtatDeGarde[] = [
  'termine',
  'annule',
  'refuse',
  'expire',
];

const JOUR = 24 * 60 * 60 * 1000;

export function photosDuConstatVisibles(
  garde: { etat: string; clotureLe: Date | null },
  maintenant: Date,
): boolean {
  if (!(ETATS_CLOS as readonly string[]).includes(garde.etat)) return true;
  // Une garde close sans date connue ne rouvre pas ses photos.
  if (!garde.clotureLe) return false;
  return (
    maintenant.getTime() - garde.clotureLe.getTime() <=
    JOURS_D_ACCES_AUX_PHOTOS * JOUR
  );
}
