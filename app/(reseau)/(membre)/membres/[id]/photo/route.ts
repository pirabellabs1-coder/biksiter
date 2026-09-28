import { lirePhotoDeProfil } from '@/lib/depot/photo-de-profil';
import { membreConnecte } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Sert la photo de profil d'un membre, aux membres connectés seulement. Un
 * visiteur ne voit aucun visage : le réseau ne se parcourt qu'une fois inscrit.
 *
 * L'adresse porte la version de la photo (`?v=`) : on peut donc la garder en
 * cache longtemps, une nouvelle photo change d'adresse.
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const lecteur = await membreConnecte();
  if (!lecteur) return new Response('Introuvable', { status: 404 });

  const { id } = await params;
  const contenu = await lirePhotoDeProfil(lecteur.id, id);
  if (!contenu) return new Response('Introuvable', { status: 404 });

  return new Response(new Uint8Array(contenu), {
    headers: {
      'Content-Type': 'image/webp',
      // Courte durée : quelqu'un qui vient d'être bloqué ne doit pas garder
      // le visage en cache une journée. L'adresse porte la version : une
      // photo changée se recharge de toute façon.
      'Cache-Control': 'private, max-age=600',
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  });
}
