'use client';

import { useEffect, useState } from 'react';

import { Icone } from '@/components/app/icone';

/**
 * Une confirmation qui flotte sous l'en-tête, puis s'efface d'elle-même.
 *
 * Posée dans le flux, la confirmation d'un enregistrement passait inaperçue
 * quand la page revenait déjà défilée. Flottante, elle se voit toujours ; elle
 * reste lisible par les lecteurs d'écran (`role="status"`).
 */
export function Confirmation({ texte }: { texte: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const entree = requestAnimationFrame(() => setVisible(true));
    const sortie = setTimeout(() => setVisible(false), 4200);
    return () => {
      cancelAnimationFrame(entree);
      clearTimeout(sortie);
    };
  }, []);

  return (
    <div
      className={visible ? 'confirmation-flottante visible' : 'confirmation-flottante'}
      role="status"
    >
      <Icone nom="coche" taille={18} strokeWidth={2.4} />
      <span>{texte}</span>
    </div>
  );
}
