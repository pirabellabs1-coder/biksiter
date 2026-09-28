'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * L'écran de celui qui montre le code se met à jour tout seul : dès que
 * l'autre a saisi le code, il passe à la suite sans qu'on ait à recharger.
 */
export function Rafraichir({ secondes }: { secondes: number }) {
  const routeur = useRouter();
  useEffect(() => {
    const minuterie = window.setInterval(
      () => routeur.refresh(),
      secondes * 1000,
    );
    return () => window.clearInterval(minuterie);
  }, [routeur, secondes]);
  return null;
}
