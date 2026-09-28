'use client';

import { useRef } from 'react';

import { Icone } from '@/components/app/icone';

/**
 * Une photo qu'on touche pour la voir en grand : dans une bulle de message,
 * dans un dossier de modération. Elle s'ouvre par-dessus l'écran et se ferme
 * d'un geste — sans quitter l'application pour un onglet d'image brute.
 */
export function PhotoAgrandissable({
  src,
  alt,
  fermer = 'Fermer la photo',
  classe = 'bulle-photo',
}: {
  src: string;
  alt: string;
  fermer?: string;
  /** La vignette : une bulle de message, ou une photo de dossier. */
  classe?: string;
}) {
  const fenetre = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className={classe}
        onClick={() => fenetre.current?.showModal()}
        aria-label={alt}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" />
      </button>
      <dialog
        ref={fenetre}
        className="photo-en-grand"
        aria-label={alt}
        onClick={(evenement) => {
          // Un clic à côté de l'image referme, comme un glissement sur iPhone.
          if (evenement.target === evenement.currentTarget) {
            fenetre.current?.close();
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
        <form method="dialog">
          <button type="submit" className="photo-en-grand-fermer" aria-label={fermer}>
            <Icone nom="croix" taille={22} strokeWidth={2.2} />
          </button>
        </form>
      </dialog>
    </>
  );
}
