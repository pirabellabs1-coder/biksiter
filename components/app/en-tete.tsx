import Link from 'next/link';
import type { ReactNode } from 'react';

import type { Textes } from '@/lib/i18n/langue';

import { Icone } from './icone';
import { Logo } from './logo';

/**
 * L'en-tête d'un écran : la marque et la cloche des notifications sur les
 * écrans principaux, un retour et la marque sur les écrans qu'on ouvre depuis
 * un autre.
 */
export function EnTete({
  p,
  retour,
  notificationsNonLues = 0,
  cloche = true,
  children,
}: {
  p: Textes['p'];
  /** L'écran d'où l'on vient ; sans lui, l'écran est un écran principal. */
  retour?: string;
  notificationsNonLues?: number;
  cloche?: boolean;
  /** Des actions en plus, à droite. */
  children?: ReactNode;
}) {
  return (
    <header className="entete">
      {retour ? (
        <Link href={retour} className="entete-retour" aria-label={p('Revenir')}>
          <Icone nom="retour" taille={24} />
        </Link>
      ) : null}
      <Link href="/accueil" className="entete-marque">
        <Logo taille={retour ? 34 : 40} />
        Bike Sitters
      </Link>
      <div className="entete-actions">
        {children}
        {cloche ? (
          <Link
            href="/notifications"
            className="entete-bouton"
            aria-label={
              notificationsNonLues > 0
                ? p('Notifications, {n} non lues', { n: notificationsNonLues })
                : p('Notifications')
            }
          >
            <Icone nom="cloche" taille={24} />
            {notificationsNonLues > 0 ? (
              <span className="point-rouge" aria-hidden="true" />
            ) : null}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
