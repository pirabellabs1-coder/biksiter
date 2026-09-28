import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { OngletsDeModeration } from '@/components/maquette/moderation/onglets';
import { candidaturesEnAttente, dossiersAVerifier } from '@/lib/depot/moderation';
import {
  litigesEnCours as chargerLesLitiges,
  rechercherDesMembres,
  signalements,
  statistiques,
  tableauDeBord,
} from '@/lib/depot/gestion';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { joursAvantSuppression } from '@/lib/regles/pieces';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Espace de modération') };
}

/**
 * Le tableau de bord de la modération, tel que dessiné dans l'écran
 * `#moderation` des maquettes définitives.
 *
 * Trois files d'attente, et rien d'autre : les dossiers d'identité, les
 * signalements ouverts, les litiges en cours. Chaque file n'affiche que ce
 * qu'un modérateur a besoin de voir pour décider — jamais l'adresse d'un
 * membre, jamais une conversation qui ne serait pas liée à un dossier
 * ouvert.
 */
export default async function TableauDeBordDeModeration() {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();

  const [
    chiffres,
    stats,
    dossiersIdentite,
    candidatures,
    signalementsOuverts,
    litiges,
    membres,
    nonLues,
  ] = await Promise.all([
    tableauDeBord(),
    statistiques('30j'),
    dossiersAVerifier(),
    candidaturesEnAttente(),
    signalements('ouvert'),
    chargerLesLitiges(),
    rechercherDesMembres('', 'suspendus'),
    nombreDeNotificationsNonLues(moderateur.id),
  ]);

  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();
  const maintenant = new Date();
  const taux = stats.tauxDeFinalisation.valeur;

  return (
    <main id="contenu">
      <EnTeteDeModeration
        retour="/profil"
        initiales={initiales}
        notificationsNonLues={nonLues}
      />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">ESPACE DE MODÉRATION</span>
          <h1>{p('Tableau de bord')}</h1>
          <p>
            {p(
              'Ces files rassemblent ce qui attend une décision. Les adresses complètes et les conversations ne s’affichent que dans un dossier ouvert, le temps de l’instruire.',
            )}
          </p>
        </header>

        <div className="mod-chiffres">
          <div>
            <b>{chiffres.gardesActives}</b>
            <span>{p('gardes en cours')}</span>
            <i className="ind-note">{p('objectif : chacune menée à son terme')}</i>
          </div>
          <div>
            <b>{taux === null ? '—' : `${taux} %`}</b>
            <span>{p('gardes menées à terme (30 jours)')}</span>
            <i className="ind-note">{p('objectif : 95 %')}</i>
          </div>
          <div className={chiffres.signalementsOuverts > 3 ? 'alerte' : undefined}>
            <b>{chiffres.signalementsOuverts}</b>
            <span>{p('signalements ouverts')}</span>
            <i className="ind-note">{p('objectif : rester sous les 3')}</i>
          </div>
          <div className={chiffres.litigesEnCours > 2 ? 'alerte' : undefined}>
            <b>{chiffres.litigesEnCours}</b>
            <span>{p('litiges en cours')}</span>
            <i className="ind-note">{p('objectif : rester sous les 2')}</i>
          </div>
        </div>

        <div className="mod-chiffres secondaire">
          <div>
            <b>{chiffres.verificationsEnAttente}</b>
            <span>{p('dossiers d’identité')}</span>
          </div>
          <div>
            <b>{candidatures.length}</b>
            <span>{p('candidatures d’emplacement')}</span>
          </div>
          <div>
            <b>{membres.comptes.suspendus}</b>
            <span>{p('comptes suspendus')}</span>
          </div>
          <div>
            <b>{chiffres.envoisEnEchec}</b>
            <span>{p('e-mails à renvoyer')}</span>
          </div>
        </div>

        <OngletsDeModeration p={p} actif="tableau" />

        {chiffres.envoisEnEchec > 0 ? (
          <article className="mod-carte urgent" role="status">
            <div className="mod-tete">
              <span className="mod-etat rouge">
                {p('Envoi d’e-mails en échec')}
              </span>
              <span className="gris">
                {p(chiffres.envoisEnEchec > 1 ? '{n} messages' : '{n} message', { n: chiffres.envoisEnEchec })}
              </span>
            </div>
            <p className="gris">
              {p(
                'Un ou plusieurs e-mails n’ont pas pu être envoyés. Le paramétrage du serveur d’envoi mérite d’être vérifié.',
              )}
            </p>
          </article>
        ) : null}

        <article className="mod-carte">
          <div className="mod-tete">
            <span className="mod-etat">
              {p('Dossiers d’identité en attente')}
            </span>
            <span className="gris">
              {p('{n} à examiner', { n: dossiersIdentite.length })}
            </span>
          </div>
          <h3>{p('Chaque pièce est examinée par une personne puis supprimée.')}</h3>
          <p className="gris">
            {p(
              'La photo d’identité n’est conservée que le temps de la décision. Le motif d’un refus est envoyé au membre pour qu’il puisse renvoyer une pièce valide.',
            )}
          </p>
          {dossiersIdentite.length === 0 ? (
            <p className="vide-onglet">
              {p('Aucun dossier d’identité en attente pour le moment.')}
            </p>
          ) : (
            <ul className="liste-nette">
              {dossiersIdentite.slice(0, 5).map((dossier) => {
                const restants = joursAvantSuppression(
                  new Date(dossier.deposeeLe),
                  maintenant,
                );
                return (
                  <li key={dossier.membreId}>
                    <b>
                      {dossier.prenom} {dossier.nom.at(0) ?? ''}.
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
          <div className="actions-fin">
            <Link
              href="/administration/verifications"
              className="primary"
            >
              {p('Ouvrir la file d’identité')}
            </Link>
            {candidatures.length > 0 ? (
              <Link
                href="/administration/verifications"
                className="outline"
              >
                {p(candidatures.length > 1 ? '{n} candidatures d’emplacement' : '{n} candidature d’emplacement', { n: candidatures.length })}
              </Link>
            ) : null}
          </div>
        </article>

        <article
          className={
            signalementsOuverts.length > 0 ? 'mod-carte urgent' : 'mod-carte'
          }
        >
          <div className="mod-tete">
            <span
              className={
                signalementsOuverts.length > 0 ? 'mod-etat rouge' : 'mod-etat'
              }
            >
              {p('Signalements ouverts')}
            </span>
            <span className="gris">
              {p('{n} à traiter', { n: signalementsOuverts.length })}
            </span>
          </div>
          <h3>{p('Les alertes remontées par les membres du réseau.')}</h3>
          <p className="gris">
            {p(
              'Un signalement est examiné, puis classé avec une note qui reste dans l’historique. Les membres impliqués sont prévenus quand une décision est prise.',
            )}
          </p>
          {signalementsOuverts.length === 0 ? (
            <p className="vide-onglet">
              {p('Aucun signalement ouvert pour le moment.')}
            </p>
          ) : (
            <ul className="liste-nette">
              {signalementsOuverts.slice(0, 4).map((signalement) => (
                <li key={signalement.id}>
                  <b>{p(signalement.motif)}</b>
                  <span>
                    {signalement.cibleLibelle ?? p('cible du signalement')}
                    {' · '}
                    {p('signalé le {date}', {
                      date: jourAffiche(jourABruxelles(new Date(signalement.creeLe))),
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="actions-fin">
            <Link
              href="/administration/signalements"
              className="primary"
            >
              {p('Ouvrir la file des signalements')}
            </Link>
          </div>
        </article>

        <article
          className={litiges.length > 0 ? 'mod-carte urgent' : 'mod-carte'}
        >
          <div className="mod-tete">
            <span
              className={litiges.length > 0 ? 'mod-etat rouge' : 'mod-etat'}
            >
              {p('Litiges en cours')}
            </span>
            <span className="gris">
              {p('{n} à trancher', { n: litiges.length })}
            </span>
          </div>
          <h3>{p('Les gardes signalées, à examiner des deux côtés.')}</h3>
          <p className="gris">
            {p(
              'Une décision explique ce qui a été retenu et comment les points sont attribués. Elle est envoyée au cycliste et au Bike Sitter.',
            )}
          </p>
          {litiges.length === 0 ? (
            <p className="vide-onglet">
              {p('Aucun litige en cours pour le moment.')}
            </p>
          ) : (
            <ul className="liste-nette">
              {litiges.slice(0, 4).map((litige) => (
                <li key={litige.id}>
                  <b>{litige.motif ? p(litige.motif) : p('Signalement')}</b>
                  <span>
                    {p('{cycliste} chez {bikeSitter}', {
                      cycliste: litige.prenomDuCycliste,
                      bikeSitter: litige.prenomDuBikeSitter,
                    })}
                    {' · '}
                    {litige.quartier}
                    {' · '}
                    {jourAffiche(jourABruxelles(new Date(litige.ouvertLe)))}{' '}
                    {heureABruxelles(new Date(litige.ouvertLe))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="actions-fin">
            <Link
              href="/administration/litiges"
              className="primary"
            >
              {p('Ouvrir la file des litiges')}
            </Link>
          </div>
        </article>

        <section className="bloc">
          <h2>{p('Ce que le modérateur ne voit pas')}</h2>
          <ul className="liste-nette">
            <li>
              <b>{p('L’adresse complète')}</b>{' '}
              {p(
                'd’un membre, sauf sur un dossier ouvert et seulement le temps de l’instruire.',
              )}
            </li>
            <li>
              <b>{p('Les conversations')}</b>{' '}
              {p('qui ne sont pas liées à un dossier ouvert.')}
            </li>
            <li>
              <b>{p('Les pièces d’identité')}</b>{' '}
              {p('sont supprimées dès que la décision a été enregistrée.')}
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
