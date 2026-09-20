import { QUARTIERS } from './quartiers';

/**
 * Les lieux qu'on peut chercher sans service tiers : les quartiers ouverts et
 * les communes de la région bruxelloise, avec un centre indicatif.
 *
 * Chercher un lieu ne transmet donc rien à personne. Un géocodeur, s'il est
 * configuré, ne sert qu'aux lieux absents de cette liste.
 */

export type Lieu = { nom: string; latitude: number; longitude: number };

const COMMUNES: readonly Lieu[] = [
  { nom: 'Bruxelles', latitude: 50.8467, longitude: 4.3525 },
  { nom: 'Ixelles', latitude: 50.8275, longitude: 4.3697 },
  { nom: 'Saint-Gilles', latitude: 50.8279, longitude: 4.3459 },
  { nom: 'Schaerbeek', latitude: 50.8676, longitude: 4.3737 },
  { nom: 'Etterbeek', latitude: 50.8361, longitude: 4.3861 },
  { nom: 'Saint-Josse-ten-Noode', latitude: 50.8532, longitude: 4.3733 },
  { nom: 'Molenbeek-Saint-Jean', latitude: 50.8545, longitude: 4.3222 },
  { nom: 'Anderlecht', latitude: 50.8372, longitude: 4.3077 },
  { nom: 'Forest', latitude: 50.8103, longitude: 4.3242 },
  { nom: 'Uccle', latitude: 50.8003, longitude: 4.3371 },
  { nom: 'Watermael-Boitsfort', latitude: 50.7998, longitude: 4.4153 },
  { nom: 'Auderghem', latitude: 50.8156, longitude: 4.4264 },
  { nom: 'Woluwe-Saint-Lambert', latitude: 50.8435, longitude: 4.4284 },
  { nom: 'Woluwe-Saint-Pierre', latitude: 50.8298, longitude: 4.4431 },
  { nom: 'Evere', latitude: 50.8703, longitude: 4.4021 },
  { nom: 'Jette', latitude: 50.8773, longitude: 4.3268 },
  { nom: 'Koekelberg', latitude: 50.8627, longitude: 4.3285 },
  { nom: 'Ganshoren', latitude: 50.8712, longitude: 4.3084 },
  { nom: 'Berchem-Sainte-Agathe', latitude: 50.8637, longitude: 4.2946 },
  { nom: 'Laeken', latitude: 50.8778, longitude: 4.3553 },
  { nom: 'Grand-Place', latitude: 50.8467, longitude: 4.3524 },
  { nom: 'Gare Centrale', latitude: 50.8455, longitude: 4.3571 },
];

export const LIEUX: readonly Lieu[] = [...QUARTIERS, ...COMMUNES];

/** Le lieu proposé par défaut, là où le réseau a commencé. */
export const LIEU_PAR_DEFAUT: Lieu = QUARTIERS[0]!;

function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Le lieu dont le nom correspond le mieux à ce qu'on a tapé. */
export function trouverUnLieu(texte: string): Lieu | null {
  const cherche = normaliser(texte);
  if (cherche.length < 2) return null;
  const exact = LIEUX.find((lieu) => normaliser(lieu.nom) === cherche);
  if (exact) return exact;
  return (
    LIEUX.find((lieu) => normaliser(lieu.nom).startsWith(cherche)) ??
    LIEUX.find((lieu) => normaliser(lieu.nom).includes(cherche)) ??
    LIEUX.find((lieu) => cherche.includes(normaliser(lieu.nom))) ??
    null
  );
}
