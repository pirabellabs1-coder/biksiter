'use client';

import { useRef, useState, type ReactNode } from 'react';

import { VUES_DES_GARDES, type VueDesGardes } from '@/lib/regles/vues-des-gardes';

/**
 * Les trois onglets de « Mes gardes ».
 *
 * La maquette masquait les vues par `hidden` et basculait la classe `active` ;
 * ici l'onglet ouvert est un état de React. Les flèches gauche et droite
 * passent d'un onglet à l'autre, comme l'attend un lecteur d'écran d'une
 * barre d'onglets.
 */
export function OngletsDesGardes({
  raccourcis,
  vues,
  nombres,
  initial = 'avenir',
}: {
  raccourcis: ReactNode;
  vues: Readonly<Record<VueDesGardes, ReactNode>>;
  /** Le nombre de gardes de chaque vue, dit à côté de son titre. */
  nombres: Readonly<Record<VueDesGardes, number>>;
  /** La vue ouverte à l'arrivée : la première qui a quelque chose à montrer. */
  initial?: VueDesGardes;
}) {
  const [ouvert, setOuvert] = useState<VueDesGardes>(initial);
  const barre = useRef<HTMLDivElement>(null);

  function auClavier(evenement: React.KeyboardEvent<HTMLDivElement>) {
    const pas =
      evenement.key === 'ArrowRight' ? 1 : evenement.key === 'ArrowLeft' ? -1 : 0;
    if (pas === 0) return;
    evenement.preventDefault();
    const rang = VUES_DES_GARDES.findIndex((v) => v.cle === ouvert);
    const suivante =
      VUES_DES_GARDES[
        (rang + pas + VUES_DES_GARDES.length) % VUES_DES_GARDES.length
      ]!;
    setOuvert(suivante.cle);
    barre.current
      ?.querySelector<HTMLButtonElement>(`#onglet-${suivante.cle}`)
      ?.focus();
  }

  return (
    <>
      <div
        className="tabs"
        role="tablist"
        aria-label="Mes gardes"
        ref={barre}
        onKeyDown={auClavier}
      >
        {VUES_DES_GARDES.map((vue) => (
          <button
            key={vue.cle}
            type="button"
            id={`onglet-${vue.cle}`}
            className={vue.cle === ouvert ? 'active' : undefined}
            role="tab"
            aria-selected={vue.cle === ouvert}
            aria-controls={`vue-${vue.cle}`}
            tabIndex={vue.cle === ouvert ? 0 : -1}
            onClick={() => setOuvert(vue.cle)}
          >
            {vue.titre}
            {nombres[vue.cle] > 0 && vue.cle !== 'terminees' ? (
              <span className="onglet-nombre">{nombres[vue.cle]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {raccourcis}

      {VUES_DES_GARDES.map((vue) => (
        <div
          key={vue.cle}
          className="vue-garde"
          id={`vue-${vue.cle}`}
          role="tabpanel"
          aria-labelledby={`onglet-${vue.cle}`}
          hidden={vue.cle !== ouvert}
        >
          {vues[vue.cle]}
        </div>
      ))}
    </>
  );
}
