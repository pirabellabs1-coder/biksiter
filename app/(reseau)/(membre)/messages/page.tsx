import type { Metadata } from 'next';
import Link from 'next/link';

import { ListeDesConversations } from '@/components/app/conversations';
import { Icone } from '@/components/app/icone';
import { conversationsDuMembre } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Messagerie') };
}

/**
 * La messagerie. Sur ordinateur, les deux volets d'une vraie application de
 * messages : la liste des conversations à gauche, et à droite une invitation à
 * en choisir une (elle s'ouvre ensuite sur `/messages/[id]`). Sur téléphone,
 * seule la liste s'affiche, en pleine largeur.
 */
export default async function Messagerie() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const conversations = await conversationsDuMembre(membre.id);

  if (conversations.length === 0) {
    return (
      <main id="contenu" className="ecran">
        <header className="ecran-tete">
          <h1>Messages</h1>
          <p className="ecran-intro">
            Une conversation par garde, avec le membre qui la partage avec vous.
          </p>
        </header>
        <div className="etat-vide" data-vide="messages">
          <span className="ev-i" aria-hidden="true">
            <Icone nom="messages" taille={26} />
          </span>
          <h2>Aucune conversation</h2>
          <p>
            Une conversation s’ouvre dès qu’une demande est envoyée : vous
            pouvez écrire à un bike sitter avant même sa réponse.
          </p>
          <Link className="primary" href="/recherche">
            Chercher un bike sitter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="contenu">
      <div className="ecran-app ecran-large">
        <div className="messagerie messagerie-index">
          <aside className="messagerie-liste">
            <h2 className="titre-section" style={{ marginTop: 0 }}>
              Messages
            </h2>
            <ListeDesConversations p={p} conversations={conversations} />
          </aside>
          <section className="messagerie-vide" aria-hidden="true">
            <span className="messagerie-vide-icone">
              <Icone nom="messages" taille={28} />
            </span>
            <strong>Choisissez une conversation</strong>
            <p>
              Sélectionnez une garde à gauche pour lire les messages et
              répondre. Une conversation par garde, avec le membre qui la
              partage avec vous.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
