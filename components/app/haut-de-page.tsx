'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Une page nouvelle s'ouvre en haut.
 *
 * Next remet la page en haut après un lien, mais pas après la redirection
 * d'une action serveur : l'étape suivante d'un parcours (les photos du lieu,
 * la remise du vélo) s'ouvrait défilée vers le bas, son titre hors de
 * l'écran. Le retour arrière, lui, garde la position que le navigateur
 * restaure, et une ancre (#…) garde la sienne.
 */
export function HautDePage() {
  const chemin = usePathname();
  const precedent = useRef(chemin);
  // Le chemin atteint par le dernier retour arrière (ou avant) : on ne le
  // compare qu'au chemin qui suit, pour qu'un `popstate` sans changement de
  // page (une ancre, un onglet en paramètre) ne reste pas en mémoire.
  const atteintParLHistorique = useRef<string | null>(null);

  useEffect(() => {
    const surRetour = () => {
      atteintParLHistorique.current = window.location.pathname;
    };
    window.addEventListener('popstate', surRetour);
    return () => window.removeEventListener('popstate', surRetour);
  }, []);

  useEffect(() => {
    if (precedent.current === chemin) return;
    precedent.current = chemin;
    const parLHistorique = atteintParLHistorique.current === chemin;
    atteintParLHistorique.current = null;
    if (parLHistorique || window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [chemin]);

  return null;
}
