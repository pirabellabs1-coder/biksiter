/**
 * Les chemins du site, en un seul endroit.
 *
 * Le vocabulaire du CLAUDE.md s’applique aussi aux libellés de navigation :
 * on cherche et on propose un « emplacement », jamais un « espace ». Et on ne
 * « devient » pas bike sitter — c’est une action, pas un statut à demander.
 */

export type Lien = {
  chemin: string;
  libelle: string;
};

/**
 * Les libellés de l'en-tête sont plus courts que ceux du pied de page : la
 * barre doit tenir sur une ligne à côté de la marque et des deux boutons.
 * Le pied de page, lui, a la place d'être explicite.
 */
export const NAVIGATION: readonly Lien[] = [
  { chemin: '/emplacements', libelle: 'Emplacements' },
  { chemin: '/proposer-un-emplacement', libelle: 'Accueillir un vélo' },
  { chemin: '/fonctionnement', libelle: 'Comment ça marche' },
  { chemin: '/questions-frequentes', libelle: 'Questions' },
];

export const COLONNES_DU_PIED: readonly {
  titre: string;
  liens: readonly Lien[];
}[] = [
  {
    titre: 'Le service',
    liens: [
      { chemin: '/emplacements', libelle: 'Trouver un emplacement' },
      { chemin: '/proposer-un-emplacement', libelle: 'Proposer un emplacement' },
      { chemin: '/fonctionnement', libelle: 'Comment ça marche' },
    ],
  },
  {
    titre: 'Rejoindre le réseau',
    liens: [
      { chemin: '/liste-attente', libelle: 'Liste d’attente' },
      { chemin: '/invitation', libelle: 'J’ai une invitation' },
      { chemin: '/inscription', libelle: 'Créer mon compte' },
    ],
  },
  {
    titre: 'L’association',
    liens: [
      { chemin: '/a-propos', libelle: 'Qui sommes-nous' },
      { chemin: '/questions-frequentes', libelle: 'Questions fréquentes' },
      { chemin: '/soutenir', libelle: 'Nous soutenir' },
      { chemin: '/conditions-generales', libelle: 'Conditions générales' },
    ],
  },
];
