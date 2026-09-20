'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Un écran qui n'a pas pu s'afficher. Il reste dans l'application, avec ses
 * onglets, et propose de réessayer : la plupart du temps, c'était le réseau.
 *
 * Un composant client ne lit pas la langue côté serveur : il la reprend de la
 * page, où la mise en page l'a posée.
 */
const TEXTES = {
  fr: {
    titre: 'Cet écran n’a pas pu s’afficher',
    explication:
      'La connexion a peut-être été interrompue. Rien de ce que vous aviez déjà enregistré n’est perdu.',
    reessayer: 'Réessayer',
    activite: 'Voir mon activité',
  },
  nl: {
    titre: 'Dit scherm kon niet worden weergegeven',
    explication:
      'De verbinding is misschien onderbroken. Wat u al had opgeslagen, blijft bewaard.',
    reessayer: 'Opnieuw proberen',
    activite: 'Mijn activiteit bekijken',
  },
  en: {
    titre: 'This screen could not be displayed',
    explication:
      'The connection may have been interrupted. Nothing you had already saved is lost.',
    reessayer: 'Try again',
    activite: 'View my activity',
  },
} as const;

export default function ErreurDeLEspace({ reset }: { reset: () => void }) {
  const [langue, setLangue] = useState<keyof typeof TEXTES>('fr');

  useEffect(() => {
    const lang = document.documentElement.lang;
    if (lang === 'nl' || lang === 'en') setLangue(lang);
  }, []);

  const t = TEXTES[langue];
  return (
    <main id="contenu" className="ecran-membre">
      <header className="topbar">
        <h1>{t.titre}</h1>
      </header>
      <div className="pad">
        <div className="banner alert" role="alert">
          {t.explication}
        </div>
      </div>
      <div className="footer">
        <button type="button" className="btn primary" onClick={reset}>
          {t.reessayer}
        </button>
        <Link href="/gardes" className="btn ghost">
          {t.activite}
        </Link>
      </div>
    </main>
  );
}
