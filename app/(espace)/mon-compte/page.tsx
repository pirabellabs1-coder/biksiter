import type { Metadata } from 'next';
import Link from 'next/link';

import BaseNonBranchee from '@/components/base-non-branchee';
import EnteteDePage from '@/components/espace/entete-de-page';
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
              'Tant qu’une personne ne l’a pas contrôlée, vous ne pouvez ni publier un emplacement ni demander un stationnement.',
            lien: '/inscription/verification',
            action: 'Voir où ça en est',
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
              'Personne ici ne compte le temps que vous mettez à répondre, et refuser ne se justifie pas.',
            lien: '/mes-stationnements',
            action: 'Y répondre',
          },
        ]
      : []),
    ...(enCours.length > 0
      ? [
          {
            cle: 'en-cours',
            variante: 'garde',
            titre:
              enCours.length === 1
                ? 'Un vélo est gardé en ce moment'
                : `${enCours.length} vélos sont gardés en ce moment`,
            phrase:
              'La reprise se fait avec un code à quatre chiffres, dicté sur place.',
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
        phrase={
          aFaire.length === 0
            ? 'Rien n’attend de réponse. C’est le cas normal, et c’est très bien.'
            : 'Voici ce qui attend quelque chose de vous.'
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
              className={
                entree.variante === 'attente'
                  ? 'a-faire__entree'
                  : `a-faire__entree a-faire__entree--${entree.variante}`
              }
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
        <li
          className={aRepondre.length > 0 ? 'tuile tuile--attente' : 'tuile'}
        >
          <span className="tuile__valeur">{aRepondre.length}</span>
          <span className="tuile__libelle">
            {aRepondre.length > 1 ? 'demandes à répondre' : 'demande à répondre'}
          </span>
        </li>
        <li className={enCours.length > 0 ? 'tuile tuile--garde' : 'tuile'}>
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
                Aucune garde prévue. Une garde apparaît ici dès qu’un bike
                sitter accepte une demande — la vôtre, ou celle de quelqu’un
                pour votre emplacement.
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
                    <span className="jeton-initiale jeton-initiale--petit" aria-hidden="true">
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
                      <span
                        className={
                          stationnement.etat === 'en_cours'
                            ? 'pastille pastille--garde'
                            : 'pastille pastille--verifie'
                        }
                      >
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
                  Vous n’en proposez aucun. Un garage, une cave, une cour
                  fermée suffisent, et refuser une demande ne se justifie
                  jamais.
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
                Le réseau s’agrandit par recommandation&nbsp;: quelqu’un répond
                de la personne qu’il fait entrer. Une invitation vaut le plus
                dans votre propre quartier.
              </p>
              {invitations.length === 0 ? (
                <p className="discret">
                  Vous n’en avez pas de disponible. On en gagne une après
                  chaque stationnement mené à bien.
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
