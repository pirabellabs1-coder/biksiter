'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Le bandeau de confirmation des maquettes définitives.
 *
 * La maquette confirmait chaque geste par un court message qui s'efface seul,
 * plutôt que par une page de plus. Le message est annoncé aux lecteurs
 * d'écran : sans cela, le geste n'aurait de retour que visuel.
 */

/** Durée d'affichage, reprise de la maquette. */
const DUREE_MS = 2800;

export function useAvertissement(): [string | null, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null);
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (minuterie.current) clearTimeout(minuterie.current);
    },
    [],
  );

  const avertir = useCallback((texte: string) => {
    if (minuterie.current) clearTimeout(minuterie.current);
    setMessage(texte);
    minuterie.current = setTimeout(() => setMessage(null), DUREE_MS);
  }, []);

  return [message, avertir];
}

export function Avertisseur({ message }: { message: string | null }) {
  return (
    <div
      className={message ? 'toast show' : 'toast'}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
