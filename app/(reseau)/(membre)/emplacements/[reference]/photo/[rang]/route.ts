import { uneLigne } from '@/lib/bd/client';
import { estUnRangValide } from '@/lib/regles/photos';
import { membreConnecte } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Sert une photo d'emplacement, aux membres seulement : les bike sitters ne
 * sont visibles qu'une fois connecté. Les photos ont été ré-encodées à
 * l'arrivée et ne portent plus de coordonnées GPS (règle 4).
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ reference: string; rang: string }> },
): Promise<Response> {
  const membre = await membreConnecte();
  if (!membre) return new Response('Introuvable', { status: 404 });

  const { reference, rang } = await params;
  const numero = Number.parseInt(rang, 10);
  if (!estUnRangValide(numero)) {
    return new Response('Introuvable', { status: 404 });
  }

  const ligne = await uneLigne<{ contenu: Buffer }>(
    `select p.contenu
       from photo_emplacement p
       join emplacement e on e.id = p.emplacement_id
      where e.reference = $1 and p.rang = $2
        and (e.publie or e.membre_id = $3)`,
    [reference, numero, membre.id],
  );
  if (!ligne) return new Response('Introuvable', { status: 404 });

  return new Response(new Uint8Array(ligne.contenu), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
