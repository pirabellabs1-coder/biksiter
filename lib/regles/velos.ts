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

/**
 * Le type de vélo tel qu'il s'écrit au fil d'une phrase.
 *
 * `toLowerCase()` seul ne suffit pas : « VTT » et « VTC » sont des sigles, et
 * « vtt » ne se lit plus. La liste étant fermée, l'exception se nomme ici une
 * fois pour toutes — sinon chaque page la réinvente, ou l'oublie.
 */
const SIGLES: readonly TypeVelo[] = ['VTT', 'VTC'];

export function typeVeloDansUnePhrase(type: TypeVelo | string): string {
  return (SIGLES as readonly string[]).includes(type)
    ? type
    : type.toLowerCase();
}
