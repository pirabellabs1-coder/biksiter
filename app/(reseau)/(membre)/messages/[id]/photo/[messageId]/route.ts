import { lireUnePhotoDeMessage } from '@/lib/depot/photos';
import { membreConnecte } from '@/lib/session';

export const dynamic = 'force-dynamic';

const EST_UUID = /^[0-9a-f-]{36}$/;

/**
 * Sert la photo jointe à un message, aux deux participants de la conversation
 * seulement. La photo a été ré-encodée à l'arrivée : elle ne porte plus de
 * métadonnées EXIF, coordonnées GPS comprises (règle 4).
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> },
): Promise<Response> {
  const membre = await membreConnecte();
  if (!membre) return new Response('Introuvable', { status: 404 });

  const { id, messageId } = await params;
  if (!EST_UUID.test(id) || !EST_UUID.test(messageId)) {
    return new Response('Introuvable', { status: 404 });
  }

  const contenu = await lireUnePhotoDeMessage(membre.id, id, messageId);
  if (!contenu) return new Response('Introuvable', { status: 404 });

  return new Response(new Uint8Array(contenu), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'private, max-age=3600',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
