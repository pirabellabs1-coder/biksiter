import type { Metadata } from 'next';

import { ListeDesConversations } from '@/components/app/conversations';
import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { conversationsDuMembre } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Messages') };
}

export default async function Messages({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { q } = await searchParams;
  const recherche = (q ?? '').trim().toLowerCase().slice(0, 60);
  const [toutes, nonLues] = await Promise.all([
    conversationsDuMembre(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);
  const conversations = recherche
    ? toutes.filter(
        (c) =>
          c.autrePrenom.toLowerCase().includes(recherche) ||
          (c.dernierMessage ?? '').toLowerCase().includes(recherche),
      )
    : toutes;

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues} />
      <div className="ecran-app ecran-large">
        <div className="messagerie">
          <section className="messagerie-liste">
            <h1 className="titre-ecran">{p('Messages')}</h1>
            <form
              action="/messages"
              method="get"
              role="search"
              style={{ margin: '10px 0 14px' }}
            >
              <label className="champ-app champ-recherche">
                <Icone nom="recherche" taille={20} />
                <span className="lecteur">
                  {p('Rechercher une conversation')}
                </span>
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ''}
                  placeholder={p('Rechercher une conversation…')}
                />
              </label>
            </form>

            <ListeDesConversations p={p} conversations={conversations} />

            {toutes.length === 0 ? (
              <p className="petit texte-doux centre" style={{ marginTop: 14 }}>
                {p(
                  "Une conversation s'ouvre dès qu'une demande est envoyée ou acceptée.",
                )}
              </p>
            ) : recherche && conversations.length === 0 ? (
              <p className="petit texte-doux centre" style={{ marginTop: 14 }}>
                {p('Aucune conversation ne correspond à « {q} ».', {
                  q: q ?? '',
                })}
              </p>
            ) : null}
          </section>

          {/* Sur ordinateur, le volet de droite attend qu'on choisisse. */}
          <section className="messagerie-vide" aria-hidden="true">
            <span className="messagerie-vide-icone">
              <Icone nom="messages" taille={30} />
            </span>
            <strong>{p('Choisissez une conversation')}</strong>
            <span>
              {p(
                'Vos échanges avec les bike sitters et les cyclistes s’affichent ici.',
              )}
            </span>
          </section>
        </div>
      </div>
    </main>
  );
}
