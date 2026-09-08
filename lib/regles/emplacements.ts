/**
 * Règle 1 — l'espace privé.
 *
 * Un emplacement n'est publiable que s'il est inaccessible au public et aux
 * autres résidents de l'immeuble. La règle est portée par cette liste, jamais
 * par une question posée au membre : on ne lui demande pas si son lieu est
 * privé, on ne lui propose que des lieux qui le sont. C'est pour cela qu'un
 * local à vélos d'immeuble n'y figure pas, alors que c'est le premier endroit
 * auquel les gens pensent.
 *
 * La liste est fermée : quatorze entrées, ni plus ni moins.
 */
export const TYPES_EMPLACEMENT_PRIVE = [
  'Garage privé fermé',
  'Box de garage individuel',
  'Cave privative',
  'Intérieur du logement',
  'Pièce dédiée',
  'Débarras ou cellier',
  'Local privatif',
  'Abri de jardin ou remise',
  'Jardin privé clôturé',
  'Cour privée',
  'Terrasse privée',
  'Balcon ou loggia',
  'Véranda fermée',
  'Autre espace privé',
] as const;

export type TypeEmplacementPrive = (typeof TYPES_EMPLACEMENT_PRIVE)[number];

/**
 * Deux emplacements par membre.
 *
 * Au-delà, on ne parle plus d'un voisin qui rend service mais d'un
 * gestionnaire de parking — et le réseau perd ce qui le rend acceptable.
 */
export const EMPLACEMENTS_PAR_MEMBRE = 2;

export function estUnTypeEmplacementPrive(
  valeur: string,
): valeur is TypeEmplacementPrive {
  return (TYPES_EMPLACEMENT_PRIVE as readonly string[]).includes(valeur);
}

export function peutAjouterUnEmplacement(nombreDejaPublies: number): boolean {
  return nombreDejaPublies < EMPLACEMENTS_PAR_MEMBRE;
}
