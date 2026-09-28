import { roleDansLaGarde } from '@/lib/depot/gardes';
import { exigerUnMembre } from '@/lib/session';

/**
 * Le cadre des écrans d'une garde.
 *
 * L'adresse `/gardes/…` ne dit pas de quel côté on se trouve : le bike sitter
 * qui ouvre une demande reçue repassait en « Cycliste », avec la barre du bas
 * du cycliste. Le cadre annonce le rôle du membre dans cette garde, et la
 * barre de navigation le suit sur tous les écrans de la garde.
 */
export default async function CadreDeLaGarde({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const [membre, { id }] = await Promise.all([exigerUnMembre(), params]);
  const role = await roleDansLaGarde(membre.id, id);
  const cote =
    role === 'bike_sitter' ? 'sitter' : role === 'cycliste' ? 'cycliste' : null;

  return (
    <>
      {cote ? <span hidden data-cote={cote} /> : null}
      {children}
    </>
  );
}
