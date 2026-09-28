'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

/**
 * Le bouton d'un formulaire qui part vers le serveur : il dit qu'il travaille
 * et ne se laisse pas toucher deux fois. Sur un geste de garde (arriver,
 * récupérer, accepter), un second toucher renverrait le geste pendant que le
 * premier est encore en route.
 */
export function BoutonDEnvoi({
  className,
  enCours = 'Un instant…',
  children,
}: {
  className?: string;
  /** Ce que dit le bouton pendant l'envoi. */
  enCours?: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending ? enCours : children}
    </button>
  );
}
