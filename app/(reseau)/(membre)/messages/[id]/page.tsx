import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ListeDesConversations } from '@/components/app/conversations';
import { EnTete } from '@/components/app/en-tete';
import { dateDeGarde, PastilleDEtat } from '@/components/app/garde';
import { Icone } from '@/components/app/icone';
import { nomPublic, Presence } from '@/components/membre/elements';
import {
  conversation,
  conversationEcrivable,
  conversationsDuMembre,
} from '@/lib/depot/membre-espace';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

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
      <EnTete p={p} retour="/messages" cloche={false}>
        <Link
          href={`/signaler/membre/${garde.autreId}`}
          className="entete-bouton"
          aria-label={p('Signaler {nom}', { nom })}
        >
          <Icone nom="drapeau" taille={22} />
        </Link>
      </EnTete>
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
              <span className="avatar-app" aria-hidden="true">
                {garde.autrePrenom.charAt(0)}
              </span>
              <span className="ligne-texte">
                <strong>{nom}</strong>
                <span>
                  <Presence p={p} vuLe={garde.autreVuLe} avecLibelle />
                </span>
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
                      {m.corps}
                      <span className="bulle-heure">
                        {jourABruxelles(quand) === jourABruxelles()
                          ? heureABruxelles(quand)
                          : `${jourAffiche(jourABruxelles(quand))} ${heureABruxelles(quand)}`}
                      </span>
                    </div>
                  );
                })
              )}
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
                }}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
