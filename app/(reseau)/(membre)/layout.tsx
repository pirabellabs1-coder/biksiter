import { EnTeteMembre } from '@/components/maquette/en-tete-membre';
import { reglagesDAffichage } from '@/lib/affichage';
import { membreAUnEmplacement } from '@/lib/depot/lieux';
import { signalerLaPresence } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { versionDeMaPhoto } from '@/lib/depot/photo-de-profil';
import { textes } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import { exigerUnMembre } from '@/lib/session';

/**
 * Le cadre de l'espace membre.
 *
 * La maquette ne connaît ni barre latérale ni rail : chaque écran porte son
 * `.app-header`, et les deux barres du bas — cycliste et bike sitter — vivent
 * en fin de document, posées par la racine. L'en-tête sort ici, une seule
 * fois : c'est ce qui rend la bascule de rôle atteignable partout, y compris
 * sur ordinateur où les barres du bas ne s'affichent pas.
 */
export default async function CadreDuMembre({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const mode = await modeCourant();

  const [, affichage, nonLues, estBikeSitter, versionDeLaPhoto] =
    await Promise.all([
      signalerLaPresence(membre.id),
      reglagesDAffichage(),
      nombreDeNotificationsNonLues(membre.id),
      membreAUnEmplacement(membre.id),
      versionDeMaPhoto(membre.id),
    ]);

  const initiales =
    `${membre.prenom.charAt(0)}${membre.nom.charAt(0)}`.toUpperCase();

  return (
    <div
      className="app app-membre"
      data-affichage={affichage.length > 0 ? affichage.join(' ') : undefined}
    >
      <a href="#contenu" className="evitement">
        {p('Aller au contenu')}
      </a>
      <EnTeteMembre
        estBikeSitter={estBikeSitter}
        role={mode === 'bike_sitter' ? 'sitter' : 'cycliste'}
        notificationsNonLues={nonLues}
        initiales={initiales}
        photo={
          versionDeLaPhoto
            ? { membreId: membre.id, version: versionDeLaPhoto }
            : null
        }
      />
      <div className="site">{children}</div>
    </div>
  );
}
