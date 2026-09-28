import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { dateDeGarde } from '@/components/app/garde';
import { FormulaireDeDecision } from '@/components/app/formulaire-de-decision';
import { referenceDeGarde } from '@/components/membre/garde';
import { conversationDuLitige, detailDuLitige } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { ETATS_DU_VELO, titreDeLaPhoto } from '@/lib/regles/constat';
import { jourAffiche } from '@/lib/regles/creneau';
import { PhotoAgrandissable } from '@/components/app/photo-agrandissable';
import { ISSUES_D_UN_LITIGE } from '@/lib/regles/moderation';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

import { trancherLeLitige } from '../../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Détail du litige') };
}

function quand(instant: Date): string {
  return `${jourAffiche(jourABruxelles(instant))} ${heureABruxelles(instant)}`;
}

export default async function UnLitige({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const { id } = await params;
  const [litige, conversation] = await Promise.all([
    detailDuLitige(id),
    conversationDuLitige(id),
  ]);
  if (!litige) notFound();

  const libelleDeLEtape: Record<string, string> = {
    demande: p('Demande envoyée'),
    accepte: p('Acceptée'),
    arrivee: p('Arrivée signalée'),
    velo_recu: p('Vélo reçu'),
    en_cours: p('Garde en cours'),
    reprise_demandee: p('Récupération demandée'),
    velo_restitue: p('Vélo restitué'),
    termine: p('Terminée'),
    annule: p('Annulée'),
    litige: p('Signalement'),
    retard_annonce: p('Retard annoncé'),
    prolongation_demandee: p('Prolongation demandée'),
    prolongation_acceptee: p('Prolongation acceptée'),
    prolongation_refusee: p('Prolongation refusée'),
  };
  const libelleDeLActeur: Record<string, string> = {
    cycliste: p('Cycliste'),
    bike_sitter: p('Bike Sitter'),
    systeme: p('Automatique'),
    moderation: p('Modération'),
  };
  const enCours = litige.etat === 'litige';
  const veloChezLeBikeSitter = Boolean(litige.deposeLe) && !litige.reprisLe;
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  return (
    <main id="contenu">
      <EnTeteDeModeration
        retour="/administration/litiges"
        initiales={initiales}
      />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">DOSSIER DE LITIGE</span>
          <h1>
            {p('Litige {reference}', {
              reference: referenceDeGarde(litige.id),
            })}
          </h1>
          <p>
            {p('{cycliste} chez {bikeSitter}', {
              cycliste: litige.prenomDuCycliste,
              bikeSitter: litige.prenomDuBikeSitter,
            })}{' '}
            · {litige.quartier}
          </p>
          {/* Pour « vérifier avec les deux membres », il faut pouvoir les
              trouver : leurs fiches donnent de quoi les joindre. */}
          <p className="liens-du-dossier">
            <Link href={`/administration/membres/${litige.cyclisteId}`}>
              {p('Fiche de {prenom} (cycliste)', {
                prenom: litige.prenomDuCycliste,
              })}
            </Link>
            <Link href={`/administration/membres/${litige.bikeSitterId}`}>
              {p('Fiche de {prenom} (Bike Sitter)', {
                prenom: litige.prenomDuBikeSitter,
              })}
            </Link>
          </p>
        </header>

        <article
          className={
            litige.priorite === 'haute' ? 'mod-carte urgent' : 'mod-carte'
          }
        >
          <div className="mod-tete">
            <span
              className={
                litige.priorite === 'haute' ? 'mod-etat rouge' : 'mod-etat attente'
              }
            >
              {litige.priorite === 'haute'
                ? `${p('Priorité haute')}`
                : `${p('Priorité moyenne')}`}
            </span>
            <span className="gris">
              {p('ouvert le {date}', {
                date: quand(new Date(litige.ouvertLe)),
              })}
            </span>
          </div>
          <h3>{litige.motif ? p(litige.motif) : p('Signalement')}</h3>
          <p className="gris">
            {p('Signalé par {qui}', {
              qui:
                litige.signalePar === 'cycliste'
                  ? p('le cycliste')
                  : litige.signalePar === 'bike_sitter'
                    ? p('le Bike Sitter')
                    : p('un membre'),
            })}
          </p>
          <dl className="infos serre">
            <div className="info">
              <dt>{p('Créneau')}</dt>
              <dd>
                <b>{dateDeGarde(p, litige.debut, litige.fin)}</b>
                <span>{p(litige.typeVelo)}</span>
              </dd>
            </div>
            <div className="info">
              <dt>{p('Vélo')}</dt>
              <dd>
                <b>
                  {veloChezLeBikeSitter
                    ? p('Encore chez le Bike Sitter')
                    : litige.reprisLe
                      ? p('Repris par le cycliste')
                      : p('Jamais déposé')}
                </b>
                <span>
                  {litige.deposeLe
                    ? p('Déposé le {date}', {
                        date: quand(new Date(litige.deposeLe)),
                      })
                    : p('Aucun dépôt enregistré')}
                  {litige.reprisLe
                    ? ` · ${p('repris le {date}', {
                        date: quand(new Date(litige.reprisLe)),
                      })}`
                    : ''}
                </span>
              </dd>
            </div>
          </dl>
        </article>

        <article className="mod-carte">
          <div className="mod-tete">
            <span className="mod-etat">{p('Constats du vélo')}</span>
          </div>
          {litige.constats.length === 0 ? (
            <p className="vide-onglet">
              {p('Aucun constat n’a été établi.')}
            </p>
          ) : (
            <ul className="liste-nette">
              {litige.constats.map((constat) => (
                <li key={constat.phase}>
                  <b>
                    {constat.phase === 'depot' ? p('Au dépôt') : p('Au retour')}{' '}
                    ·{' '}
                    {p(
                      ETATS_DU_VELO[
                        constat.etat as keyof typeof ETATS_DU_VELO
                      ] ?? constat.etat,
                    )}
                  </b>
                  <span>
                    {constat.note ? `« ${constat.note} » · ` : ''}
                    {p(constat.rangs.length > 1 ? '{n} photos' : '{n} photo', { n: constat.rangs.length })}
                    {constat.batterieVerifiee
                      ? ` · ${p('batterie vérifiée')}`
                      : ''}
                    {constat.reserve
                      ? ` · ${p('remarque : {remarque}', {
                          remarque: constat.reserve,
                        })}`
                      : ''}
                  </span>
                  {constat.rangs.length > 0 ? (
                    <span
                      className="photos-de-constat"
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {/* Chaque photo s'ouvre en grand : une rayure ne se
                          juge pas sur une vignette. */}
                      {constat.rangs.map((rang) => (
                        <PhotoAgrandissable
                          key={rang}
                          src={`/administration/litiges/${litige.id}/constat/${constat.phase}/${rang}`}
                          alt={p(titreDeLaPhoto(rang))}
                          fermer={p('Fermer la photo')}
                          classe="photo-dossier"
                        />
                      ))}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>

        {enCours ? (
          <article className="mod-carte">
            <div className="mod-tete">
              <span className="mod-etat">{p('Conversation de la garde')}</span>
            </div>
            {conversation.length === 0 ? (
              <p className="vide-onglet">
                {p('Les deux membres ne se sont pas écrit.')}
              </p>
            ) : (
              <ul className="liste-nette">
                {conversation.map((message, rang) => (
                  <li key={rang}>
                    <b>
                      {message.prenom} ·{' '}
                      {message.auteur === 'cycliste'
                        ? p('Cycliste')
                        : p('Bike Sitter')}
                    </b>
                    <span>
                      {quand(new Date(message.ecritLe))}
                      {message.corps ? ` · ${message.corps}` : ''}
                      {message.avecPhoto ? ` · ${p('(photo jointe)')}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ) : null}

        <article className="mod-carte">
          <div className="mod-tete">
            <span className="mod-etat">{p('Historique de la garde')}</span>
          </div>
          <ul className="liste-nette">
            {litige.evenements.map((evenement, rang) => (
              <li key={`${evenement.etape}-${rang}`}>
                <b>{libelleDeLEtape[evenement.etape] ?? evenement.etape}</b>
                <span>
                  {quand(new Date(evenement.faitLe))} ·{' '}
                  {libelleDeLActeur[evenement.acteur] ?? evenement.acteur}
                  {evenement.note ? ` · ${evenement.note}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </article>

        {enCours ? (
          <section className="bloc">
            <h2>{p('Trancher le litige')}</h2>
            {veloChezLeBikeSitter ? (
              <p className="gris">
                {p(
                  'Le vélo est encore chez le Bike Sitter. Si le problème est réglé, classez le litige : la garde reprend son cours. Clore la garde met fin à son suivi : vérifiez d’abord avec les deux membres que le vélo a bien été rendu.',
                )}
              </p>
            ) : null}
            <FormulaireDeDecision
              action={trancherLeLitige.bind(null, litige.id)}
              nomDuChoix="issue"
              choix={ISSUES_D_UN_LITIGE.map(
                (issue) =>
                  [
                    issue.cle,
                    p(issue.titre),
                    p(issue.description),
                    issue.cle === 'annuler',
                  ] as const,
              )}
              confirmation={
                veloChezLeBikeSitter
                  ? p('Je confirme que le cycliste a récupéré son vélo.')
                  : undefined
              }
              confirmationInutilePour={['poursuivre']}
              textes={{
                motif: p('Explication de la décision'),
                aideDuMotif: p(
                  'Cette explication est transmise au cycliste et au Bike Sitter. Merci de la rédiger à leur attention.',
                ),
                confirmer: p('Enregistrer la décision'),
                envoi: p('Enregistrement…'),
              }}
            />
          </section>
        ) : (
          <article className="mod-carte" role="status">
            <div className="mod-tete">
              <span className="mod-etat">{p('Litige tranché')}</span>
            </div>
            <p className="gris">{p('Ce litige est clos.')}</p>
          </article>
        )}
      </div>
    </main>
  );
}
