import { soldeDisponible, type Solde } from './maillons';

/**
 * Le catalogue.
 *
 * Des remerciements de commerçants du quartier à ceux qui accueillent des
 * vélos, échangés contre des points. Tout le monde voit le même catalogue ;
 * seul un membre qui a déjà accueilli peut échanger.
 */

export const CATEGORIES_D_OFFRE = [
  { cle: 'securite', titre: 'Sécurité' },
  { cle: 'equipement', titre: 'Équipement' },
  { cle: 'entretien', titre: 'Entretien' },
  { cle: 'autre', titre: 'Autre' },
] as const;

export type CategorieDOffre = (typeof CATEGORIES_D_OFFRE)[number]['cle'];

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
 * Le stock restant est une information sur le commerçant — il a promis dix
 * contrôles, il en reste trois. C'est un nombre, sans « plus que ».
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

/** Ce qu'il manque pour échanger une offre, en points ; 0 si le solde suffit. */
export function pointsManquants(offre: Offre, solde: Solde): number {
  return Math.max(0, offre.coutEnMaillons - soldeDisponible(solde));
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
