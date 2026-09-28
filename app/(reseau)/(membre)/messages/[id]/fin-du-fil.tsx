'use client';

import { useEffect, useRef } from 'react';

/**
 * Le bas de la conversation : on y arrive en ouvrant la conversation, et on y
 * redescend dès qu'un message s'ajoute — le sien comme celui de l'autre.
 * Sans cela, la page s'ouvrait sur le premier message et la bulle qu'on
 * venait d'envoyer restait cachée sous le champ de saisie.
 */
export function FinDuFil({ nombreDeMessages }: { nombreDeMessages: number }) {
  const ancre = useRef<HTMLDivElement>(null);
  const premiere = useRef(true);

  useEffect(() => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ancre.current?.scrollIntoView({
      block: 'end',
      behavior: premiere.current || reduit ? 'auto' : 'smooth',
    });
    premiere.current = false;
  }, [nombreDeMessages]);

  return <div ref={ancre} className="fin-du-fil" aria-hidden="true" />;
}
