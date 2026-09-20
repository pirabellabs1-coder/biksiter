import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { FormulaireDeDecision } from '@/components/app/formulaire-de-decision';
import { Icone } from '@/components/app/icone';
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
  return { title: p('Membre') };
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

  return (
    <main id="contenu">
      <EnTete p={p} retour="/administration/membres" cloche={false} />
      <div className="ecran-app ecran-large fiche-detail">
        <div className="carte carte-profil">
          <span className="avatar-app grand" aria-hidden="true">
            {fiche.prenom.charAt(0)}
          </span>
          <span className="ligne-texte">
            <strong className="nom-profil">
              {fiche.prenom} {fiche.nom}
            </strong>
            <span>{fiche.email}</span>
            <span>{p('Membre depuis {annee}', { annee: fiche.membreDepuis })}</span>
            <span className={fiche.suspendu ? 'pastille rouge' : 'pastille'} style={{ marginTop: 4 }}>
              {fiche.suspendu ? p('Suspendu') : p('Actif')}
            </span>
          </span>
        </div>

        {indications.statut ? (
          <div className="encart" role="status" style={{ marginTop: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{fiche.suspendu ? p('Compte suspendu : ses sessions sont fermées.') : p('Compte réactivé.')}</span>
          </div>
        ) : null}
        {indications.points ? (
          <div className="encart" role="status" style={{ marginTop: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Correction enregistrée : le membre est prévenu.')}</span>
          </div>
        ) : null}

        <div className="tuiles" style={{ marginTop: 12 }}>
          <span className="tuile">
            <strong>{fiche.gardesAccueillies}</strong>
            <span>{p('gardes accueillies')}</span>
          </span>
          <span className="tuile">
            <strong>{fiche.gardesConfiees}</strong>
            <span>{p('gardes confiées')}</span>
          </span>
          <span className="tuile">
            <strong>{fiche.signalementsRecus}</strong>
            <span>{p('signalements reçus')}</span>
          </span>
        </div>

        <h2 className="titre-section">{p('Points')}</h2>
        <div className="encart solde-encart">
          <Icone nom="etoile" taille={24} plein />
          <span>
            <strong>{enPoints(p, fiche.solde.acquis)}</strong>
            {fiche.solde.enAttente > 0
              ? p('{n} points en attente', { n: fiche.solde.enAttente })
              : p('disponibles')}
          </span>
        </div>
        {fiche.id === moderateur.id ? (
          <p className="texte-doux">{p('Vos propres points se corrigent par une autre personne de l’équipe.')}</p>
        ) : (
        <div className="carte" style={{ marginTop: 10 }}>
          <FormulaireDeCorrection
            action={corrigerLeSolde.bind(null, fiche.id)}
            maximum={CORRECTION_MAXIMALE}
            textes={{
              ajouter: p('Ajouter des points'),
              retirer: p('Retirer des points'),
              nombre: p('Nombre de points'),
              motif: p('Motif de la correction'),
              aide: p('Le membre reçoit ce motif, et il reste dans l’historique.'),
              enregistrer: p('Enregistrer la correction'),
              envoi: p('Enregistrement…'),
            }}
          />
        </div>
        )}

        <h2 className="titre-section">{p('Statut du compte')}</h2>
        {gerable ? (
          <div className="carte">
            <FormulaireDeDecision
              action={changerLeStatutDuCompte.bind(null, fiche.id)}
              champsCaches={{ suspendre: fiche.suspendu ? 'non' : 'oui' }}
              confirmation={
                !fiche.suspendu && fiche.gardesEngagees > 0
                  ? p('Je suspends malgré la garde en cours.')
                  : undefined
              }
              choix={[]}
              avant={
                <div className="texte-doux pile" style={{ margin: 0, gap: 0 }}>
                  {fiche.suspendu
                    ? p('Réactiver le compte permet au membre de se reconnecter et de reprendre ses gardes.')
                    : p('Suspendre le compte ferme ses sessions, retire ses lieux des recherches et clôt ses demandes en attente.')}
                  {!fiche.suspendu && fiche.gardesEngagees > 0 ? (
                    <span className="encart ambre" style={{ marginTop: 8 }}>
                      <Icone nom="alerte" taille={20} />
                      <span>
                        {p('{n} garde(s) en cours avec ce membre : sans session, la remise du vélo par code ne sera plus possible.', {
                          n: fiche.gardesEngagees,
                        })}
                      </span>
                    </span>
                  ) : null}
                </div>
              }
              textes={{
                motif: p('Motif'),
                aideDuMotif: p('Il reste dans l’historique du compte.'),
                confirmer: fiche.suspendu ? p('Réactiver le compte') : p('Suspendre le compte'),
                envoi: p('Enregistrement…'),
              }}
            />
          </div>
        ) : (
          <p className="texte-doux">
            {p('Ce compte ne se suspend pas d’ici : il s’agit de vous ou d’une personne qui modère.')}
          </p>
        )}

        <h2 className="titre-section">{p('Historique des actions')}</h2>
        {fiche.actions.length === 0 ? (
          <p className="texte-doux">{p('Aucune action de modération sur ce compte.')}</p>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
            {fiche.actions.map((action, rang) => (
              <li key={rang} className="ligne ligne-info">
                <span className="ligne-texte">
                  <strong>{libelleDeLAction[action.action] ?? action.action}</strong>
                  <span>{action.motif}</span>
                  <span>
                    {jourAffiche(jourABruxelles(new Date(action.faitLe)))}
                    {action.parQui ? ` · ${action.parQui}` : ''}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
