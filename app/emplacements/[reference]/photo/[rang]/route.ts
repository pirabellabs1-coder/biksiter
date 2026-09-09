import { lireUnePhoto } from '@/lib/depot/photos';
import { estUnRangValide } from '@/lib/regles/photos';

export const dynamic = 'force-dynamic';

/**
 * Sert une photo d'emplacement.
 *
 * Publique, comme la fiche : ce sont des photos qu'un bike sitter a choisi de
 * montrer. Elles ont été ré-encodées à l'arrivée, donc elles ne portent plus
 * de coordonnées GPS — c'est le dépôt qui garantit ce point, pas cette route.
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ reference: string; rang: string }> },
): Promise<Response> {
  const { reference, rang } = await params;
  const numero = Number.parseInt(rang, 10);

  if (!estUnRangValide(numero)) {
    return new Response('Introuvable', { status: 404 });
  }

  const contenu = await lireUnePhoto(reference, numero);
  if (!contenu) {
    return new Response('Introuvable', { status: 404 });
  }

  return new Response(new Uint8Array(contenu), {
    headers: {
      'Content-Type': 'image/webp',
      // Une photo change rarement, et la page qui la porte est déjà dynamique.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
