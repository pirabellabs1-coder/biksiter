import type { Metadata } from 'next';
import Link from 'next/link';

import EnteteDePage from '@/components/espace/entete-de-page';
import IconeCaracteristique from '@/components/icone-caracteristique';
import {
  candidaturesEnAttente,
  dossiersAVerifier,
  journal,
} from '@/lib/depot/moderation';
import { joursAvantSuppression } from '@/lib/regles/pieces';
import { exigerUnModerateur } from '@/lib/session';
import { enFrancais } from '@/lib/temps';

import { classerLaCandidature } from './actions';

export const metadata: Metadata = { title: 'Modération' };
export const dynamic = 'force-dynamic';

export default async function Moderation() {
  const moderateur = await exigerUnModerateur();

  const [dossiers, candidatures, decisions] = await Promise.all([
    dossiersAVerifier(),
    candidaturesEnAttente(),
    journal(20),
  ]);

  const maintenant = new Date();

  return (
    <>
      <EnteteDePage
        surtitre="Modération"
        titre={
          dossiers.length === 0
            ? 'Rien n’attend'
            : dossiers.length === 1
              ? 'Une identité à vérifier'
              : `${dossiers.length} identités à vérifier`
        }
        phrase={`Bonjour ${moderateur.prenom}. La règle 2 dit qu’une personne regarde les pièces d’identité, et cette personne c’est vous.`}
      />

      <ul className="tuiles">
        <li className={dossiers.length > 0 ? 'tuile tuile--attente' : 'tuile'}>
          <span className="tuile__valeur">{dossiers.length}</span>
          <span className="tuile__libelle">
            {dossiers.length > 1
              ? 'pièces à examiner'
              : 'pièce à examiner'}
          </span>
        </li>
        <li
          className={candidatures.length > 0 ? 'tuile tuile--attente' : 'tuile'}
        >
          <span className="tuile__valeur">{candidatures.length}</span>
          <span className="tuile__libelle">
            {candidatures.length > 1
              ? 'candidatures à classer'
              : 'candidature à classer'}
          </span>
        </li>
        <li className="tuile">
          <span className="tuile__valeur">{decisions.length}</span>
          <span className="tuile__libelle">
            {decisions.length > 1
              ? 'décisions récentes'
              : 'décision récente'}
          </span>
        </li>
      </ul>

      {/* Une note, pas une tâche : elle n'attend rien de personne, donc elle
          prend l'encart neutre et non le filet des choses à faire. */}
      <div className="encart">
        <p>
          <strong>Ce que vous vérifiez, et rien d’autre.</strong> Que la photo
          est lisible, que le nom correspond à celui du compte, et que le
          document a l’air authentique. Vous ne notez personne, vous ne jugez
          personne, et vous ne recopiez aucun numéro nulle part.
        </p>
      </div>

      <div className="panneaux">
        <section className="panneau">
          <div className="panneau__entete">
            <h2>Pièces d’identité à examiner</h2>
            <span className="discret">
              supprimées automatiquement après quelques jours
            </span>
          </div>

          {dossiers.length === 0 ? (
            <div className="vide">
              <IconeCaracteristique pictogramme="identite" />
              <p>
                Aucune pièce en attente de relecture. C’est le cas normal —
                elles arrivent au rythme des inscriptions.
              </p>
            </div>
          ) : (
            <ul className="lignes">
              {dossiers.map((dossier) => {
                const restants = joursAvantSuppression(
                  new Date(dossier.deposeeLe),
                  maintenant,
                );

                return (
                  <li key={dossier.membreId}>
                    <div className="ligne">
                      <span
                        className="jeton-initiale jeton-initiale--petit"
                        aria-hidden="true"
                      >
                        {dossier.prenom.charAt(0)}
                      </span>
                      <span className="ligne__corps">
                        <span className="ligne__titre">
                          {dossier.prenom} {dossier.nom}
                        </span>
                        <span className="ligne__detail">
                          déposée {enFrancais(new Date(dossier.deposeeLe))} ·{' '}
                          {Math.round(dossier.tailleEnOctets / 1024)} Ko
                        </span>
                      </span>
                      <span className="ligne__fin">
                        <span
                          className={
                            restants === 0
                              ? 'pastille pastille--refus'
                              : 'pastille pastille--neutre'
                          }
                        >
                          {restants === 0
                            ? 'supprimée d’un instant à l’autre'
                            : `supprimée dans ${restants} jour${restants > 1 ? 's' : ''}`}
                        </span>
                        <Link
                          href={`/moderation/membres/${dossier.membreId}`}
                          className="bouton bouton--principal"
                        >
                          Examiner
                        </Link>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panneau">
          <div className="panneau__entete">
            <h2>Candidatures d’emplacement</h2>
          </div>

          {candidatures.length === 0 ? (
            <div className="vide">
              <IconeCaracteristique pictogramme="prive" />
              <p>Aucune candidature en attente.</p>
            </div>
          ) : (
            <ul className="lignes">
              {candidatures.map((candidature) => (
                <li key={candidature.id}>
                  <div className="ligne">
                    <span className="ligne__corps">
                      <span className="ligne__titre">
                        {candidature.prenom} — {candidature.type}
                      </span>
                      <span className="ligne__detail">
                        {candidature.quartier ?? 'quartier non précisé'} ·{' '}
                        {candidature.capacite} vélo
                        {candidature.capacite > 1 ? 's' : ''} ·{' '}
                        {candidature.email}
                      </span>
                      <span className="ligne__detail">
                        déposée {enFrancais(new Date(candidature.deposeeLe))}
                      </span>
                    </span>
                    <span className="ligne__fin">
                      <form action={classerLaCandidature}>
                        <input
                          type="hidden"
                          name="candidature"
                          value={candidature.id}
                        />
                        <button
                          type="submit"
                          className="bouton bouton--discret"
                        >
                          Marquer traitée
                        </button>
                      </form>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panneau">
          <div className="panneau__entete">
            <h2>Journal des décisions</h2>
          </div>
          <div className="panneau__corps">
            <p className="discret">
              Les conditions générales promettent que les décisions de
              modération sont journalisées et motivées. Les voici — sans les
              documents, qui sont supprimés.
            </p>
          </div>

          {decisions.length === 0 ? (
            <div className="vide">
              <IconeCaracteristique pictogramme="journal" />
              <p>Aucune décision pour l’instant.</p>
            </div>
          ) : (
            <ul className="lignes">
              {decisions.map((entree) => (
                <li key={entree.id}>
                  <div className="ligne">
                    <span className="ligne__corps">
                      <span className="ligne__titre">
                        {entree.prenom} {entree.nom}
                      </span>
                      <span className="ligne__detail">
                        {enFrancais(new Date(entree.decideeLe))}
                        {entree.parQui ? `, par ${entree.parQui}` : ''}
                        {entree.motif ? ` — ${entree.motif}` : ''}
                      </span>
                    </span>
                    <span className="ligne__fin">
                      <span
                        className={
                          entree.decision === 'verifiee'
                            ? 'pastille pastille--verifie'
                            : 'pastille pastille--refus'
                        }
                      >
                        {entree.decision === 'verifiee' ? 'vérifiée' : 'refusée'}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
