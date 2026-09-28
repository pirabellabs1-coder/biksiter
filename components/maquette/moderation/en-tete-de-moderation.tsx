import Link from 'next/link';

import { Icone } from '@/components/app/icone';

/**
 * L'en-tête `.app-header` de l'espace de modération.
 *
 * Reprend exactement la structure de l'écran `#moderation` de la maquette :
 * un retour, la marque en petit, le badge « Modération », la cloche, un
 * avatar. Le badge est un simple libellé — jamais une porte : ce n'est pas
 * un lien.
 */
export function EnTeteDeModeration({
  retour = '/administration',
  notificationsNonLues = 0,
  initiales,
}: {
  retour?: string;
  notificationsNonLues?: number;
  initiales: string;
}) {
  return (
    <div className="app-header en-tete-moderation">
      <Link className="back" href={retour} aria-label="Revenir">
        <Icone nom="retour" taille={24} strokeWidth={2.2} />
      </Link>
      {/* La marque ramène à l'application : c'est la sortie de la modération. */}
      <Link
        className="brand mini"
        href="/mon-espace"
        aria-label="Quitter la modération et revenir à mon espace"
      >
        <span className="brand-mark" aria-hidden="true" />
        <span>
          <b>BIKE</b> SITTERS
        </span>
      </Link>
      <span className="badge-mod">Modération</span>
      <Link
        className="cloche"
        href="/notifications"
        aria-label={
          notificationsNonLues > 0
            ? `Notifications, ${notificationsNonLues} non lues`
            : 'Notifications'
        }
      >
        {notificationsNonLues > 0 ? <span>{notificationsNonLues}</span> : null}
      </Link>
      <Link className="avatar" href="/profil" aria-label="Mon compte">
        {initiales}
      </Link>
    </div>
  );
}
