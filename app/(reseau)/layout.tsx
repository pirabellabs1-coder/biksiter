import type { Metadata } from 'next';
import { Source_Serif_4 } from 'next/font/google';

import { HautDePage } from '@/components/app/haut-de-page';
import { BarresDuBas } from '@/components/maquette/tabbar';
import { membreAUnEmplacement } from '@/lib/depot/lieux';
import { langueCourante } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import { membreConnecte } from '@/lib/session';

import './systeme.css';
import './maquettes.css';
import './maquette-167.css';
import './maquette-liens.css';
import './parcours-de-la-demande.css';
import './hero-et-menu.css';
import './blog.css';
import './ux-ameliorations.css';
// Le texte de l'interface suit la police du système (SF Pro sur iPhone) :
// cette feuille redirige les variables de police des maquettes vers elle.
import './design-premium.css';

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
  const mode = await modeCourant();
  const membre = await membreConnecte();

  // La maquette bascule ses deux barres du bas sur `body[data-mode]`, et
  // remplace « Bike Sitter » par « Devenir BS » sur `body[data-sitter="non"]`.
  // On pose donc les mêmes attributs, pour que sa feuille de style s'applique
  // telle quelle.
  const aUnEmplacement = membre ? await membreAUnEmplacement(membre.id) : false;

  return (
    <html
      lang={langue}
      className={sourceSerif.variable}
    >
      <body
        data-mode={mode === 'bike_sitter' ? 'sitter' : 'cycliste'}
        data-mode-choisi={mode === 'bike_sitter' ? 'sitter' : 'cycliste'}
        data-sitter={aUnEmplacement ? 'oui' : 'non'}
      >
        <HautDePage />
        {children}
        {/* La maquette pose ses deux barres du bas en fin de document, hors
            des écrans. On fait pareil — elles ne servent qu'à un membre. */}
        {membre ? <BarresDuBas /> : null}
      </body>
    </html>
  );
}
