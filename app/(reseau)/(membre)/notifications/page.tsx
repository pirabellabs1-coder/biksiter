import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone, type NomDIcone } from '@/components/app/icone';
import {
  notificationsDuMembre,
  type Notification,
} from '@/lib/depot/notifications';
import { textes, type Textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';

import { toutLire } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Notifications') };
}

/**
 * L'icône d'une notification, choisie par ce qu'elle concerne. Une notification
 * urgente (un code refusé, une garde annulée au dernier moment) prend le corail.
 */
function iconeDe(notification: Notification): NomDIcone {
  const lien = notification.lien ?? '';
  if (lien.startsWith('/messages')) return 'messages';
  if (lien.includes('avis')) return 'etoile';
  if (lien.startsWith('/progression') || lien.startsWith('/catalogue')) return 'cadeau';
  if (lien.startsWith('/demande')) return 'demandes';
  if (lien.startsWith('/gardes')) return 'velo';
  if (lien.startsWith('/profil')) return 'bouclier';
  return 'cloche';
}

/** « il y a 12 min », « hier », « il y a 3 jours » : la maquette parle en écart. */
function ilYA(p: Textes['p'], quand: Date): string {
  const minutes = Math.max(0, Math.round((Date.now() - quand.getTime()) / 60000));
  if (minutes < 60) return p('il y a {n} min', { n: minutes });
  const heures = Math.round(minutes / 60);
  if (heures < 24) return p('il y a {n} h', { n: heures });
  const jours = Math.round(heures / 24);
  if (jours === 1) return p('hier');
  if (jours < 7) return p('il y a {n} jours', { n: jours });
  return jourAffiche(jourABruxelles(quand));
}

export default async function Notifications() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const notifications = await notificationsDuMembre(membre.id);
  const nonLues = notifications.filter((n) => !n.lue).length;

  return (
    <main id="contenu" className="ecran">
      <header className="ecran-tete">
        <h1>Notifications</h1>
        <p className="ecran-intro">
          {nonLues > 0
            ? `${nonLues} nouvelle${nonLues > 1 ? 's' : ''} depuis votre dernière visite.`
            : 'Vous êtes à jour.'}
        </p>
      </header>

      {nonLues > 0 ? (
        <form action={toutLire} className="notifs-actions">
          <button type="submit" className="lien">
            Tout marquer comme lu
          </button>
        </form>
      ) : null}

      {notifications.length === 0 ? (
        <div className="etat-vide">
          <span className="ev-i" aria-hidden="true">
            <Icone nom="cloche" taille={26} />
          </span>
          <h2>Rien de neuf</h2>
          <p>
            Les demandes, les réponses et les messages de vos gardes
            arriveront ici.
          </p>
        </div>
      ) : (
        <ul className="groupe notifs-liste" role="list">
          {notifications.map((notification) => {
            const quand = new Date(notification.visibleLe);
            return (
              <li key={notification.id}>
                <Link
                  href={`/notifications/${notification.id}`}
                  className={[
                    'rangee',
                    'notification',
                    notification.lue ? '' : 'non-lue',
                    notification.urgente ? 'urgente' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  prefetch={false}
                >
                  <span className="rangee-icone" aria-hidden="true">
                    <Icone nom={iconeDe(notification)} taille={18} strokeWidth={2} />
                  </span>
                  <span className="rangee-texte">
                    <strong>
                      {notification.lue ? null : (
                        <span className="lecteur">Non lue : </span>
                      )}
                      {p(notification.texte, notification.valeurs)}
                    </strong>
                    <span>
                      {notification.differee
                        ? `${ilYA(p, quand)} · reçue pendant vos heures de calme`
                        : `${ilYA(p, quand)} · ${heureABruxelles(quand)}`}
                    </span>
                  </span>
                  {notification.lue ? null : (
                    <span className="point-non-lu" aria-hidden="true" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="prog-note">
        Les notifications de garde arrivent aussi par e-mail. Le reste se
        consulte ici.
      </p>
    </main>
  );
}
