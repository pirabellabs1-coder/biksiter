import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JoursEtHoraires } from '@/components/maquette/sitter/jours-et-horaires';
import { lieuDuMembre, mesLieux } from '@/lib/depot/lieux';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { HEURES } from '@/lib/recherche-courante';
import {
  DUREES_MAX_HEURES,
  heureDe,
  heureFrancaise,
  PREMIER_DEPOT_MINUTES,
} from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';

import { enregistrerLesDisponibilitesDuLieu } from '../../actions';

export const metadata: Metadata = { title: 'Vos disponibilités' };

const HEURE_D_OUVERTURE_LA_PLUS_TOT = heureDe(PREMIER_DEPOT_MINUTES);

/** Lundi d'abord : c'est l'ordre dans lequel on pense sa semaine. */
const ORDRE_DES_JOURS: readonly (readonly [number, string])[] = [
  [1, 'Lun'],
  [2, 'Mar'],
  [3, 'Mer'],
  [4, 'Jeu'],
  [5, 'Ven'],
  [6, 'Sam'],
  [0, 'Dim'],
];

export default async function DisponibilitesDuLieu({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { reference } = await params;
  const nouveau = (await searchParams).nouveau === '1';
  const [lieu, _lieux, _nonLues] = await Promise.all([
    lieuDuMembre(membre.id, reference),
    mesLieux(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);
  if (!lieu) notFound();

  return (
    <main id="contenu">
      <div className="dashboard-wrap" id="bsdispo">
        {nouveau ? (
          <div className="etapes-app">
            <span>Disponibilités</span>
            <span className="barre" aria-hidden="true">
              <span style={{ width: '100%' }} />
            </span>
            <span>3 / 3</span>
          </div>
        ) : null}
        <h1>Vos disponibilités</h1>
        <p className="bs-intro">
          Vous apparaissez dans les recherches sur ces créneaux. Vous pourrez
          les changer à tout moment, ou mettre l’accueil en pause.
        </p>

        <JoursEtHoraires
          action={enregistrerLesDisponibilitesDuLieu.bind(
            null,
            reference,
            nouveau,
          )}
          valeurs={{
            jours: lieu.jours,
            ouverture: lieu.ouverture ?? '08:00',
            fermeture: lieu.fermeture ?? '20:00',
            duree: lieu.dureeMaxHeures,
            delai: lieu.delaiDeReponse,
            fermetures: lieu.fermetures.join(', '),
          }}
          options={{
            jours: ORDRE_DES_JOURS,
            // Aucun dépôt n'a lieu avant 6 h : proposer des heures plus
            // tôt laisserait déclarer un accueil qui ne recevrait personne.
            heures: HEURES.filter(
              (heure) => heure >= HEURE_D_OUVERTURE_LA_PLUS_TOT,
            ).map((heure) => [heure, heureFrancaise(heure)] as const),
            durees: Object.entries(DUREES_MAX_HEURES).map(
              ([heures, libelle]) => [Number(heures), libelle] as const,
            ),
          }}
          envoyer={nouveau ? 'Publier mon emplacement' : 'Enregistrer'}
        />
      </div>
    </main>
  );
}
