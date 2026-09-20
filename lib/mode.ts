import { cookies } from 'next/headers';

/**
 * Le mode d'affichage de l'application : cycliste ou bike sitter.
 *
 * Le compte reste unique ; le mode ne change que les onglets et l'accueil. On
 * passe de l'un à l'autre d'un geste, comme dans les maquettes, et le choix
 * est retenu d'une visite à l'autre.
 */

export const MODES = ['cycliste', 'bike_sitter'] as const;
export type Mode = (typeof MODES)[number];

export const TEMOIN_DE_MODE = 'mode';

export function estUnMode(valeur: unknown): valeur is Mode {
  return (MODES as readonly unknown[]).includes(valeur);
}

export async function modeCourant(): Promise<Mode> {
  const choisi = (await cookies()).get(TEMOIN_DE_MODE)?.value;
  return estUnMode(choisi) ? choisi : 'cycliste';
}
