import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google';

import EnTete from '@/components/en-tete';
import PiedDePage from '@/components/pied-de-page';

import './systeme.css';

const policeDesTitres = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--police-titres',
  display: 'swap',
});

const policeDuTexte = Instrument_Sans({
  subsets: ['latin'],
  variable: '--police-texte',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Bike Sitters — votre vélo à l’abri, chez un voisin',
    template: '%s · Bike Sitters',
  },
  description:
    'Un réseau d’entraide entre cyclistes à Bruxelles : des habitants accueillent gratuitement votre vélo chez eux, dans un emplacement privé, le temps qu’il faut.',
};

export default function RacineDuSite({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${policeDesTitres.variable} ${policeDuTexte.variable}`}
    >
      <body>
        <a className="evitement" href="#contenu">
          Aller au contenu
        </a>
        <EnTete />
        <main id="contenu">{children}</main>
        <PiedDePage />
      </body>
    </html>
  );
}
