import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { FormulaireDeDecision } from '@/components/app/formulaire-de-decision';
import { enPoints } from '@/components/app/progression';
import { ficheDeGestion } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { CORRECTION_MAXIMALE } from '@/lib/regles/moderation';
import { jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

import { changerLeStatutDuCompte, corrigerLeSolde } from '../../actions';
import { FormulaireDeCorrection } from './correction';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Fiche de membre') };
}

export default async function FicheDUnMembre({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const [{ id }, indications] = await Promise.all([params, searchParams]);
  const fiche = await ficheDeGestion(id);
  if (!fiche) notFound();

  const libelleDeLAction: Record<string, string> = {
    compte_suspendu: p('Compte suspendu'),
    compte_reactive: p('Compte réactivé'),
    points_corriges: p('Points corrigés'),
    signalement_traite: p('Signalement traité'),
  };
  const gerable = !fiche.moderateur && fiche.id !== moderateur.id;
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  return (
    <main id="contenu">
      <EnTeteDeModeration
        retour="/administration/membres"
        initiales={initiales}
      />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">FICHE DE MEMBRE</span>
          <h1>
            {fiche.prenom} {fiche.nom}
          </h1>
          <p>
            {fiche.email} ·{' '}
            {p('Membre depuis {annee}', { annee: fiche.membreDepuis })}
            {fiche.verification === 'verifiee'
              ? ` · ${p('identité vérifiée')}`
              : ''}
          </p>
        </header>

        <article className={fiche.suspendu ? 'mod-carte urgent' : 'mod-carte'}>
          <div className="mod-tete">
            <span
              className={fiche.suspendu ? 'mod-etat rouge' : 'mod-etat vert'}
            >
              {fiche.suspendu
                ? `${p('Compte suspendu')}`
                : `${p('Compte actif')}`}
            </span>
            {fiche.moderateur ? (
              <span className="gris">{p('Membre de l’équipe de modération')}</span>
            ) : null}
          </div>
          <dl className="infos serre">
            <div className="info">
              <dt>{p('Gardes accueillies')}</dt>
              <dd>
                <b>{fiche.gardesAccueillies}</b>
              </dd>
            </div>
            <div className="info">
              <dt>{p('Gardes confiées')}</dt>
              <dd>
                <b>{fiche.gardesConfiees}</b>
              </dd>
            </div>
            <div className="info">
              <dt>{p('Signalements reçus')}</dt>
              <dd>
                <b>{fiche.signalementsRecus}</b>
              </dd>
            </div>
            <div className="info">
              <dt>{p('Gardes engagées')}</dt>
              <dd>
                <b>{fiche.gardesEngagees}</b>
                <span>{p('demandes ou gardes en cours')}</span>
              </dd>
            </div>
          </dl>
        </article>

        {indications.statut ? (
          <article className="mod-carte" role="status">
            <div className="mod-tete">
              <span className="mod-etat">{p('Statut mis à jour')}</span>
            </div>
            <p className="gris">
              {fiche.suspendu
                ? p('Compte suspendu : ses sessions sont fermées.')
                : p('Compte réactivé.')}
            </p>
          </article>
        ) : null}
        {indications.points ? (
          <article className="mod-carte" role="status">
            <div className="mod-tete">
              <span className="mod-etat">{p('Correction enregistrée')}</span>
            </div>
            <p className="gris">
              {p('Le membre a été prévenu de la correction.')}
            </p>
          </article>
        ) : null}

        <section className="bloc">
          <h2>{p('Points')}</h2>
          <p className="gris">
            <b>{enPoints(p, fiche.solde.acquis)}</b>
            {fiche.solde.enAttente > 0
              ? ` · ${p('{n} points en attente', { n: fiche.solde.enAttente })}`
              : ` · ${p('disponibles')}`}
          </p>
          {fiche.id === moderateur.id ? (
            <p className="gris">
              {p(
                'Vos propres points doivent être corrigés par un autre membre de l’équipe.',
              )}
            </p>
          ) : (
            <FormulaireDeCorrection
              action={corrigerLeSolde.bind(null, fiche.id)}
              maximum={CORRECTION_MAXIMALE}
              textes={{
                ajouter: p('Ajouter des points'),
                retirer: p('Retirer des points'),
                nombre: p('Nombre de points'),
                motif: p('Motif de la correction'),
                aide: p(
                  'Ce motif est communiqué au membre et conservé dans son historique.',
                ),
                enregistrer: p('Enregistrer la correction'),
                envoi: p('Enregistrement…'),
              }}
            />
          )}
        </section>

        <section className="bloc">
          <h2>{p('Statut du compte')}</h2>
          {gerable ? (
            <>
              <p className="gris">
                {fiche.suspendu
                  ? p(
                      'Réactiver le compte permet au membre de se reconnecter et de reprendre ses gardes.',
                    )
                  : p(
                      'Suspendre le compte ferme ses sessions, retire ses lieux des recherches et clôt ses demandes en attente.',
                    )}
              </p>
              <FormulaireDeDecision
                action={changerLeStatutDuCompte.bind(null, fiche.id)}
                champsCaches={{ suspendre: fiche.suspendu ? 'non' : 'oui' }}
                danger={!fiche.suspendu}
                confirmation={
                  !fiche.suspendu && fiche.gardesEngagees > 0
                    ? p('Je suspends malgré la garde en cours.')
                    : undefined
                }
                choix={[]}
                textes={{
                  motif: p('Motif'),
                  aideDuMotif: p('Il reste dans l’historique du compte.'),
                  confirmer: fiche.suspendu
                    ? p('Réactiver le compte')
                    : p('Suspendre le compte'),
                  envoi: p('Enregistrement…'),
                }}
              />
            </>
          ) : (
            <p className="gris">
              {p(
                'Ce compte ne peut pas être suspendu depuis cet écran. Il s’agit du vôtre ou de celui d’un membre de la modération.',
              )}
            </p>
          )}
        </section>

        <article className="mod-carte">
          <div className="mod-tete">
            <span className="mod-etat">{p('Historique des actions')}</span>
          </div>
          {fiche.actions.length === 0 ? (
            <p className="vide-onglet">
              {p('Aucune action de modération sur ce compte.')}
            </p>
          ) : (
            <ul className="liste-nette">
              {fiche.actions.map((action, rang) => (
                <li key={rang}>
                  <b>{libelleDeLAction[action.action] ?? action.action}</b>
                  <span>
                    {action.motif}
                    {' · '}
                    {jourAffiche(jourABruxelles(new Date(action.faitLe)))}
                    {action.parQui ? ` · ${action.parQui}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </main>
  );
}
