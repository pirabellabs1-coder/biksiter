import Link from 'next/link';

import { BasculeDeRole } from '../bascule-de-role';

/**
 * La barre du haut des écrans d'application des maquettes définitives.
 *
 * Le site public porte `.topbar` ; les écrans du parcours de garde portent
 * `.app-header`, plus compacte, avec un retour à gauche. La maquette ouvrait
 * les écrans par `data-open` : ici chaque destination est une vraie adresse,
 * et le retour est un lien, donc utilisable au clavier comme au doigt.
 */
export function EnTeteDApplication({
  retour,
  estBikeSitter,
  notificationsNonLues = 0,
  initiales,
}: {
  retour: string;
  estBikeSitter: boolean;
  notificationsNonLues?: number;
  initiales: string;
}) {
  return (
    <div className="app-header">
      <Link className="back" href={retour} aria-label="Revenir">
        <span aria-hidden="true">←</span>
      </Link>
      <Link className="brand mini" href="/" aria-label="Bike Sitters accueil">
        <span className="brand-mark" aria-hidden="true" />
        <span>
          <b>BIKE</b> SITTERS
        </span>
      </Link>
      <BasculeDeRole estBikeSitter={estBikeSitter} role="cycliste" />
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
