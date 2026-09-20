import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';

import { langueCourante } from '@/lib/i18n/langue';

import './systeme.css';
import './maquettes.css';

/**
 * La racine du site.
 *
 * Tant que les écrans de l'ancien site ne sont pas tous remplacés, ils vivent
 * sous une racine à part (`app/(ancien)`) : leurs classes portent les mêmes
 * noms (`.card`, `.btn`…). Deux racines distinctes font recharger la page
 * quand on passe de l'une à l'autre, et les deux feuilles ne se rencontrent
 * jamais.
 */
// Police variable : l'axe de taille optique (opsz) exige de ne pas fixer les
// graisses, que la police variable couvre toutes. Elle donne leur voix aux
// grands titres du site public.
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--police-source-serif',
  display: 'swap',
});

// La police de l'interface : titres gras, texte net sur les petits écrans.
// La serif sert aux grands titres du site public.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--police-inter',
  display: 'swap',
});

/** Rendu à la requête : la Content-Security-Policy porte un nonce par requête. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Bike Sitters',
    template: '%s · Bike Sitters',
  },
  description:
    'Des habitants près de chez vous accueillent gratuitement votre vélo dans un espace privé et sécurisé, le temps d’une course ou d’une journée.',
};

export default async function Racine({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const langue = await langueCourante();

  return (
    <html
      lang={langue}
      className={`${inter.variable} ${sourceSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
