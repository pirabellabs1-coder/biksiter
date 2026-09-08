import 'server-only';

import type { Quartier } from '@/lib/contenu/quartiers';
import type { PointGeographique } from '@/lib/regles/territoire';

import { geocoder } from './geocodeur';

/**
 * Poser un emplacement sur la carte, à la création comme à la correction.
 *
 * Deux issues seulement : ou bien on a un point, ou bien l'adresse est hors de
 * la zone couverte et c'est un refus. Le troisième cas — géocodeur muet,
 * adresse introuvable — n'en est pas un : on retombe sur le centre du
 * quartier. La zone devient plus floue, jamais plus précise, et un service
 * tiers indisponible ne bloque pas un bike sitter.
 */
export type Situation =
  | { situe: true; point: PointGeographique; precise: boolean }
  | { situe: false; motif: 'hors_zone' };

export async function situerLEmplacement(
  adresse: string,
  quartier: Quartier,
): Promise<Situation> {
  const trouvaille = await geocoder(adresse);

  if (!trouvaille.trouve && trouvaille.motif === 'hors_zone') {
    return { situe: false, motif: 'hors_zone' };
  }

  if (trouvaille.trouve) {
    return { situe: true, point: trouvaille.point, precise: true };
  }

  return {
    situe: true,
    point: { latitude: quartier.latitude, longitude: quartier.longitude },
    precise: false,
  };
}

export const HORS_ZONE =
  'Cette adresse est en Belgique mais hors de la région bruxelloise. Le réseau ne couvre pas encore votre commune.';
