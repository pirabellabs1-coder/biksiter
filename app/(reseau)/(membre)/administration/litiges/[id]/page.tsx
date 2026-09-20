import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { dateDeGarde } from '@/components/app/garde';
import { FormulaireDeDecision } from '@/components/app/formulaire-de-decision';
import { Icone } from '@/components/app/icone';
import { referenceDeGarde } from '@/components/membre/garde';
import { detailDuLitige } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { ETATS_DU_VELO, titreDeLaPhoto } from '@/lib/regles/constat';
import { jourAffiche } from '@/lib/regles/creneau';
import { ISSUES_D_UN_LITIGE } from '@/lib/regles/moderation';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

import { trancherLeLitige } from '../../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Litige') };
}

function quand(instant: Date): string {
  return `${jourAffiche(jourABruxelles(instant))} ${heureABruxelles(instant)}`;
}

export default async function UnLitige({ params }: { params: Promise<{ id: string }> }) {
  await exigerUnModerateur();
  const { p } = await textes();
  const { id } = await params;
  const litige = await detailDuLitige(id);
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

  return (
    <main id="contenu">
      <EnTete p={p} retour="/administration/litiges" cloche={false} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Litige {reference}', { reference: referenceDeGarde(litige.id) })}</h1>
        <p className="sous-titre">
          {p('{cycliste} chez {bikeSitter}', {
            cycliste: litige.prenomDuCycliste,
            bikeSitter: litige.prenomDuBikeSitter,
          })}{' '}
          · {litige.quartier}
        </p>

        <div className={litige.priorite === 'haute' ? 'encart rouge' : 'encart ambre'}>
          <Icone nom="alerte" taille={22} />
          <span>
            <strong>{litige.motif ? p(litige.motif) : p('Signalement')}</strong>
            {p('Ouvert le {date} par {qui}', {
              date: quand(new Date(litige.ouvertLe)),
              qui:
                litige.signalePar === 'cycliste'
                  ? p('le cycliste')
                  : litige.signalePar === 'bike_sitter'
                    ? p('le Bike Sitter')
                    : p('un membre'),
            })}
          </span>
        </div>

        <ul className="liste" style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="calendrier" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{dateDeGarde(p, litige.debut, litige.fin)}</strong>
              <span>{p(litige.typeVelo)}</span>
            </span>
          </li>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="velo" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>
                {veloChezLeBikeSitter
                  ? p('Le vélo est chez le Bike Sitter')
                  : litige.reprisLe
                    ? p('Le vélo a été repris')
                    : p('Le vélo n’a pas été déposé')}
              </strong>
              <span>
                {litige.deposeLe
                  ? p('Déposé le {date}', { date: quand(new Date(litige.deposeLe)) })
                  : p('Aucun dépôt enregistré')}
                {litige.reprisLe ? ` · ${p('repris le {date}', { date: quand(new Date(litige.reprisLe)) })}` : ''}
              </span>
            </span>
          </li>
        </ul>

        <h2 className="titre-section">{p('Constats')}</h2>
        {litige.constats.length === 0 ? (
          <p className="texte-doux">{p('Aucun constat n’a été établi.')}</p>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
            {litige.constats.map((constat) => (
              <li key={constat.phase} className="ligne ligne-info">
                <span className="ligne-texte">
                  <strong>
                    {constat.phase === 'depot' ? p('Au dépôt') : p('Au retour')} ·{' '}
                    {p(ETATS_DU_VELO[constat.etat as keyof typeof ETATS_DU_VELO] ?? constat.etat)}
                  </strong>
                  {constat.note ? <span>« {constat.note} »</span> : null}
                  <span>{p('{n} photo(s)', { n: constat.rangs.length })}</span>
                  {constat.batterieVerifiee ? <span>{p('Batterie vérifiée au moment des photos')}</span> : null}
                  {constat.reserve ? (
                    <span>{p('Remarque du bike sitter : {remarque}', { remarque: constat.reserve })}</span>
                  ) : null}
                  {constat.rangs.length > 0 ? (
                    <span className="photos-de-constat" style={{ display: 'grid' }}>
                      {constat.rangs.map((rang) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={rang}
                          src={`/administration/litiges/${litige.id}/constat/${constat.phase}/${rang}`}
                          alt={p(titreDeLaPhoto(rang))}
                        />
                      ))}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}

        <h2 className="titre-section">{p('Historique de la garde')}</h2>
        <ol className="suivi">
          {litige.evenements.map((evenement, rang) => (
            <li key={`${evenement.etape}-${rang}`} className="fait">
              <span className="suivi-point" aria-hidden="true">
                <Icone nom="coche" taille={14} strokeWidth={3} />
              </span>
              <span className="ligne-texte">
                <strong>{libelleDeLEtape[evenement.etape] ?? evenement.etape}</strong>
                <span>
                  {quand(new Date(evenement.faitLe))} · {libelleDeLActeur[evenement.acteur] ?? evenement.acteur}
                  {evenement.note ? ` · ${evenement.note}` : ''}
                </span>
              </span>
            </li>
          ))}
        </ol>

        {enCours ? (
          <>
            <h2 className="titre-section">{p('Trancher le litige')}</h2>
            <FormulaireDeDecision
              action={trancherLeLitige.bind(null, litige.id)}
              nomDuChoix="issue"
              choix={ISSUES_D_UN_LITIGE.map((issue) => [
                issue.cle,
                p(issue.titre),
                p(issue.description),
                issue.cle === 'annuler',
              ] as const)}
              confirmation={
                veloChezLeBikeSitter
                  ? p('Je confirme que le cycliste a récupéré son vélo.')
                  : undefined
              }
              avant={
                veloChezLeBikeSitter ? (
                  <div className="encart ambre">
                    <Icone nom="alerte" taille={20} />
                    <span>
                      {p('Clore la garde retire l’adresse, le téléphone et la conversation. Vérifiez d’abord avec les deux membres que le vélo a été rendu.')}
                    </span>
                  </div>
                ) : undefined
              }
              textes={{
                motif: p('Explication de la décision'),
                aideDuMotif: p('Elle est envoyée au cycliste et au Bike Sitter : écrivez-la pour eux.'),
                confirmer: p('Enregistrer la décision'),
                envoi: p('Enregistrement…'),
              }}
            />
          </>
        ) : (
          <div className="encart">
            <Icone nom="coche" taille={22} />
            <span>{p('Ce litige est tranché.')}</span>
          </div>
        )}
      </div>
    </main>
  );
}
