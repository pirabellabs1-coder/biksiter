import { redirect } from 'next/navigation';

/**
 * L'ancienne adresse du constat d'absence.
 *
 * Le bike sitter déclare l'absence depuis l'écran commun des motifs, écrit de
 * son point de vue et relié aux vraies conséquences (la garde est close, le
 * cycliste est prévenu). Cette adresse y mène, pour les liens déjà envoyés.
 */
export default async function Absence({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/gardes/${id}/motif/absence`);
}
