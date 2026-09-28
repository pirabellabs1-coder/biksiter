import type { Metadata } from 'next';
import { Source_Serif_4 } from 'next/font/google';

import { EnTete } from '@/components/maquette/en-tete';
import { PageIntrouvable } from '@/components/maquette/page-introuvable';
import { Pied } from '@/components/maquette/pied';
import { langueCourante } from '@/lib/i18n/langue';
import { membreConnecte } from '@/lib/session';

import './(reseau)/systeme.css';
import './(reseau)/maquettes.css';
import './(reseau)/maquette-167.css';
import './(reseau)/maquette-liens.css';
import './(reseau)/hero-et-menu.css';
import './(reseau)/ux-ameliorations.css';
import './(reseau)/design-premium.css';

/**
 * La réponse aux adresses qui n'existent pas.
 *
 * Une adresse inconnue n'appartient à aucune racine : cette page porte donc
 * son propre document. Elle reprend les feuilles, l'en-tête et le pied du
 * site, pour qu'on sache toujours où l'on est et comment repartir.
 */
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--police-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Page introuvable · Bike Sitters',
};

export default async function PageIntrouvableGlobale() {
  const [langue, membre] = await Promise.all([
    langueCourante(),
    membreConnecte(),
  ]);

  return (
    <html lang={langue} className={sourceSerif.variable}>
      <body>
        <div className="cadre-public">
          <EnTete membre={membre} />
          <div className="site">
            <PageIntrouvable membre={Boolean(membre)} />
          </div>
          <Pied membre={membre} />
        </div>
      </body>
    </html>
  );
}
