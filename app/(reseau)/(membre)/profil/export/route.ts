import { donneesDuMembre } from '@/lib/depot/mon-compte';
import { membreConnecte } from '@/lib/session';

/** Le droit à la portabilité : tout ce que le réseau sait du membre, en un fichier. */
export async function GET(): Promise<Response> {
  const membre = await membreConnecte();
  if (!membre) return new Response(null, { status: 401 });
  const donnees = await donneesDuMembre(membre.id);
  const jour = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(donnees, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="bike-sitters-mes-donnees-${jour}.json"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
