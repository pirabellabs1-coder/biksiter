import { estUnIdentifiantDeGarde, photoDeConstat } from '@/lib/depot/gardes';
import { estUnRangDePhoto } from '@/lib/regles/constat';
import { membreConnecte } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Sert une photo de constat, aux deux personnes de la garde et à elles
 * seules. Les photos ont été ré-encodées à l'arrivée : elles ne portent plus
 * de coordonnées GPS (règle 4).
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string; phase: string; rang: string }> },
): Promise<Response> {
  const membre = await membreConnecte();
  const { id, phase, rang } = await params;
  const numero = /^[0-9]$/.test(rang) ? Number(rang) : -1;
  if (
    !membre ||
    (phase !== 'depot' && phase !== 'reprise') ||
    !estUnRangDePhoto(numero) ||
    !estUnIdentifiantDeGarde(id)
  ) {
    return new Response('Introuvable', { status: 404 });
  }
  const contenu = await photoDeConstat(membre.id, id, phase, numero);
  if (!contenu) return new Response('Introuvable', { status: 404 });
  return new Response(new Uint8Array(contenu), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'no-store, private',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
