import type { Metadata } from 'next';
import Link from 'next/link';

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
    <div className="page">
      <p className="surtitre">Modération</p>
      <h1 className="titre-page">
        {dossiers.length === 0
          ? 'Rien n’attend'
          : `${dossiers.length} identité${dossiers.length > 1 ? 's' : ''} à vérifier`}
      </h1>
      <p className="chapeau">
        Bonjour {moderateur.prenom}. C’est ici qu’on regarde les pièces
        d’identité — la règle 2 dit qu’une personne les regarde, et cette
        personne c’est vous.
      </p>

      <div className="encart">
        <p>
          <strong>Ce que vous vérifiez.</strong> Que la photo est lisible, que
          le nom correspond à celui du compte, et que le document a l’air
          authentique. Ni plus, ni moins : vous ne notez personne, vous ne
          jugez personne, et vous ne recopiez aucun numéro nulle part.
        </p>
      </div>

      {dossiers.length === 0 ? (
        <p className="discret">Aucune pièce en attente de relecture.</p>
      ) : (
        <ul className="emplacements">
          {dossiers.map((dossier) => {
            const restants = joursAvantSuppression(
              new Date(dossier.deposeeLe),
              maintenant,
            );
            return (
              <li key={dossier.membreId} className="emplacement">
                <span className="emplacement__initiale" aria-hidden="true">
                  {dossier.prenom.charAt(0)}
                </span>
                <div className="emplacement__corps">
                  <h2>
                    {dossier.prenom} {dossier.nom}
                  </h2>
                  <p>
                    déposée {enFrancais(new Date(dossier.deposeeLe))} ·{' '}
                    {Math.round(dossier.tailleEnOctets / 1024)} Ko
                  </p>
                  <p>
                    {restants === 0
                      ? 'Supprimée automatiquement d’un instant à l’autre.'
                      : `Supprimée automatiquement dans ${restants} jour${restants > 1 ? 's' : ''}.`}
                  </p>
                </div>
                <Link
                  href={`/moderation/membres/${dossier.membreId}`}
                  className="bouton bouton--principal"
                >
                  Examiner
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="titre-section titre-section--aere">
        Candidatures d’emplacement
      </h2>
      {candidatures.length === 0 ? (
        <p className="discret">Aucune candidature en attente.</p>
      ) : (
        <ul className="emplacements">
          {candidatures.map((candidature) => (
            <li key={candidature.id} className="emplacement">
              <div className="emplacement__corps">
                <h3>
                  {candidature.prenom} — {candidature.type}
                </h3>
                <p>
                  {candidature.quartier ?? 'quartier non précisé'} ·{' '}
                  {candidature.capacite} vélo
                  {candidature.capacite > 1 ? 's' : ''} · {candidature.email}
                </p>
                <p>déposée {enFrancais(new Date(candidature.deposeeLe))}</p>
              </div>
              <form action={classerLaCandidature}>
                <input
                  type="hidden"
                  name="candidature"
                  value={candidature.id}
                />
                <button type="submit" className="bouton bouton--discret">
                  Marquer traitée
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="titre-section titre-section--aere">
        Journal des décisions
      </h2>
      <p className="discret">
        Les conditions générales promettent que les décisions de modération sont
        journalisées et motivées. Les voici — sans les documents, qui sont
        supprimés.
      </p>

      {decisions.length === 0 ? (
        <p className="discret">Aucune décision pour l’instant.</p>
      ) : (
        <dl className="questions">
          {decisions.map((entree) => (
            <div key={entree.id}>
              <dt>
                {entree.prenom} {entree.nom} —{' '}
                {entree.decision === 'verifiee' ? 'vérifiée' : 'refusée'}
              </dt>
              <dd>
                {enFrancais(new Date(entree.decideeLe))}
                {entree.parQui ? `, par ${entree.parQui}` : ''}
                {entree.motif ? ` — ${entree.motif}` : ''}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
