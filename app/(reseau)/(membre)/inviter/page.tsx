import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { CodeDInvitation } from '@/components/maquette/compte/code-d-invitation';
import { adresseDuSite } from '@/lib/adresse-du-site';
import { mesInvitations } from '@/lib/depot/invitations';
import { textes } from '@/lib/i18n/langue';
import { INVITATIONS_PAR_MEMBRE } from '@/lib/regles/invitations';
import { exigerUnMembre } from '@/lib/session';
import { enJour } from '@/lib/temps';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Inviter un membre') };
}

/**
 * Inviter un proche.
 *
 * Le lien est la façon la plus simple : il ouvre l'inscription avec le code
 * déjà rempli. Chaque code ne sert qu'une fois ; le quota se reconstitue
 * quand une personne invitée a mené sa première garde.
 */
export default async function Inviter() {
  const membre = await exigerUnMembre();
  const { codes, invitees, identiteVerifiee } = await mesInvitations(membre.id);
  const site = adresseDuSite();
  const lienDe = (code: string) =>
    `${site}/invitation?code=${encodeURIComponent(code)}`;
  const [premier, ...autres] = codes;

  return (
    <main id="contenu" className="ecran">
      <header className="ecran-tete">
        <h1>Inviter un proche</h1>
        <p className="ecran-intro">
          Invitez quelqu’un que vous connaissez, de préférence du quartier :
          le réseau est d’autant plus utile qu’il est dense près de chez vous.
        </p>
      </header>

      {!identiteVerifiee ? (
        <section className="carte-accueillir" aria-labelledby="titre-verifier">
          <h2 id="titre-verifier">
            Vos invitations s’ouvrent après la vérification
          </h2>
          <p>
            Vos codes d’invitation sont disponibles dès que votre identité a
            été vérifiée par l’association.
          </p>
          <Link className="primary" href="/profil/verifications">
            Voir mes vérifications
          </Link>
        </section>
      ) : premier ? (
        <section aria-labelledby="titre-lien">
          <h2 className="titre-section" id="titre-lien">
            Votre invitation
          </h2>
          <CodeDInvitation
            principal
            code={premier.code}
            lien={lienDe(premier.code)}
            expireLe={enJour(new Date(premier.expireLe))}
          />
          <p className="prog-note">
            La personne ouvre le lien, crée son compte, et le code est déjà
            rempli. Chaque code ne sert qu’une fois ; vous en avez{' '}
            {INVITATIONS_PAR_MEMBRE} au plus, et une invitation vous revient
            dès qu’une personne invitée a mené sa première garde.
          </p>
        </section>
      ) : (
        <section className="carte-accueillir" aria-labelledby="titre-complet">
          <h2 id="titre-complet">Toutes vos invitations sont en cours</h2>
          <p>
            Vous avez invité {INVITATIONS_PAR_MEMBRE} personnes. Une invitation
            vous revient dès que l’une d’elles a mené sa première garde.
          </p>
        </section>
      )}

      {autres.length > 0 ? (
        <section aria-labelledby="titre-autres">
          <h2 className="titre-section" id="titre-autres">
            Vos autres codes
            <span className="titre-compteur">{autres.length}</span>
          </h2>
          <div className="pile-cartes">
            {autres.map((disponible) => (
              <CodeDInvitation
                key={disponible.code}
                code={disponible.code}
                lien={lienDe(disponible.code)}
                expireLe={enJour(new Date(disponible.expireLe))}
              />
            ))}
          </div>
        </section>
      ) : null}

      {invitees.length > 0 ? (
        <section aria-labelledby="titre-invitees">
          <h2 className="titre-section" id="titre-invitees">
            Les personnes que vous avez invitées
          </h2>
          <ul className="groupe" role="list">
            {invitees.map((invitee) => (
              <li
                key={`${invitee.prenom}-${new Date(invitee.inscriteLe).toISOString()}`}
                className="rangee"
              >
                <span className="rangee-icone" aria-hidden="true">
                  <Icone nom="profil" taille={18} strokeWidth={2} />
                </span>
                <span className="rangee-texte">
                  <strong>
                    {invitee.prenom} {invitee.initiale}.
                  </strong>
                  <span>
                    Inscription le {enJour(new Date(invitee.inscriteLe))}
                  </span>
                </span>
                <span
                  className={
                    invitee.premiereGarde ? 'status' : 'status status-attente'
                  }
                >
                  {invitee.premiereGarde
                    ? 'Première garde faite'
                    : 'Pas encore de garde'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="titre-qui">
        <h2 className="titre-section" id="titre-qui">
          Qui inviter
        </h2>
        <ul className="groupe sans-icone" role="list">
          <li className="rangee">
            <span className="rangee-texte">
              <strong>Quelqu’un que vous connaissez</strong>
              <span>
                Une personne que vous connaissez rejoint le réseau en confiance.
              </span>
            </span>
          </li>
          <li className="rangee">
            <span className="rangee-texte">
              <strong>Quelqu’un du quartier</strong>
              <span>Des bike sitters près de chez vous rendent les gardes plus faciles à trouver.</span>
            </span>
          </li>
          <li className="rangee">
            <span className="rangee-texte">
              <strong>Quelqu’un qui dispose d’un emplacement fermé</strong>
              <span>
                Si vous l’invitez pour accueillir des vélos : un garage, une
                cave, une cour à soi.
              </span>
            </span>
          </li>
        </ul>
      </section>
    </main>
  );
}
