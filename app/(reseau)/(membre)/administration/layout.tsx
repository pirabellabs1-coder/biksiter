import { exigerUnModerateur } from '@/lib/session';

/**
 * L'administration n'existe que pour les personnes qui modèrent. Chaque page
 * et chaque action le revérifient : une mise en page décide de ce qu'on voit,
 * pas de qui a le droit d'agir.
 */
export default async function CadreDeLAdministration({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await exigerUnModerateur();
  return children;
}
