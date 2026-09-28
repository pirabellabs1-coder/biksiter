'use client';

import { useState } from 'react';

/**
 * Les photos de l'emplacement.
 *
 * Une seule vue à la fois, des vignettes en dessous, et les deux flèches
 * atteignables au clavier : la galerie se parcourt sans souris.
 */
export function Galerie({
  vues,
  espace,
}: {
  vues: readonly { titre: string; src: string }[];
  espace: string;
}) {
  const [vue, setVue] = useState(0);
  const total = Math.max(1, vues.length);
  const aller = (pas: number) => setVue((v) => (v + pas + total) % total);

  return (
    <section className="galerie2" data-vue={vue}>
      <div className="g2-scene">
        {vues.map((v, rang) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={v.src}
            className={rang === vue ? 'g2-img actif' : 'g2-img'}
            data-i={rang}
            loading={rang === 0 ? 'eager' : 'lazy'}
            width={860}
            height={560}
            alt={v.titre}
            src={v.src}
          />
        ))}
        <span className="g2-badge">{espace}</span>
        <button
          type="button"
          className="g2-fl g2-prev"
          aria-label="Photo précédente"
          onClick={() => aller(-1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="g2-fl g2-suiv"
          aria-label="Photo suivante"
          onClick={() => aller(1)}
        >
          ›
        </button>
        <span className="g2-compteur">
          <b>{vue + 1}</b>/{vues.length}
        </span>
      </div>
      <div className="g2-vignettes">
        {vues.map((v, rang) => (
          <button
            key={v.src}
            type="button"
            className={rang === vue ? 'g2-v actif' : 'g2-v'}
            data-i={rang}
            aria-label={v.titre}
            aria-current={rang === vue ? 'true' : undefined}
            onClick={() => setVue(rang)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" alt="" width={96} height={72} src={v.src} />
          </button>
        ))}
      </div>
    </section>
  );
}
