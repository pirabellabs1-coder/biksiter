import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BaseNonBranchee from '@/components/base-non-branchee';
import ZoneApproximative from '@/components/zone-approximative';
import { baseConfiguree } from '@/lib/bd/client';
import { ficheParReference } from '@/lib/depot/emplacements';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';
import { peutDemanderUnStationnement } from '@/lib/regles/publication';
import { membrePourLesRegles } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  if (!baseConfiguree()) {
    return { title: 'Emplacement' };
  }

  const { reference } = await params;
  const fiche = await ficheParReference(reference);

  if (!fiche) {
    return { title: 'Emplacement introuvable' };
  }

  return {
    title: `Un emplacement près de ${fiche.quartier}`,
    description: `${fiche.type} chez ${fiche.prenomDuBikeSitter}, à quelques centaines de mètres de ${fiche.quartier}.`,
  };
}

export default async function FicheEmplacement({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  if (!baseConfiguree()) {
    return (
      <div className="page page--lecture">
        <h1 className="titre-page">Emplacement</h1>
        <BaseNonBranchee />
      </div>
    );
  }

  const { reference } = await params;

  // La fiche vient de la vue `emplacement_visible` : ni adresse exacte, ni
  // position exacte n'existent dans cet objet (règle 4).
  const fiche = await ficheParReference(reference);
  if (!fiche) {
    notFound();
  }

  const peutDemander = peutDemanderUnStationnement(await membrePourLesRegles());

  return (
    <div className="page page--lecture">
      <p className="surtitre">
        <Link href="/emplacements" className="lien">
          Tous les emplacements
        </Link>
      </p>

      <h1 className="titre-page">Un emplacement près de {fiche.quartier}</h1>
      <p className="chapeau">
        {fiche.type}, chez {fiche.prenomDuBikeSitter}. La carte montre une zone
        d’environ {fiche.rayonDeLaZone} mètres : l’adresse exacte vous sera
        donnée par {fiche.prenomDuBikeSitter} si votre demande est acceptée.
      </p>

      <ZoneApproximative
        taches={[{ latitude: fiche.latitude, longitude: fiche.longitude }]}
      />

      <h2 className="titre-section titre-section--aere">Ce qu’il faut savoir</h2>
      <dl className="details">
        <div>
          <dt>Type d’emplacement</dt>
          <dd>{fiche.type}</dd>
        </div>
        <div>
          <dt>Vélos accueillis en même temps</dt>
          <dd>{fiche.capacite}</dd>
        </div>
        <div>
          <dt>Fermeture</dt>
          <dd>{VERROUILLAGES[fiche.verrouillage]}</dd>
        </div>
        <div>
          <dt>Intempéries</dt>
          <dd>{INTEMPERIES[fiche.intemperie]}</dd>
        </div>
        <div>
          <dt>Accès avec le vélo</dt>
          <dd>{fiche.acces}</dd>
        </div>
        <div>
          <dt>Ancrage sur place</dt>
          <dd>{fiche.ancrage}</dd>
        </div>
        <div>
          <dt>Vélos acceptés</dt>
          <dd>{fiche.velosAcceptes.join(', ')}</dd>
        </div>
        <div>
          <dt>En plus</dt>
          <dd>
            {fiche.services.length > 0
              ? fiche.services.join(', ')
              : 'Rien de particulier'}
          </dd>
        </div>
        <div>
          <dt>Adresse exacte</dt>
          <dd>après acceptation de votre demande</dd>
        </div>
      </dl>

      {fiche.precisions ? (
        <>
          <h2 className="titre-section titre-section--aere">
            Ce que {fiche.prenomDuBikeSitter} précise
          </h2>
          <p className="discret">{fiche.precisions}</p>
        </>
      ) : null}

      {peutDemander ? (
        <Link
          href={`/emplacements/${fiche.reference}/demande`}
          className="bouton bouton--principal bouton--large"
        >
          Demander un stationnement
        </Link>
      ) : (
        <div className="encart">
          <p>
            <strong>Demander suppose un compte vérifié.</strong> C’est la
            contrepartie de ce qu’on demande à {fiche.prenomDuBikeSitter} :
            ouvrir sa porte à quelqu’un suppose de savoir qui c’est. On entre
            aujourd’hui sur invitation d’un membre.
          </p>
          <div className="boutons">
            <Link href="/invitation" className="bouton bouton--principal">
              J’ai une invitation
            </Link>
            <Link href="/liste-attente" className="bouton bouton--discret">
              Je n’en ai pas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
