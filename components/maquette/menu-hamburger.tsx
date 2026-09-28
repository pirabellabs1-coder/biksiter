'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Le menu hamburger — présent uniquement sous 900 px.
 *
 * Un panneau qui glisse depuis la droite, portant la navigation du site et
 * les actions de compte. Il se ferme au clic sur le voile, à la touche
 * Échap, et à l'ouverture d'un lien. Le bouton porte `aria-expanded` et
 * `aria-controls` : un lecteur d'écran l'annonce comme le contrôle du
 * panneau qu'il ouvre.
 */
export function MenuHamburger({
  membre,
}: {
  membre: { prenom: string; nom: string } | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [monte, setMonte] = useState(false);
  const idPanneau = useId();
  const boutonRef = useRef<HTMLButtonElement>(null);
  const premierLienRef = useRef<HTMLAnchorElement>(null);

  // La barre du haut porte `backdrop-filter`, qui crée un bloc contenant pour
  // les descendants en `position: fixed`. Le panneau serait alors borné à la
  // hauteur de la barre. On l'envoie donc à la racine du document par un
  // portail — mais seulement après le premier rendu, pour rester compatible
  // avec le rendu serveur.
  useEffect(() => {
    setMonte(true);
  }, []);

  useEffect(() => {
    if (!ouvert) return;

    // Le focus va sur le premier lien, pour que le clavier prenne la relève.
    premierLienRef.current?.focus();

    document.body.classList.add('menu-hamburger-ouvert');

    function auClavier(evenement: KeyboardEvent) {
      if (evenement.key === 'Escape') {
        setOuvert(false);
        boutonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', auClavier);
    return () => {
      document.body.classList.remove('menu-hamburger-ouvert');
      document.removeEventListener('keydown', auClavier);
    };
  }, [ouvert]);

  function fermer() {
    setOuvert(false);
  }

  const panneau = (
    <>
      <div
        className="hamburger-voile"
        hidden={!ouvert}
        onClick={fermer}
        aria-hidden="true"
      />

      <div
        id={idPanneau}
        className={`hamburger-panneau ${ouvert ? 'ouvert' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!ouvert}
      >
        <nav aria-label="Navigation">
          <Link
            ref={premierLienRef}
            href="/comment-ca-marche"
            onClick={fermer}
          >
            Comment ça marche
          </Link>
          <Link href="/securite" onClick={fermer}>
            Sécurité
          </Link>
          <Link href="/blog" onClick={fermer}>
            Blog
          </Link>
          <Link href="/a-propos" onClick={fermer}>
            À propos
          </Link>
          <Link href="/faq" onClick={fermer}>
            Questions fréquentes
          </Link>
          <Link href="/contact" onClick={fermer}>
            Nous écrire
          </Link>
        </nav>

        <div className="hamburger-actions">
          {membre ? (
            <>
              <Link
                className="primary"
                href="/gardes"
                onClick={fermer}
              >
                Mes gardes
              </Link>
              <Link className="outline" href="/profil" onClick={fermer}>
                Mon compte
              </Link>
            </>
          ) : (
            <>
              <Link
                className="primary"
                href="/inscription"
                onClick={fermer}
              >
                S’inscrire
              </Link>
              <Link
                className="outline"
                href="/connexion"
                onClick={fermer}
              >
                Se connecter
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        ref={boutonRef}
        type="button"
        className="hamburger"
        aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={ouvert}
        aria-controls={idPanneau}
        onClick={() => setOuvert((etat) => !etat)}
      >
        <span aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>

      {monte ? createPortal(panneau, document.body) : null}
    </>
  );
}
