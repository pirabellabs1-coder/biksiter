/**
 * Les douze types de vélo.
 *
 * Liste fermée : un bike sitter annonce ce qu'il peut accueillir, un cycliste
 * annonce ce qu'il dépose, et les deux doivent parler du même vocabulaire.
 * Un cargo et un longtail sont distingués parce qu'ils ne passent pas par les
 * mêmes portes.
 */
export const TYPES_VELO = [
  'Ville',
  'Route',
  'VTT',
  'VTC',
  'Gravel',
  'Pliant',
  'Électrique',
  'Cargo',
  'Longtail',
  'Tandem',
  'Enfant',
  'Avec remorque',
] as const;

export type TypeVelo = (typeof TYPES_VELO)[number];

export function estUnTypeVelo(valeur: string): valeur is TypeVelo {
  return (TYPES_VELO as readonly string[]).includes(valeur);
}
