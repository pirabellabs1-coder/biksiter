'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { Icone, type NomDIcone } from '@/components/app/icone';

const RUBRIQUES: readonly {
  ancre: string;
  titre: string;
  texte: string;
  icone: NomDIcone;
}[] = [
  {
    ancre: 'vie-du-reseau',
    titre: 'Vie du réseau',
    texte: 'Quartiers, nouveautés, retours des membres',
    icone: 'utilisateurs',
  },
  {
    ancre: 'conseils',
    titre: 'Conseils',
    texte: 'Préparer une garde, choisir un antivol',
    icone: 'cadenas',
  },
  {
    ancre: 'portraits',
    titre: 'Portraits',
    texte: 'Cyclistes et bike sitters racontent',
    icone: 'profil',
  },
  {
    ancre: 'bruxelles-a-velo',
    titre: 'Bruxelles à vélo',
    texte: 'Itinéraires, saisons, bonnes adresses',
    icone: 'velo',
  },
];

const SUJETS: readonly (readonly [string, string])[] = [
  ['Vie du réseau', 'Pourquoi un réseau d’entraide pour garder les vélos'],
  ['Conseils', 'Préparer son vélo avant une garde'],
  ['Portraits', 'Une première garde, racontée par un bike sitter'],
];

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
      if (evenement.key !== 'Escape') return;
      setOuvert(false);
      // Le focus revient au bouton « Blog » plutôt que de tomber sur la page.
      conteneurRef.current
        ?.querySelector<HTMLButtonElement>('.mega-declencheur')
        ?.focus();
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
        aria-label="Sections du blog"
        hidden={!ouvert}
      >
        <div className="mega-int">
          <div className="mega-col rubriques">
            <h3>Rubriques</h3>
            <ul>
              {RUBRIQUES.map((rubrique) => (
                <li key={rubrique.ancre}>
                  <Link href={`/blog#${rubrique.ancre}`}>
                    <span className="pastille" aria-hidden="true">
                      <Icone nom={rubrique.icone} taille={16} strokeWidth={2} />
                    </span>
                    <span>
                      <b>{rubrique.titre}</b>
                      <em>{rubrique.texte}</em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mega-col recents">
            <h3>Premiers sujets</h3>
            <ul>
              {SUJETS.map(([rubrique, titre]) => (
                <li key={titre}>
                  <Link href="/blog#titre-sujets">
                    <em>{rubrique}</em>
                    <b>{titre}</b>
                    <span>En préparation</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/blog" className="mega-col alaune">
            <span className="alaune-etiquette">Bientôt</span>
            <div className="alaune-visuel" aria-hidden="true">
              <span className="alaune-degrade" />
              <span className="alaune-glyphe">Bs</span>
            </div>
            <h4>Le journal du réseau arrive bientôt.</h4>
            <p>
              Une chronique du réseau, des conseils pratiques et des portraits
              de cyclistes et de bike sitters.
            </p>
            <span className="alaune-lire">Découvrir les rubriques</span>
          </Link>
        </div>

        <div className="mega-pied">
          <Link href="/blog" className="mega-tout">
            Voir le journal
          </Link>
          <span className="mega-note">
            Les premiers billets paraîtront ici.
          </span>
        </div>
      </div>
    </li>
  );
}
