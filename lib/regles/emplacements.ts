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

/**
 * Les états d'un stationnement qui retiennent un emplacement.
 *
 * Un vélo gardé est physiquement là : retirer l'emplacement effacerait le
 * stationnement alors que son propriétaire viendra sonner à la porte. Une
 * demande en attente retient aussi, parce que quelqu'un attend une réponse —
 * un bike sitter qui veut partir la refuse d'abord, il ne la fait pas
 * disparaître.
 */
export const ETATS_QUI_RETIENNENT = ['demande', 'accepte', 'en_cours'] as const;

export type MotifDeRefusDeRetrait = 'stationnements_en_cours';

export type DecisionDeRetrait =
  | { retirable: true }
  | { retirable: false; motif: MotifDeRefusDeRetrait; combien: number };

export function decisionDeRetrait(
  stationnementsQuiRetiennent: number,
): DecisionDeRetrait {
  if (stationnementsQuiRetiennent > 0) {
    return {
      retirable: false,
      motif: 'stationnements_en_cours',
      combien: stationnementsQuiRetiennent,
    };
  }
  return { retirable: true };
}

/**
 * Mettre en pause plutôt que retirer.
 *
 * Un bike sitter qui part en vacances n'a aucune raison de tout effacer : un
 * emplacement dépublié disparaît de la carte, ne reçoit plus de demande, et
 * laisse vivre les stationnements déjà acceptés. C'est toujours possible,
 * quelle que soit la situation.
 */
export function peutEtreMisEnPause(): boolean {
  return true;
}
