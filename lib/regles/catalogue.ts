import { soldeDisponible, type Solde } from './maillons';

/**
 * Le catalogue.
 *
 * Ce ne sont pas des promotions : ce sont des remerciements de commerçants du
 * quartier à ceux qui accueillent des vélos. La différence se voit dans les
 * règles ci-dessous.
 *
 * Ce qu'on ne fait pas, et qu'il ne faut pas ajouter :
 *   - pas de « il vous manque 9 maillons » : on n'entretient pas un manque ;
 *   - pas de barre de progression vers l'offre suivante ;
 *   - pas de compte à rebours ni d'offre « qui expire bientôt » ;
 *   - pas de classement des membres par ce qu'ils ont échangé.
 *
 * Un membre qui n'a jamais accueilli voit tout le catalogue. Il ne peut rien
 * échanger, et c'est dit une fois, calmement, en haut de la page — pas offre
 * par offre.
 */

export type Offre = {
  coutEnMaillons: number;
  stockRestant: number;
  active: boolean;
};

export type RefusDEchange =
  | 'jamais_accueilli'
  | 'offre_indisponible'
  | 'rupture'
  | 'solde_insuffisant';

export type DecisionDEchange =
  | { possible: true }
  | { possible: false; motif: RefusDEchange };

export function decisionDEchange(
  offre: Offre,
  solde: Solde,
  gardesAccueillies: number,
): DecisionDEchange {
  // L'ordre compte : on annonce d'abord ce qui tient à la personne, pas au
  // stock. Dire « rupture » à quelqu'un qui de toute façon ne peut pas
  // échanger serait une fausse piste.
  if (gardesAccueillies === 0) {
    return { possible: false, motif: 'jamais_accueilli' };
  }
  if (!offre.active) {
    return { possible: false, motif: 'offre_indisponible' };
  }
  if (offre.stockRestant <= 0) {
    return { possible: false, motif: 'rupture' };
  }
  if (soldeDisponible(solde) < offre.coutEnMaillons) {
    return { possible: false, motif: 'solde_insuffisant' };
  }
  return { possible: true };
}

/**
 * Le stock restant s'affiche, contrairement au solde manquant.
 *
 * L'un est une information sur le commerçant — il a promis dix contrôles, il
 * en reste trois — et l'autre serait une pression sur le membre. On ne
 * l'affiche pas non plus en rouge ni avec « plus que » : c'est un nombre.
 */
export function stockAAfficher(offre: Offre): string | null {
  if (!offre.active) {
    return null;
  }
  if (offre.stockRestant <= 0) {
    return 'épuisé';
  }
  return `${offre.stockRestant} restant${offre.stockRestant > 1 ? 's' : ''}`;
}

/**
 * Un bon échangé se présente au commerçant. Le code lui sert à vérifier qu'il
 * est réel, et à nous à le compter — rien de plus. Il ne porte ni le nom du
 * membre ni son solde.
 */
export const LONGUEUR_DU_BON = 8;

export function bonValide(code: string): boolean {
  return new RegExp(`^[A-Z0-9]{${LONGUEUR_DU_BON}}$`).test(code);
}
