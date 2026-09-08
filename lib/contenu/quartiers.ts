/**
 * Les quartiers ouverts, et leur centre indicatif.
 *
 * ATTENTION — tant qu'il n'y a pas de géocodeur, la position d'un emplacement
 * est celle du centre de son quartier, pas celle de son adresse. C'est une
 * dégradation volontaire et elle va dans le bon sens : elle rend la zone plus
 * floue que nécessaire, jamais plus précise. Le jour où un géocodeur
 * transformera l'adresse en coordonnées, seule l'écriture changera — la vue
 * `emplacement_visible` arrondira toujours ce qui sort.
 *
 * Les coordonnées ci-dessous sont approximatives et servent à situer un
 * quartier sur une figure, pas à guider quelqu'un.
 */

export type Quartier = {
  nom: string;
  latitude: number;
  longitude: number;
};

export const QUARTIERS: readonly Quartier[] = [
  { nom: 'Bruxelles-Central', latitude: 50.8456, longitude: 4.3572 },
  { nom: 'Place Sainte-Catherine', latitude: 50.85, longitude: 4.347 },
  { nom: 'Place Flagey', latitude: 50.828, longitude: 4.372 },
  { nom: 'Châtelain', latitude: 50.826, longitude: 4.36 },
  { nom: 'Parvis de Saint-Gilles', latitude: 50.828, longitude: 4.345 },
  { nom: 'Gare du Midi', latitude: 50.836, longitude: 4.336 },
  { nom: 'Gare du Nord', latitude: 50.86, longitude: 4.36 },
  { nom: 'Place Dailly', latitude: 50.85, longitude: 4.386 },
  { nom: 'Place Jourdan', latitude: 50.839, longitude: 4.382 },
  { nom: 'Place Communale de Molenbeek', latitude: 50.855, longitude: 4.34 },
  { nom: 'Place de la Vaillance', latitude: 50.838, longitude: 4.308 },
  { nom: 'Place Bockstael', latitude: 50.88, longitude: 4.345 },
  { nom: 'Tomberg', latitude: 50.845, longitude: 4.427 },
  { nom: 'Place Saint-Job', latitude: 50.79, longitude: 4.372 },
];

export function quartierParNom(nom: string): Quartier | undefined {
  return QUARTIERS.find((quartier) => quartier.nom === nom);
}

export const NOMS_DE_QUARTIER: readonly string[] = QUARTIERS.map(
  (quartier) => quartier.nom,
);
