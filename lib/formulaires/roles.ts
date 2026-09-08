/**
 * Ce qu’on peut être quand on s’inscrit sur la liste d’attente.
 *
 * Un membre est cycliste **et** bike sitter selon le moment — ce n’est pas un
 * statut. On ne pose la question ici que parce que l’ouverture d’un quartier
 * dépend du nombre de personnes prêtes à accueillir, pas du nombre de
 * personnes qui cherchent une place.
 *
 * Cette liste vit hors du fichier d’actions : un module « use server » ne peut
 * exporter que des fonctions asynchrones.
 */
export const ROLES = {
  cycliste: 'Cycliste — je cherche une place pour mon vélo',
  bike_sitter: 'Bike sitter — je peux accueillir des vélos chez moi',
  les_deux: 'Les deux',
} as const;

export type Role = keyof typeof ROLES;

export function estUnRole(valeur: string): valeur is Role {
  return Object.keys(ROLES).includes(valeur);
}
