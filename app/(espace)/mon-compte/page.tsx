import type { Metadata } from 'next';
import Link from 'next/link';

import BaseNonBranchee from '@/components/base-non-branchee';
import EnteteDePage from '@/components/entete-de-page';
import IconeCaracteristique from '@/components/icone-caracteristique';
import { baseConfiguree } from '@/lib/bd/client';
import { emplacementsDuMembre } from '@/lib/depot/emplacements';
import { comptesDuMembre, soldeDuMembre } from '@/lib/depot/maillons';
import { invitationsDisponibles } from '@/lib/depot/membres';
import {
  demandesRecues,
  mesStationnements,
  type Stationnement,
} from '@/lib/depot/stationnements';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { leSoldeSAffiche } from '@/lib/regles/maillons';
import { exigerUnMembre } from '@/lib/session';
import { creneauEnFrancais } from '@/lib/temps';

export const metadata: Metadata = { title: 'Tableau de bord' };
export const dynamic = 'force-dynamic';

/** Ce qu'on montre d'une liste avant de renvoyer vers la page entière. */
const APERCU = 4;

export default async function TableauDeBord() {
  const membre = await exigerUnMembre();

  if (!baseConfiguree()) {
    return (
      <>
        <EnteteDePage
          surtitre="Tableau de bord"
          titre={`Bonjour ${membre.prenom}`}
        />
        <BaseNonBranchee />
      </>
    );
  }

  const [emplacements, recues, miennes, invitations, comptes, solde] =
    await Promise.all([
      emplacementsDuMembre(membre.id),
      demandesRecues(membre.id),
      mesStationnements(membre.id),
      invitationsDisponibles(membre.id),
      comptesDuMembre(membre.id),
      soldeDuMembre(membre.id),
    ]);

  const verifie = membre.verification === 'verifiee';
  const aRepondre = recues.filter(({ etat }) => etat === 'demande');
  const tous = [...recues, ...miennes];
  const enCours = tous.filter(({ etat }) => etat === 'en_cours');
  const publies = emplacements.filter(({ publie }) => publie).length;

  // Ce qui vient : les gardes acceptées ou en cours, la plus proche d'abord.
  // Une garde passée n'a plus rien à demander à personne.
  const maintenant = Date.now();
  const aVenir = tous
    .filter(
      ({ etat, fin }) =>
        (etat === 'accepte' || etat === 'en_cours') &&
        fin.getTime() > maintenant,
    )
    .sort((un, autre) => un.debut.getTime() - autre.debut.getTime());

  const aFaire = [
    ...(verifie
      ? []
      : [
          {
            cle: 'verification',
            variante: 'bloquant',
            titre: 'Votre identité n’est pas encore vérifiée',
            phrase:
              'Une fois votre identité vérifiée, vous pourrez publier un emplacement et demander un stationnement.',
            lien: '/inscription/verification',
            action: 'Suivre ma vérification',
          },
        ]),
    ...(aRepondre.length > 0
      ? [
          {
            cle: 'demandes',
            variante: 'attente',
            titre:
              aRepondre.length === 1
                ? 'Une demande attend votre réponse'
                : `${aRepondre.length} demandes attendent votre réponse`,
            phrase:
              'Prenez le temps qu’il vous faut : vous êtes libre d’accepter ou non.',
            lien: '/mes-stationnements',
            action: 'Y répondre',
          },
        ]
      : []),
    ...(enCours.length > 0
      ? [
          {
            cle: 'en-cours',
            variante: 'confirme',
            titre:
              enCours.length === 1
                ? 'Un vélo est gardé en ce moment'
                : `${enCours.length} vélos sont gardés en ce moment`,
            phrase:
              'Au moment de la reprise, un code à quatre chiffres confirme la remise du vélo.',
            lien: `/stationnements/${enCours[0].id}`,
            action: 'Ouvrir',
          },
        ]
      : []),
  ];

  return (
    <>
      <EnteteDePage
        surtitre="Tableau de bord"
        titre={`Bonjour ${membre.prenom}`}
        chapeau={
          aFaire.length === 0
            ? 'Tout est à jour : rien n’attend votre réponse.'
            : 'Voici ce qui attend votre attention.'
        }
        actions={
          verifie && emplacements.length < EMPLACEMENTS_PAR_MEMBRE ? (
            <Link
              href="/proposer-un-emplacement"
              className="bouton bouton--principal"
            >
              Proposer un emplacement
            </Link>
          ) : null
        }
      />

      {aFaire.length === 0 ? null : (
        <div className="a-faire">
          {aFaire.map((entree) => (
            <div
              key={entree.cle}
              className={`a-faire__entree a-faire__entree--${entree.variante}`}
            >
              <div className="a-faire__corps">
                <strong>{entree.titre}</strong>
                <p>{entree.phrase}</p>
              </div>
              <Link href={entree.lien} className="bouton bouton--discret">
                {entree.action}
              </Link>
            </div>
          ))}
        </div>
      )}

      <ul className="tuiles">
        <li className="tuile">
          <span className="tuile__valeur">
            {publies}
            <span className="discret"> / {EMPLACEMENTS_PAR_MEMBRE}</span>
          </span>
          <span className="tuile__libelle">
            {publies > 1 ? 'emplacements publiés' : 'emplacement publié'}
          </span>
        </li>
        <li className={aRepondre.length > 0 ? 'tuile tuile--attente' : 'tuile'}>
          <span className="tuile__valeur">{aRepondre.length}</span>
          <span className="tuile__libelle">
            {aRepondre.length > 1
              ? 'demandes à répondre'
              : 'demande à répondre'}
          </span>
        </li>
        <li className={enCours.length > 0 ? 'tuile tuile--verifie' : 'tuile'}>
          <span className="tuile__valeur">{enCours.length}</span>
          <span className="tuile__libelle">
            {enCours.length > 1
              ? 'vélos gardés en ce moment'
              : 'vélo gardé en ce moment'}
          </span>
        </li>
        {/* Le solde ne s'affiche qu'à qui a déjà accueilli : un compteur à zéro
            posé sous le nez de quelqu'un qui débute ressemble à un retard à
            rattraper (règle 3). */}
        {leSoldeSAffiche(comptes.accueillies) ? (
          <li className="tuile">
            <span className="tuile__valeur">{solde.acquis}</span>
            <span className="tuile__libelle">
              {solde.acquis > 1 ? 'maillons acquis' : 'maillon acquis'}
            </span>
          </li>
        ) : (
          <li className="tuile">
            <span className="tuile__valeur">{comptes.confiees}</span>
            <span className="tuile__libelle">
              {comptes.confiees > 1 ? 'vélos confiés' : 'vélo confié'}
            </span>
          </li>
        )}
      </ul>

      <div className="panneaux panneaux--deux">
        <section className="panneau">
          <div className="panneau__entete">
            <h2>Ce qui vient</h2>
            <Link href="/mes-stationnements">Tout voir</Link>
          </div>

          {aVenir.length === 0 ? (
            <div className="vide">
              <IconeCaracteristique pictogramme="calendrier" />
              <p>
                Aucun stationnement prévu pour le moment. Ils s’afficheront ici
                dès qu’une demande sera acceptée, pour votre vélo comme pour
                votre emplacement.
              </p>
              <div className="boutons">
                <Link href="/emplacements" className="bouton bouton--discret">
                  Chercher un emplacement
                </Link>
              </div>
            </div>
          ) : (
            <ul className="lignes">
              {aVenir.slice(0, APERCU).map((stationnement) => (
                <li key={stationnement.id}>
                  <Link
                    href={`/stationnements/${stationnement.id}`}
                    className="ligne"
                  >
                    <span
                      className="jeton-initiale jeton-initiale--petit"
                      aria-hidden="true"
                    >
                      {autrePersonne(stationnement, membre.id).charAt(0)}
                    </span>
                    <span className="ligne__corps">
                      <span className="ligne__titre">
                        {stationnement.cyclisteId === membre.id
                          ? `Chez ${stationnement.prenomDuBikeSitter}`
                          : `Le vélo de ${stationnement.prenomDuCycliste}`}
                        {' · '}
                        {stationnement.quartier}
                      </span>
                      <span className="ligne__detail">
                        {creneauEnFrancais(
                          stationnement.debut,
                          stationnement.fin,
                        )}
                      </span>
                    </span>
                    <span className="ligne__fin">
                      {/* Accepté et vélo gardé sont tous deux « confirmés »
                          au sens de la règle 6 : c'est le mot qui les
                          distingue, pas la couleur. */}
                      <span className="pastille pastille--verifie">
                        {stationnement.etat === 'en_cours'
                          ? 'Vélo gardé'
                          : 'Accepté'}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="panneaux">
          <section className="panneau">
            <div className="panneau__entete">
              <h2>Mes emplacements</h2>
              <Link href="/mes-emplacements">Les gérer</Link>
            </div>

            {emplacements.length === 0 ? (
              <div className="vide">
                <IconeCaracteristique pictogramme="prive" />
                <p>
                  Vous n’en proposez pas encore. Un garage, une cave ou une cour
                  fermée suffisent, et vous restez libre d’accepter chaque
                  demande.
                </p>
              </div>
            ) : (
              <ul className="lignes">
                {emplacements.slice(0, APERCU).map((emplacement) => (
                  <li key={emplacement.reference}>
                    <Link
                      href={`/mes-emplacements/${emplacement.reference}/modifier`}
                      className="ligne"
                    >
                      <span className="ligne__corps">
                        <span className="ligne__titre">{emplacement.type}</span>
                        <span className="ligne__detail">
                          {emplacement.quartier}
                        </span>
                      </span>
                      <span className="ligne__fin">
                        <span
                          className={
                            emplacement.publie
                              ? 'pastille pastille--verifie'
                              : 'pastille pastille--neutre'
                          }
                        >
                          {emplacement.publie ? 'Publié' : 'En pause'}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panneau">
            <div className="panneau__entete">
              <h2>Mes invitations</h2>
            </div>
            <div className="panneau__corps">
              <p className="discret">
                Invitez les personnes de votre entourage à rejoindre le réseau :
                chaque invitation aide Bike Sitters à s’étendre, en particulier
                dans votre quartier.
              </p>
              {invitations.length === 0 ? (
                <p className="discret">
                  Vous n’avez plus d’invitation disponible pour le moment. Vous
                  en recevrez une nouvelle après chaque stationnement réussi.
                </p>
              ) : (
                <ul className="codes">
                  {invitations.map((code) => (
                    <li key={code}>
                      <code>{code}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/** Le prénom de l'autre partie, pour l'initiale du jeton. */
function autrePersonne(stationnement: Stationnement, moi: string): string {
  return stationnement.cyclisteId === moi
    ? stationnement.prenomDuBikeSitter
    : stationnement.prenomDuCycliste;
}
