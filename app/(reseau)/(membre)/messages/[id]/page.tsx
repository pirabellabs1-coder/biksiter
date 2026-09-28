import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Avatar } from '@/components/app/avatar';
import { ListeDesConversations } from '@/components/app/conversations';
import { dateDeGarde, PastilleDEtat } from '@/components/app/garde';
import { Icone } from '@/components/app/icone';
import { PhotoAgrandissable } from '@/components/app/photo-agrandissable';
import { nomPublic } from '@/components/membre/elements';
import {
  conversation,
  conversationEcrivable,
  conversationsDuMembre,
} from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { FinDuFil } from './fin-du-fil';
import { FormulaireDeMessage } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Messages') };
}

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { t, p } = await textes();
  const { id } = await params;
  const [trouvee, conversations] = await Promise.all([
    conversation(membre.id, id),
    conversationsDuMembre(membre.id),
  ]);
  if (!trouvee) notFound();
  const { garde, messages } = trouvee;
  const nom = nomPublic(garde.autrePrenom, garde.autreInitiale);
  const ecrivable = conversationEcrivable(garde);

  return (
    <main
      id="contenu"
      className={ecrivable ? 'avec-barre-d-action' : undefined}
    >
      <div className="ecran-app ecran-large">
        <div className="messagerie">
          {/* Sur ordinateur, la liste reste à gauche de la conversation. */}
          <aside className="messagerie-liste messagerie-liste-secondaire">
            <h2 className="titre-section" style={{ marginTop: 0 }}>
              {p('Messages')}
            </h2>
            <ListeDesConversations
              p={p}
              conversations={conversations}
              active={garde.id}
            />
          </aside>
          <section className="messagerie-conversation" aria-label={nom}>
            <div className="personne-conversation">
              <Avatar
                membreId={garde.autreId}
                prenom={garde.autrePrenom}
                version={garde.autrePhoto}
                taille={44}
              />
              <span className="ligne-texte">
                <strong>{nom}</strong>
                {/* Pas d'« en ligne » : le réseau a écarté le temps réel pour
                    ne pas créer une attente de réponse que des bénévoles ne
                    tiennent pas. */}
                <span>{p('Les réponses arrivent quand chacun est disponible.')}</span>
              </span>
            </div>
            <Link
              href={`/gardes/${garde.id}`}
              className="ligne carte garde-de-conversation"
            >
              <span className="ligne-icone fond-vert">
                <Icone nom="velo" taille={22} />
              </span>
              <span className="ligne-texte">
                <strong>{dateDeGarde(p, garde.debut, garde.fin)}</strong>
                <span>
                  <PastilleDEtat t={t} etat={garde.etat} />
                </span>
              </span>
              <Icone nom="chevron" taille={20} className="texte-leger" />
            </Link>

            <div className="fil" aria-live="polite">
              {messages.length === 0 ? (
                <p className="petit texte-doux centre">
                  {p("Aucun message pour l'instant.")}
                </p>
              ) : (
                messages.map((m) => {
                  const quand = new Date(m.ecritLe);
                  return (
                    <div
                      key={m.id}
                      className={m.deMoi ? 'bulle moi' : 'bulle autre'}
                    >
                      {m.aUnePhoto ? (
                        <PhotoAgrandissable
                          src={`/messages/${garde.id}/photo/${m.id}`}
                          alt={p('Photo envoyée')}
                          fermer={p('Fermer la photo')}
                        />
                      ) : null}
                      {m.corps ? <span className="bulle-texte">{m.corps}</span> : null}
                      <span className="bulle-heure">
                        {jourABruxelles(quand) === jourABruxelles()
                          ? heureABruxelles(quand)
                          : `${jourAffiche(jourABruxelles(quand))} ${heureABruxelles(quand)}`}
                      </span>
                    </div>
                  );
                })
              )}
              <FinDuFil nombreDeMessages={messages.length} />
            </div>
            {!ecrivable ? (
              <div className="encart gris">
                <Icone nom="info" taille={22} />
                <span>
                  {p('Cette conversation ne reçoit plus de messages.')}
                </span>
              </div>
            ) : null}
            {ecrivable ? (
              <FormulaireDeMessage
                id={garde.id}
                textes={{
                  placeholder: p('Écrire un message…'),
                  envoyer: p('Envoyer'),
                  libelle: p('Message'),
                  joindre: p('Joindre une photo'),
                  retirer: p('Retirer la photo'),
                }}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
