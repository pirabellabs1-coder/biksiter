import Link from 'next/link';

import { BasculeDeRole } from './bascule-de-role';
import { Retour } from './retour';

/**
 * L'en-tête des écrans de l'espace membre.
 *
 * C'est le `.app-header` de la maquette : un retour, la marque en petit, la
 * bascule de rôle, la cloche et l'avatar. Elle sort du cadre membre et non de
 * chaque page — c'est ce qui garantit que la bascule entre cycliste et bike
 * sitter est atteignable depuis n'importe quel écran, y compris sur
 * ordinateur, où les barres du bas ne s'affichent pas.
 */
export function EnTeteMembre({
  estBikeSitter,
  role,
  notificationsNonLues = 0,
  initiales,
  photo = null,
}: {
  estBikeSitter: boolean;
  role: 'cycliste' | 'sitter';
  notificationsNonLues?: number;
  initiales: string;
  /** La photo de profil du membre, s'il en a mis une. */
  photo?: { membreId: string; version: number } | null;
}) {
  return (
    <div className="app-header">
      <Retour />
      <Link
        className="brand mini"
        href={role === 'sitter' ? '/accueil' : '/mon-espace'}
        aria-label="Bike Sitters, accueil de mon espace"
      >
        <span className="brand-mark" aria-hidden="true" />
        <span>
          <b>BIKE</b> SITTERS
        </span>
      </Link>
      <BasculeDeRole estBikeSitter={estBikeSitter} role={role} />
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
      <Link
        className={photo ? 'avatar avatar-avec-photo' : 'avatar'}
        href="/profil"
        aria-label="Mon compte"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/membres/${photo.membreId}/photo?v=${photo.version}`}
            alt=""
            width={36}
            height={36}
          />
        ) : (
          initiales
        )}
      </Link>
    </div>
  );
}
