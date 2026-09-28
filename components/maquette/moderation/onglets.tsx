import Link from 'next/link';

import type { Textes } from '@/lib/i18n/langue';

export type OngletDeModeration =
  | 'tableau'
  | 'verifications'
  | 'signalements'
  | 'litiges'
  | 'membres'
  | 'catalogue'
  | 'statistiques';

const RUBRIQUES: { cle: OngletDeModeration; href: string; titre: string }[] = [
  { cle: 'tableau', href: '/administration', titre: 'Tableau de bord' },
  { cle: 'verifications', href: '/administration/verifications', titre: 'Vérifications' },
  { cle: 'signalements', href: '/administration/signalements', titre: 'Signalements' },
  { cle: 'litiges', href: '/administration/litiges', titre: 'Litiges' },
  { cle: 'membres', href: '/administration/membres', titre: 'Membres' },
  { cle: 'catalogue', href: '/administration/catalogue', titre: 'Catalogue' },
  { cle: 'statistiques', href: '/administration/statistiques', titre: 'Statistiques' },
];

/**
 * Les rubriques de la modération, présentées comme les `.tabs` de la maquette.
 *
 * Chaque onglet est un vrai lien : l'écran change de page, pas de vue. La
 * mise en forme reprend celle de l'écran `#moderation` — un onglet actif
 * hérite de la couleur et du soulignement définis dans la feuille.
 */
export function OngletsDeModeration({
  p,
  actif,
}: {
  p: Textes['p'];
  actif: OngletDeModeration;
}) {
  return (
    <div
      className="tabs onglets-moderation"
      role="tablist"
      aria-label={p('Rubriques de modération')}
    >
      {RUBRIQUES.map((rubrique) => (
        <Link
          key={rubrique.cle}
          href={rubrique.href}
          role="tab"
          className={rubrique.cle === actif ? 'active' : undefined}
          aria-selected={rubrique.cle === actif ? 'true' : 'false'}
          aria-current={rubrique.cle === actif ? 'page' : undefined}
        >
          {p(rubrique.titre)}
        </Link>
      ))}
    </div>
  );
}
