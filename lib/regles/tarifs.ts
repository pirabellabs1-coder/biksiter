/**
 * Ce qu'une garde peut coûter.
 *
 * Une garde est gratuite par défaut : c'est le cas de la très grande majorité
 * des emplacements. Un bike sitter peut demander une petite somme, réglée
 * directement entre les deux membres — l'association n'encaisse rien et ne
 * prend aucune commission. Pour que « petite somme » veuille dire quelque
 * chose, le réseau fixe un plafond par tranche de durée : personne ne peut le
 * dépasser, chacun reste libre de demander moins, ou rien.
 *
 * Les montants circulent en centimes : un arrondi qui dérape sur un euro
 * vingt-cinq se voit tout de suite dans une addition à deux membres.
 */

export type TrancheDeTarif = {
  /** Borne haute de la tranche, en heures, incluse. */
  jusqua: number;
  /** Le plus que l'on puisse demander sur cette tranche, en centimes. */
  plafond: number;
  libelle: string;
};

export const TRANCHES_DE_TARIF: readonly TrancheDeTarif[] = [
  { jusqua: 2, plafond: 300, libelle: '1 à 2 h' },
  { jusqua: 4, plafond: 500, libelle: 'Plus de 2 à 4 h' },
  { jusqua: 8, plafond: 700, libelle: 'Plus de 4 à 8 h' },
  { jusqua: 24, plafond: 900, libelle: 'Plus de 8 à 24 h' },
];

export const DUREE_MINIMALE_HEURES = 1;

/** La devise du pays, écrite ici une fois pour toutes. */
export const DEVISE = '€';

/**
 * La tranche qui s'applique à une durée. La borne est incluse : deux heures
 * exactement restent dans la première tranche, deux heures et un quart passent
 * dans la deuxième.
 */
export function indexDeLaTranche(heures: number): number {
  const duree = Math.max(DUREE_MINIMALE_HEURES, Number(heures) || DUREE_MINIMALE_HEURES);
  const index = TRANCHES_DE_TARIF.findIndex((tranche) => duree <= tranche.jusqua);
  // Au-delà de vingt-quatre heures, aucune tranche n'est décidée.
  return index;
}

/** Le plafond du réseau pour cette durée, en centimes. */
export function plafondPourLaDuree(heures: number): number | null {
  const index = indexDeLaTranche(heures);
  return index < 0 ? null : TRANCHES_DE_TARIF[index].plafond;
}

/**
 * Ce que ce bike sitter demande réellement pour cette durée.
 *
 * Sans barème, la garde est gratuite. Avec un barème, le plafond du réseau
 * l'emporte toujours : un tarif saisi trop haut ne s'affiche jamais tel quel.
 */
export function tarifPourLaDuree(
  tarifs: readonly number[] | null,
  heures: number,
): number | null {
  if (!tarifs) return 0;
  const index = indexDeLaTranche(heures);
  if (index < 0) return null;
  return Math.min(tarifs[index] ?? 0, TRANCHES_DE_TARIF[index].plafond);
}

/**
 * Pendant la bêta, une garde ne dépasse pas cinq heures : les tranches qui
 * commencent au-delà ne serviraient à rien, et se saisir un tarif qu'on ne
 * pourra jamais demander est une fausse promesse. Elles s'ouvriront quand le
 * plafond de durée sera relevé.
 */
export const DUREE_MAXIMALE_EN_BETA_HEURES = 5;

export function trancheOuverteEnBeta(index: number): boolean {
  const tranche = TRANCHES_DE_TARIF[index];
  if (!tranche) return false;
  // Une tranche n'est proposée que si on peut la demander en entier : afficher
  // un tarif « plus de quatre à huit heures » quand le réseau s'arrête à cinq
  // promettrait une garde qu'on ne peut pas réserver.
  return tranche.jusqua <= DUREE_MAXIMALE_EN_BETA_HEURES;
}

/**
 * Les points d'une garde menée à son terme.
 *
 * Une garde offerte en rapporte davantage qu'une garde payée : le réseau est
 * une association, et ce sont les gardes gratuites qui le font tenir. Dans les
 * deux cas, les points arrivent à la fin de la garde, jamais à l'acceptation.
 */
export const POINTS_PAR_GARDE_GRATUITE = 20;

/** Un montant en centimes, écrit comme on l'écrit en Belgique. */
export function euros(centimes: number): string {
  const montant = Number(centimes) / 100;
  const ecrit = Number.isInteger(montant)
    ? String(montant)
    : montant.toFixed(2).replace('.', ',');
  return `${ecrit} ${DEVISE}`;
}
