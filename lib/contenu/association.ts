/**
 * Les mentions de l’association.
 *
 * ATTENTION — l’adresse de contact et le numéro d’entreprise sont des
 * exemples. Ils doivent être remplacés par les vrais avant toute mise en
 * ligne : une association qui affiche une fausse adresse de contact perd
 * exactement ce qu’elle essaie de construire. Ils sont réunis ici pour qu’il
 * n’y ait qu’un seul endroit à corriger.
 */

export const ASSOCIATION = {
  nom: 'Bike Sitters',
  forme: 'association sans but lucratif',
  ville: 'Bruxelles',
  contact: 'bonjour@bikesitters.be',
  /** Numéro d'entreprise belge — à remplacer. */
  numeroDEntreprise: '0000.000.000',
} as const;
