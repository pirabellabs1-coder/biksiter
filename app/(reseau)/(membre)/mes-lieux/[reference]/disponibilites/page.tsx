import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { lieuDuMembre } from '@/lib/depot/lieux';
import { textes } from '@/lib/i18n/langue';
import { DELAIS_DE_REPONSE, DUREES_MAX_HEURES } from '@/lib/regles/creneau';
import { HEURES } from '@/lib/recherche-courante';
import { exigerUnMembre } from '@/lib/session';

import { enregistrerLesDisponibilitesDuLieu } from '../../actions';
import { FormulaireDeDisponibilites } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Disponibilités') };
}

/** Lundi d'abord : c'est l'ordre dans lequel on pense sa semaine. */
const ORDRE_DES_JOURS: readonly [number, string][] = [
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
  const { p } = await textes();
  const { reference } = await params;
  const nouveau = (await searchParams).nouveau === '1';
  const lieu = await lieuDuMembre(membre.id, reference);
  if (!lieu) notFound();

  return (
    <main id="contenu">
      <EnTete p={p} retour={nouveau ? `/mes-lieux/${reference}/photos?nouveau=1` : `/mes-lieux/${reference}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        {nouveau ? (
          <div className="etapes-app">
            <span>{p('Disponibilités')}</span>
            <span className="barre" aria-hidden="true">
              <span style={{ width: '100%' }} />
            </span>
            <span>3 / 3</span>
          </div>
        ) : null}
        <h1 className="titre-ecran">{p('Mes disponibilités')}</h1>
        <p className="sous-titre">
          {p('Vous précisez ici les créneaux pendant lesquels vous êtes disponible pour accueillir un vélo.')}
        </p>

        <FormulaireDeDisponibilites
          action={enregistrerLesDisponibilitesDuLieu.bind(null, reference, nouveau)}
          valeurs={{
            jours: lieu.jours,
            ouverture: lieu.ouverture ?? '08:00',
            fermeture: lieu.fermeture ?? '20:00',
            duree: lieu.dureeMaxHeures,
            delai: lieu.delaiDeReponse,
            fermetures: lieu.fermetures.join(', '),
          }}
          options={{
            jours: ORDRE_DES_JOURS.map(([valeur, libelle]) => [String(valeur), p(libelle)] as const),
            heures: HEURES,
            durees: Object.entries(DUREES_MAX_HEURES).map(([cle, libelle]) => [cle, p(libelle)] as const),
            delais: Object.entries(DELAIS_DE_REPONSE).map(([cle, libelle]) => [cle, p(libelle)] as const),
          }}
          textes={{
            jours: p('Jours d’accueil'),
            plage: p('Plage horaire'),
            debut: p('Début'),
            fin: p('Fin'),
            duree: p('Durée acceptée'),
            delai: p('Délai de réponse'),
            fermetures: p('Fermetures exceptionnelles (facultatif)'),
            fermeturesAide: p('Des dates au format AAAA-MM-JJ, séparées par une virgule.'),
            envoyer: nouveau ? p('Enregistrer le lieu') : p('Enregistrer'),
            envoi: p('Enregistrement…'),
          }}
        />

        <div className="encart" style={{ marginTop: 12 }}>
          <Icone nom="info" taille={22} />
          <span>
            {p('Pour accueillir un vélo plusieurs jours, écrivez à l’association : la modération ouvre cette possibilité.')}
          </span>
        </div>
      </div>
    </main>
  );
}
