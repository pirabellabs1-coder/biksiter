import type { Metadata } from 'next';
import Link from 'next/link';

import { Avatar } from '@/components/app/avatar';
import { Icone } from '@/components/app/icone';
import { conversationsDuMembre } from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Messagerie') };
}

/** L'heure d'un message du jour, sinon sa date : « 14:05 », « 26/09 ». */
function quandEcrit(instant: Date): string {
  return jourABruxelles(instant) === jourABruxelles()
    ? heureABruxelles(instant)
    : jourAffiche(jourABruxelles(instant));
}

/** « Garde d’aujourd’hui, 14h00 → 18h00 », ou la date quand ce n'est pas le jour même. */
function creneauEcrit(debut: Date, fin: Date): string {
  const jour = jourABruxelles(debut);
  const quand =
    jour === jourABruxelles() ? 'Garde d’aujourd’hui' : `Garde du ${jourAffiche(jour)}`;
  return `${quand}, ${heureABruxelles(debut)} → ${heureABruxelles(fin)}`;
}

export default async function Messagerie() {
  const membre = await exigerUnMembre();
  const conversations = await conversationsDuMembre(membre.id);

  return (
    <main id="contenu" className="ecran">
      <header className="ecran-tete">
        <h1>Messages</h1>
        <p className="ecran-intro">
          Une conversation par garde, avec le membre qui la partage avec vous.
        </p>
      </header>

      {conversations.length === 0 ? (
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
      ) : (
        <ul className="groupe" role="list">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/messages/${conversation.id}`}
                className={conversation.nonLu ? 'rangee conversation non-lue' : 'rangee conversation'}
              >
                <Avatar
                  membreId={conversation.autreId}
                  prenom={conversation.autrePrenom}
                  version={conversation.autrePhoto}
                  taille={46}
                />
                <span className="rangee-texte">
                  <span className="conversation-ligne">
                    <strong>
                      {conversation.autrePrenom} {conversation.autreInitiale}.
                    </strong>
                    {conversation.dernierMessageLe ? (
                      <time
                        dateTime={new Date(conversation.dernierMessageLe).toISOString()}
                      >
                        {quandEcrit(new Date(conversation.dernierMessageLe))}
                      </time>
                    ) : null}
                  </span>
                  <span className="conversation-apercu">
                    {conversation.dernierMessage
                      ? conversation.dernierMessage
                      : conversation.dernierMessagePhoto
                        ? 'Photo'
                        : 'Aucun message pour l’instant'}
                  </span>
                  <span className="conversation-garde">
                    {creneauEcrit(
                      new Date(conversation.debut),
                      new Date(conversation.fin),
                    )}
                  </span>
                </span>
                {conversation.nonLu ? (
                  <span className="point-non-lu">
                    <span className="lecteur">Message non lu</span>
                  </span>
                ) : null}
                <Icone nom="chevron" taille={18} className="rangee-chevron" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="prog-note">
        Les échanges restent dans l’application. Votre numéro n’est visible
        que pendant une garde acceptée, par la personne qui la partage avec
        vous. En cas de litige, un modérateur peut lire la conversation liée
        à la garde, et elle seule.
      </p>
    </main>
  );
}
