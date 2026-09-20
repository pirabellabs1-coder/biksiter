import { photoDeConstatPourModeration } from '@/lib/depot/gestion';
import { estUnRangDePhoto } from '@/lib/regles/constat';
import { membreConnecte } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Sert une photo de constat à une personne qui modère, pour trancher un
 * litige. Comme pour les pièces d'identité, on répond 404 à qui n'a rien à
 * faire ici.
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string; phase: string; rang: string }> },
): Promise<Response> {
  const introuvable = new Response('Introuvable', {
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  });
  const moderateur = await membreConnecte();
  if (!moderateur?.moderateur) return introuvable;

  const { id, phase, rang } = await params;
  const numero = /^[0-9]$/.test(rang) ? Number(rang) : -1;
  if ((phase !== 'depot' && phase !== 'reprise') || !estUnRangDePhoto(numero)) {
    return introuvable;
  }
  const contenu = await photoDeConstatPourModeration(id, phase, numero);
  if (!contenu) return introuvable;
  return new Response(new Uint8Array(contenu), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'no-store, private',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
