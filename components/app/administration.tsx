import Link from 'next/link';

import type { Textes } from '@/lib/i18n/langue';

const RUBRIQUES = [
  { cle: 'tableau', href: '/administration', titre: 'Tableau de bord' },
  {
    cle: 'verifications',
    href: '/administration/verifications',
    titre: 'Vérifications',
  },
  {
    cle: 'signalements',
    href: '/administration/signalements',
    titre: 'Signalements',
  },
  { cle: 'litiges', href: '/administration/litiges', titre: 'Litiges' },
  { cle: 'membres', href: '/administration/membres', titre: 'Membres' },
  { cle: 'catalogue', href: '/administration/catalogue', titre: 'Catalogue' },
  {
    cle: 'statistiques',
    href: '/administration/statistiques',
    titre: 'Statistiques',
  },
] as const;

export type RubriqueDAdministration = (typeof RUBRIQUES)[number]['cle'];

/** Les rubriques de l'administration, en onglets sous le titre de l'écran. */
export function NavigationDAdministration({
  p,
  actif,
}: {
  p: Textes['p'];
  actif: RubriqueDAdministration;
}) {
  return (
    <nav className="onglets-haut" aria-label={p('Administration')}>
      {RUBRIQUES.map((rubrique) => (
        <Link
          key={rubrique.cle}
          href={rubrique.href}
          aria-current={rubrique.cle === actif ? 'page' : undefined}
        >
          {p(rubrique.titre)}
        </Link>
      ))}
    </nav>
  );
}
