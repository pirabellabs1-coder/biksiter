import Link from 'next/link';

import { BasculeDeRole } from './bascule-de-role';
import { MegaMenuBlog } from './mega-menu-blog';
import { MenuHamburger } from './menu-hamburger';

/**
 * La barre du haut des maquettes définitives.
 *
 * Un visiteur ne voit que ce qui lui est ouvert : se connecter, ou s'inscrire.
 * La bascule de rôle, les gardes, la cloche et l'avatar supposent un compte —
 * les afficher avant l'inscription promettrait une porte qui ne s'ouvre pas.
 */
export function EnTete({
  membre,
  estBikeSitter = false,
  role = 'cycliste',
  notificationsNonLues = 0,
}: {
  membre: { prenom: string; nom: string } | null;
  estBikeSitter?: boolean;
  role?: 'cycliste' | 'sitter';
  notificationsNonLues?: number;
}) {
  const initiales = membre
    ? `${membre.prenom.at(0) ?? ''}${membre.nom.at(0) ?? ''}`.toUpperCase()
    : '';

  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Bike Sitters accueil">
        <span className="brand-mark" aria-hidden="true" />
        <span>
          <b>BIKE</b> SITTERS
        </span>
      </Link>
      <nav aria-label="Navigation principale">
        <ul className="topbar-nav">
          <li>
            <Link href="/comment-ca-marche">Comment ça marche</Link>
          </li>
          <li>
            <Link href="/securite">Sécurité</Link>
          </li>
          <MegaMenuBlog />
          <li>
            <Link href="/a-propos">À propos</Link>
          </li>
        </ul>
      </nav>
      <div className="header-actions">
        <MenuHamburger membre={membre} />
        {membre ? (
          <>
            <BasculeDeRole estBikeSitter={estBikeSitter} role={role} />
            <Link className="link-button" href="/gardes">
              Mes gardes
            </Link>
            <Link
              className="cloche"
              href="/notifications"
              aria-label={
                notificationsNonLues > 0
                  ? `Notifications, ${notificationsNonLues} non lues`
                  : 'Notifications'
              }
            >
              {notificationsNonLues > 0 ? (
                <span>{notificationsNonLues}</span>
              ) : null}
            </Link>
            <Link className="avatar" href="/profil" aria-label="Mon compte">
              {initiales}
            </Link>
          </>
        ) : (
          <>
            <Link className="link-button" href="/connexion">
              Se connecter
            </Link>
            <Link className="primary" href="/inscription">
              S’inscrire
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
