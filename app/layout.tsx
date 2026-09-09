import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google';

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

/**
 * Tout le site est rendu à la requête, et c'est la Content-Security-Policy qui
 * l'exige.
 *
 * La CSP autorise les scripts par un nonce, qui change à chaque requête. Une
 * page prérendue à la compilation ne peut pas en porter : elle partirait avec
 * tous ses scripts bloqués. On a donc le choix entre garder une dizaine de
 * pages éditoriales statiques et affaiblir la politique pour tout le monde, ou
 * rendre à la requête et garder une politique stricte partout.
 *
 * On rend à la requête. Ces pages ne touchent pas la base et coûtent quelques
 * millisecondes ; une CSP qui vaut sur certaines pages et pas sur d'autres
 * coûte bien plus cher à raisonner — surtout sur un site qui manipule des
 * pièces d'identité.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Bike Sitters — votre vélo à l’abri, chez un voisin',
    template: '%s · Bike Sitters',
  },
  description:
    'Un réseau d’entraide entre cyclistes à Bruxelles : des habitants accueillent gratuitement votre vélo chez eux, dans un emplacement privé, le temps qu’il faut.',
};

/**
 * La racine ne pose que le document.
 *
 * Le site public et l'espace du membre n'ont pas la même enveloppe — l'un a un
 * en-tête de marque et un grand pied de page, l'autre une colonne de
 * navigation et aucun pied. Chacun a donc sa propre mise en page, dans
 * `app/(site)` et `app/(espace)`. Les parenthèses ne changent rien aux
 * adresses : `/mon-compte` reste `/mon-compte`.
 */
export default function RacineDuSite({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${policeDesTitres.variable} ${policeDuTexte.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
