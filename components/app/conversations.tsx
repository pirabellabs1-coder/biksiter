import Link from 'next/link';

import { nomPublic } from '@/components/membre/elements';
import type { conversationsDuMembre } from '@/lib/depot/membre-espace';
import type { Textes } from '@/lib/i18n/langue';
import { jourCourt } from '@/lib/regles/creneau';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';

import { Icone } from './icone';
import { Logo } from './logo';

type Conversation = Awaited<ReturnType<typeof conversationsDuMembre>>[number];

/**
 * La liste des conversations : sur téléphone, un écran à elle seule ; sur
 * ordinateur, le volet gauche de la messagerie, à côté de la conversation
 * ouverte.
 */
export function ListeDesConversations({
  p,
  conversations,
  active,
}: {
  p: Textes['p'];
  conversations: readonly Conversation[];
  /** La conversation ouverte à côté, sur ordinateur. */
  active?: string;
}) {
  return (
    <div className="liste liste-conversations">
      {conversations.map((c) => {
        const quand = c.dernierMessageLe ? new Date(c.dernierMessageLe) : null;
        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className="ligne conversation"
            aria-current={c.id === active ? 'page' : undefined}
          >
            <span className="avatar-app" aria-hidden="true">
              {c.autrePrenom.charAt(0)}
            </span>
            <span className="ligne-texte">
              <strong>{nomPublic(c.autrePrenom, c.autreInitiale)}</strong>
              <span className="tronque">
                {c.dernierMessage ?? p('Nouvelle conversation')}
              </span>
            </span>
            <span className="ligne-fin colonne">
              <span className="petit">
                {quand
                  ? jourABruxelles(quand) === jourABruxelles()
                    ? heureABruxelles(quand)
                    : jourCourt(jourABruxelles(quand))
                  : ''}
              </span>
              {c.nonLu ? (
                <span
                  className="point-vert"
                  role="img"
                  aria-label={p('Non lu')}
                />
              ) : (
                <Icone nom="chevron" taille={18} />
              )}
            </span>
          </Link>
        );
      })}
      <Link href="/contact" className="ligne conversation">
        <span className="avatar-app blanc" aria-hidden="true">
          <Logo taille={30} />
        </span>
        <span className="ligne-texte">
          <strong>{p('Assistance Bike Sitters')}</strong>
          <span>{p('Comment pouvons-nous vous aider ?')}</span>
        </span>
        <Icone nom="chevron" taille={18} className="texte-leger" />
      </Link>
    </div>
  );
}
