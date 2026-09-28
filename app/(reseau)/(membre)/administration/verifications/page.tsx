import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { OngletsDeModeration } from '@/components/maquette/moderation/onglets';
import { candidaturesEnAttente, dossiersAVerifier } from '@/lib/depot/moderation';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { joursAvantSuppression } from '@/lib/regles/pieces';
import { jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

import { classerUneCandidature } from '../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Vérifications d’identité') };
}

export default async function Verifications({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const [{ decision }, dossiers, candidatures] = await Promise.all([
    searchParams,
    dossiersAVerifier(),
    candidaturesEnAttente(),
  ]);
  const maintenant = new Date();
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  return (
    <main id="contenu">
      <EnTeteDeModeration initiales={initiales} />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">FILE D’IDENTITÉ</span>
          <h1>{p('Vérifications d’identité')}</h1>
          <p>
            {p(
              'Chaque pièce d’identité est examinée par une personne de l’équipe, puis supprimée dès que la décision a été enregistrée.',
            )}
          </p>
        </header>

        <OngletsDeModeration p={p} actif="verifications" />

        {decision ? (
          <article className="mod-carte" role="status">
            <div className="mod-tete">
              <span className="mod-etat">{p('Décision enregistrée')}</span>
            </div>
            <p className="gris">
              {decision === 'verifiee'
                ? p(
                    'Identité vérifiée. La pièce a été supprimée et le membre reçoit une notification.',
                  )
                : p(
                    'Refus enregistré. La pièce a été supprimée et le membre a reçu le motif.',
                  )}
            </p>
          </article>
        ) : null}

        <article className="mod-carte">
          <div className="mod-tete">
            <span className="mod-etat">
              {p('Dossiers d’identité à examiner')}
            </span>
            <span className="gris">
              {p('{n} en attente', { n: dossiers.length })}
            </span>
          </div>
          {dossiers.length === 0 ? (
            <p className="vide-onglet">
              {p('Aucune pièce en attente pour le moment.')}
            </p>
          ) : (
            <ul className="liste-nette">
              {dossiers.map((dossier) => {
                const restants = joursAvantSuppression(
                  new Date(dossier.deposeeLe),
                  maintenant,
                );
                return (
                  <li key={dossier.membreId}>
                    <b>
                      <Link href={`/administration/verifications/${dossier.membreId}`}>
                        {dossier.prenom} {dossier.nom.at(0) ?? ''}.
                      </Link>
                    </b>
                    <span>
                      {p('Déposée le {date}', {
                        date: jourAffiche(jourABruxelles(new Date(dossier.deposeeLe))),
                      })}
                      {' · '}
                      {restants === 0
                        ? p('supprimée aujourd’hui')
                        : p('supprimée dans {n} j', { n: restants })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        {candidatures.length > 0 ? (
          <article className="mod-carte">
            <div className="mod-tete">
              <span className="mod-etat">
                {p('Candidatures reçues par le site')}
              </span>
              <span className="gris">
                {p('{n} à examiner', { n: candidatures.length })}
              </span>
            </div>
            <p className="gris">
              {p(
                'Ces personnes ont écrit depuis le site pour proposer un emplacement. Elles seront recontactées par l’équipe pour la suite.',
              )}
            </p>
            <ul className="liste-nette">
              {candidatures.map((candidature) => (
                <li key={candidature.id}>
                  <b>
                    {candidature.prenom} · {p(candidature.type)}
                  </b>
                  <span>
                    {[
                      candidature.quartier,
                      p(candidature.capacite > 1 ? '{n} vélos' : '{n} vélo', { n: candidature.capacite }),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  <form
                    action={classerUneCandidature}
                    style={{ marginTop: 6 }}
                  >
                    <input
                      type="hidden"
                      name="candidature"
                      value={candidature.id}
                    />
                    <button type="submit" className="outline">
                      {p('Classer')}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </main>
  );
}
