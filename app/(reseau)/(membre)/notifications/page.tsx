import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { notificationsDuMembre, type Notification } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { ecartEnJours, jourAffiche } from '@/lib/regles/creneau';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { toutLire } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Notifications') };
}

const FILTRES = [
  ['toutes', 'Toutes'],
  ['gardes', 'Gardes'],
  ['communaute', 'Communauté'],
  ['systeme', 'Système'],
] as const;

type Filtre = (typeof FILTRES)[number][0];

/** Le lien d'une notification dit de quoi elle parle. */
function natureDe(n: Notification): Exclude<Filtre, 'toutes'> {
  if (n.lien?.startsWith('/gardes')) return 'gardes';
  if (
    n.lien?.startsWith('/messages') ||
    n.lien?.startsWith('/membres') ||
    n.lien?.startsWith('/profil/avis')
  ) {
    return 'communaute';
  }
  return 'systeme';
}

function iconeDe(n: Notification): NomDIcone {
  if (n.lien?.startsWith('/messages')) return 'messages';
  if (n.lien?.startsWith('/gardes')) return 'calendrier';
  if (n.lien?.startsWith('/progression') || n.lien?.startsWith('/classement')) return 'trophee';
  if (n.lien?.includes('avis')) return 'etoile';
  if (n.lien?.startsWith('/profil/alertes') || n.lien?.startsWith('/recherche')) return 'recherche';
  return 'cloche';
}

export default async function Notifications({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { filtre: demande } = await searchParams;
  const filtre: Filtre = FILTRES.some(([cle]) => cle === demande)
    ? (demande as Filtre)
    : 'toutes';
  const toutes = await notificationsDuMembre(membre.id);
  const notifications =
    filtre === 'toutes' ? toutes : toutes.filter((n) => natureDe(n) === filtre);
  const nonLues = toutes.some((n) => !n.lue);

  const aujourdhui = jourABruxelles();
  const groupes: [string, Notification[]][] = [
    [p('Aujourd’hui'), []],
    [p('Cette semaine'), []],
    [p('Plus tôt'), []],
  ];
  for (const n of notifications) {
    const ecart = ecartEnJours(jourABruxelles(new Date(n.visibleLe)), aujourdhui);
    groupes[ecart === 0 ? 0 : ecart < 7 ? 1 : 2]![1].push(n);
  }

  return (
    <main id="contenu">
      <EnTete p={p} retour="/accueil" cloche={false}>
        <Link
          href="/profil/preferences"
          className="entete-bouton"
          aria-label={p('Préférences de notification')}
        >
          <Icone nom="reglages" taille={22} />
        </Link>
      </EnTete>
      <div className="ecran-app ecran-large">
        <div className="titre-avec-action">
          <h1 className="titre-ecran">{p('Notifications')}</h1>
          {nonLues ? (
            <form action={toutLire}>
              <button type="submit" className="bouton discret petit">
                {p('Tout marquer comme lu')}
              </button>
            </form>
          ) : null}
        </div>

        <nav className="puces" aria-label={p('Filtrer les notifications')}>
          {FILTRES.map(([cle, libelle]) => (
            <Link
              key={cle}
              href={cle === 'toutes' ? '/notifications' : `/notifications?filtre=${cle}`}
              className={cle === filtre ? 'puce active' : 'puce'}
              aria-current={cle === filtre ? 'page' : undefined}
            >
              {p(libelle)}
            </Link>
          ))}
        </nav>

        {notifications.length === 0 ? (
          <div className="carte vide-liste" style={{ marginTop: 14 }}>
            <Icone nom="cloche" taille={30} />
            <strong>{p('Aucune notification.')}</strong>
            <span>{p('Vous retrouverez ici les demandes, les messages et les mises à jour de vos gardes.')}</span>
          </div>
        ) : (
          groupes.map(([titre, liste]) =>
            liste.length === 0 ? null : (
              <section key={titre}>
                <h2 className="titre-section">{titre}</h2>
                <div className="pile">
                  {liste.map((n) => {
                    const quand = new Date(n.visibleLe);
                    return (
                      <Link
                        key={n.id}
                        href={`/notifications/${n.id}`}
                        className={n.lue ? 'carte notification' : 'carte notification non-lue'}
                        prefetch={false}
                      >
                        <span className="ligne-icone fond-vert">
                          <Icone nom={iconeDe(n)} taille={22} />
                        </span>
                        <span className="ligne-texte">
                          <strong>
                            {!n.lue ? <span className="lecteur">{p('Non lue')} : </span> : null}
                            {p(n.texte, n.valeurs)}
                          </strong>
                          {n.differee ? (
                            <span>{p('Reçue pendant vos heures de calme')}</span>
                          ) : null}
                        </span>
                        <span className="ligne-fin colonne">
                          <span className="petit">
                            {jourABruxelles(quand) === aujourdhui
                              ? heureABruxelles(quand)
                              : jourAffiche(jourABruxelles(quand)).slice(0, 5)}
                          </span>
                          {!n.lue ? <span className="point-vert" aria-hidden="true" /> : null}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ),
          )
        )}
      </div>
    </main>
  );
}
