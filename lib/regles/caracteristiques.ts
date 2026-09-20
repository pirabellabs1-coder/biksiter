/**
 * Les caractéristiques d'un emplacement.
 *
 * Cinq listes fermées. Chacune répond à une question qu'un cycliste se pose
 * avant de confier son vélo, et qu'un bike sitter n'a pas envie de recevoir
 * par message à chaque demande.
 *
 * Les clés techniques ne bougent jamais (elles finissent en base) ; les
 * libellés sont ce que le membre lit.
 */

/** Comment l'emplacement se ferme. « aucun » reste possible : une cour privée
 *  close par un portail sans serrure est privée sans être verrouillée. */
export const VERROUILLAGES = {
  cle: 'Serrure et clé',
  code: 'Système électronique ou code',
  autre: 'Autre système',
  aucun: 'Pas de fermeture',
} as const;

export type Verrouillage = keyof typeof VERROUILLAGES;

/** Ce que le vélo prend, ou non, de la pluie. */
export const INTEMPERIES = {
  interieur: 'Entièrement à l’intérieur',
  abri: 'À l’extérieur sous abri',
  partiel: 'Partiellement couvert',
  dehors: 'À l’extérieur sans couverture',
} as const;

export type Intemperie = keyof typeof INTEMPERIES;

/** Le chemin à faire avec le vélo à la main : c'est ce qui décide si un cargo
 *  ou un vélo à sacoches peut venir. */
export const ACCES = [
  'Plain-pied',
  'Quelques marches',
  'Escalier',
  'Ascenseur',
  'Rampe',
  'Passage par l’intérieur du logement',
  'Passage étroit',
  'Autre',
] as const;

export type Acces = (typeof ACCES)[number];

/** À quoi le vélo peut être attaché sur place. */
export const ANCRAGES = [
  'Ancrage mural',
  'Ancrage au sol',
  'Râtelier fixe',
  'Arceau ou barre fixe',
  'Autre',
] as const;

export type Ancrage = (typeof ANCRAGES)[number];

/** Ce que le bike sitter propose en plus, sans y être tenu. */
export const SERVICES = [
  'Recharge VAE',
  'Gonflage des pneus',
  'Petit outillage à disposition',
] as const;

export type Service = (typeof SERVICES)[number];

export function estUnVerrouillage(valeur: string): valeur is Verrouillage {
  return Object.keys(VERROUILLAGES).includes(valeur);
}

export function estUneIntemperie(valeur: string): valeur is Intemperie {
  return Object.keys(INTEMPERIES).includes(valeur);
}

export function estUnAcces(valeur: string): valeur is Acces {
  return (ACCES as readonly string[]).includes(valeur);
}

export function estUnAncrage(valeur: string): valeur is Ancrage {
  return (ANCRAGES as readonly string[]).includes(valeur);
}

export function estUnService(valeur: string): valeur is Service {
  return (SERVICES as readonly string[]).includes(valeur);
}
