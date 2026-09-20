import type { Metadata } from 'next';
import { Manrope, Source_Serif_4 } from 'next/font/google';
import Link from 'next/link';

import { textes } from '@/lib/i18n/langue';

import './(reseau)/systeme.css';

/**
 * La réponse aux adresses qui n'existent pas.
 *
 * Tant que deux racines coexistent, une adresse inconnue n'appartient à
 * aucune : cette page porte donc son propre document.
 */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--police-manrope',
  display: 'swap',
});

// Police variable : l'axe de taille optique (opsz) exige de ne pas fixer les
// graisses, que la police variable couvre toutes.
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--police-source-serif',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: `${p('Cette page est introuvable.')} · Bike Sitters` };
}

export default async function PageIntrouvable() {
  const { langue, p } = await textes();

  return (
    <html
      lang={langue}
      className={`${manrope.variable} ${sourceSerif.variable}`}
    >
      <body>
        <div className="site">
          <main className="screen">
            <nav className="nav" aria-label={p('Navigation principale')}>
              <Link href="/" className="brand">
                Bike Sitters
              </Link>
            </nav>
            <div className="empty">
              <span className="big" aria-hidden="true">
                ?
              </span>
              <h1
                className="titre-de-carte"
                style={{ fontSize: 'inherit', fontWeight: 400 }}
              >
                {p('Cette page est introuvable.')}
              </h1>
              {p('Le lien est peut-être ancien, ou l’adresse a changé.')}
            </div>
            <div className="pad" style={{ maxWidth: 420, margin: '0 auto' }}>
              <Link href="/" className="btn primary">
                {p('Revenir à l’accueil')}
              </Link>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
