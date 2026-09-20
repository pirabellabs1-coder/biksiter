import { NextResponse, type NextRequest } from 'next/server';

import { ouvrirUneNotification } from '@/lib/depot/notifications';
import { membreConnecte } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Une notification est une porte : l'ouvrir la marque lue et mène à l'écran
 * dont elle parle. Le lien est relu en base, jamais pris dans l'adresse.
 */
export async function GET(
  requete: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const membre = await membreConnecte();
  const { id } = await params;
  if (!membre) return NextResponse.redirect(new URL('/bienvenue', requete.url));
  const lien = /^[0-9a-f-]{36}$/.test(id)
    ? await ouvrirUneNotification(membre.id, id)
    : null;
  // Le lien a été vérifié à l'écriture (chemin du site uniquement).
  const destination =
    lien && lien.startsWith('/') && !lien.startsWith('//')
      ? lien
      : '/notifications';
  return NextResponse.redirect(new URL(destination, requete.url), 303);
}
