import { cookies } from 'next/headers';

import {
  lireLesReglages,
  type ReglageDAffichage,
} from '@/lib/regles/accessibilite';

export const TEMOIN_D_AFFICHAGE = 'affichage';

export async function reglagesDAffichage(): Promise<ReglageDAffichage[]> {
  return lireLesReglages((await cookies()).get(TEMOIN_D_AFFICHAGE)?.value);
}
