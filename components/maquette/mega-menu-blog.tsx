'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * Le méga menu du blog.
 *
 * Sur bureau, un panneau qui s'ouvre sous « Blog » au survol ou au clic, et
 * qui expose trois colonnes : les rubriques, les articles à la une, et un
 * article mis en avant avec sa vignette.
 *
 * L'ouverture au survol reste plaisante à la souris, mais la même mécanique
 * est déclenchable au clavier (Entrée/Espace) et par le tap tactile. Un délai
 * court à la fermeture au survol évite de perdre la cible en glissant d'un
 * élément à l'autre.
 */
export function MegaMenuBlog() {
  const [ouvert, setOuvert] = useState(false);
  const idPanneau = useId();
  const delaiFermeture = useRef<number | null>(null);
  const conteneurRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!ouvert) return;

    function auClavier(evenement: KeyboardEvent) {
      if (evenement.key === 'Escape') setOuvert(false);
    }

    function auClic(evenement: MouseEvent) {
      if (!conteneurRef.current?.contains(evenement.target as Node)) {
        setOuvert(false);
      }
    }

    document.addEventListener('keydown', auClavier);
    document.addEventListener('click', auClic);
    return () => {
      document.removeEventListener('keydown', auClavier);
      document.removeEventListener('click', auClic);
    };
  }, [ouvert]);

  function survolerOuvre() {
    if (delaiFermeture.current !== null) {
      window.clearTimeout(delaiFermeture.current);
      delaiFermeture.current = null;
    }
    setOuvert(true);
  }

  function survolerFerme() {
    delaiFermeture.current = window.setTimeout(() => setOuvert(false), 180);
  }

  return (
    <li
      ref={conteneurRef}
      className={`mega ${ouvert ? 'mega-ouvert' : ''}`}
      onMouseEnter={survolerOuvre}
      onMouseLeave={survolerFerme}
    >
      <button
        type="button"
        className="mega-declencheur"
        aria-haspopup="true"
        aria-expanded={ouvert}
        aria-controls={idPanneau}
        onClick={(evenement) => {
          evenement.stopPropagation();
          setOuvert((etat) => !etat);
        }}
      >
        Blog
        <span className="mega-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      <div
        id={idPanneau}
        className="mega-panneau"
        role="menu"
        aria-label="Sections du blog"
        hidden={!ouvert}
      >
        <div className="mega-int">
          <div className="mega-col rubriques">
            <h3>Rubriques</h3>
            <ul>
              <li>
                <Link href="/blog#vie-du-reseau" role="menuitem">
                  <span className="pastille" aria-hidden="true">
                    ✦
                  </span>
                  <span>
                    <b>Vie du réseau</b>
                    <em>Chroniques, événements, chiffres</em>
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/blog#conseils" role="menuitem">
                  <span className="pastille" aria-hidden="true">
                    ✿
                  </span>
                  <span>
                    <b>Conseils</b>
                    <em>Préparer une garde, choisir un cadenas</em>
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/blog#portraits" role="menuitem">
                  <span className="pastille" aria-hidden="true">
                    ☺
                  </span>
                  <span>
                    <b>Portraits</b>
                    <em>Bike sitters et cyclistes du quartier</em>
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/blog#bruxelles-a-velo" role="menuitem">
                  <span className="pastille" aria-hidden="true">
                    ⌂
                  </span>
                  <span>
                    <b>Bruxelles à vélo</b>
                    <em>Itinéraires, quartiers, saisons</em>
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mega-col recents">
            <h3>Derniers articles</h3>
            <ul>
              <li>
                <Link href="/blog" role="menuitem">
                  <em>Portrait</em>
                  <b>Une première garde place Flagey</b>
                  <span>3 min de lecture</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" role="menuitem">
                  <em>Conseils</em>
                  <b>Préparer son vélo avant une garde</b>
                  <span>4 min de lecture</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" role="menuitem">
                  <em>Vie du réseau</em>
                  <b>Dix quartiers, dix accueils différents</b>
                  <span>6 min de lecture</span>
                </Link>
              </li>
            </ul>
          </div>

          <Link
            href="/blog"
            className="mega-col alaune"
            role="menuitem"
          >
            <span className="alaune-etiquette">À la une</span>
            <div className="alaune-visuel" aria-hidden="true">
              <span className="alaune-degrade" />
              <span className="alaune-glyphe">Bs</span>
            </div>
            <h4>Pourquoi un réseau plutôt qu’une application de plus.</h4>
            <p>
              Le manifeste du projet, en cinq minutes de lecture — ce qu’on
              construit et ce qu’on refuse de construire.
            </p>
            <span className="alaune-lire">
              Lire l’article →
            </span>
          </Link>
        </div>

        <div className="mega-pied">
          <Link href="/blog" className="mega-tout">
            Voir tous les articles →
          </Link>
          <span className="mega-note">
            Un billet par semaine, rédigé par l’équipe.
          </span>
        </div>
      </div>
    </li>
  );
}
