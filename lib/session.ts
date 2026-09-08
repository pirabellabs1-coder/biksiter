import type { Membre } from '@/lib/regles/publication';

/**
 * Le membre courant.
 *
 * L’authentification n’existe pas encore : tout le monde est un visiteur dont
 * l’identité n’a pas été vérifiée. C’est la valeur la plus sûre — elle ferme
 * par défaut ce qui est réservé aux membres vérifiés (demander un
 * stationnement, publier un emplacement) au lieu de l’ouvrir. Le jour où la
 * session existera, seule cette fonction changera.
 */
export function membreCourant(): Membre {
  return { verification: 'absente', emplacementsPublies: 0 };
}
