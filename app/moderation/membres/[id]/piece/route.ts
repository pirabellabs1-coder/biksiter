import { lirePourModeration } from '@/lib/depot/pieces';
import { membreConnecte } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Sert la pièce d'identité déchiffrée, à un modérateur et à lui seul.
 *
 * Deux détails qui comptent :
 *   - on répond 404 et non 403 à qui n'a rien à faire ici. Un « accès refusé »
 *     confirmerait que ce membre a déposé une pièce ;
 *   - rien n'est mis en cache, nulle part. Un document d'identité n'a pas à
 *     survivre dans le cache d'un navigateur ou d'un intermédiaire.
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const introuvable = new Response('Introuvable', {
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  });

  const moderateur = await membreConnecte();
  if (!moderateur?.moderateur) {
    return introuvable;
  }

  const { id } = await params;
  const piece = await lirePourModeration(id);

  if (!piece) {
    return introuvable;
  }

  return new Response(new Uint8Array(piece.contenu), {
    headers: {
      'Content-Type': piece.typeMime,
      'Content-Disposition': 'inline; filename="piece-didentite"',
      'Cache-Control': 'no-store, private, max-age=0, must-revalidate',
      // Le document ne doit rien pouvoir exécuter, même si un fichier passait
      // au travers de la liste des types acceptés.
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
