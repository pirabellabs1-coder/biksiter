'use client';

import { useState } from 'react';

/**
 * Le visage d'un membre : sa photo de profil s'il en a mis une, sinon
 * l'initiale de son prénom sur un rond teinté. La photo est décorative à côté
 * du nom écrit : `alt` vide, le nom se lit juste à côté.
 *
 * Si la photo ne peut pas être servie à ce lecteur (un blocage, un membre
 * qu'il ne connaît pas), l'initiale reprend sa place plutôt qu'un rond vide.
 */
export function Avatar({
  membreId,
  prenom,
  version,
  taille = 44,
  className,
}: {
  membreId: string;
  prenom: string;
  /** La version de la photo (voir `VERSION_DE_LA_PHOTO`), ou null. */
  version: number | string | null | undefined;
  taille?: number;
  className?: string;
}) {
  const [echec, setEchec] = useState(false);
  const classes = ['avatar-membre', className].filter(Boolean).join(' ');
  return (
    <span
      className={classes}
      style={{ width: taille, height: taille, fontSize: Math.round(taille * 0.4) }}
      aria-hidden="true"
    >
      {version && !echec ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/membres/${membreId}/photo?v=${version}`}
          alt=""
          width={taille}
          height={taille}
          decoding="async"
          onError={() => setEchec(true)}
        />
      ) : (
        prenom.charAt(0).toUpperCase()
      )}
    </span>
  );
}
