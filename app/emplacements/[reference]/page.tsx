import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ZoneApproximative from '@/components/zone-approximative';
import {
  EMPLACEMENTS_DE_DEMONSTRATION,
  emplacementParReference,
} from '@/lib/donnees/emplacements-de-demonstration';
import { ficheVisible } from '@/lib/regles/adresse';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';
import { peutDemanderUnStationnement } from '@/lib/regles/publication';
import { membreCourant } from '@/lib/session';

export function generateStaticParams() {
  return EMPLACEMENTS_DE_DEMONSTRATION.map(({ reference }) => ({ reference }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  const emplacement = emplacementParReference(reference);

  if (!emplacement) {
    return { title: 'Emplacement introuvable' };
  }

  return {
    title: `Un emplacement près de ${emplacement.quartier}`,
    description: `${emplacement.type} chez ${emplacement.prenomDuBikeSitter}, à quelques centaines de mètres de ${emplacement.quartier}.`,
  };
}

export default async function FicheEmplacement({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const complet = emplacementParReference(reference);

  if (!complet) {
    notFound();
  }

  // Règle 4 : l'adresse exacte ne franchit pas cette ligne. `ficheVisible`
  // retire le champ du type lui-même, donc l'oublier ne compilerait pas.
  const fiche = ficheVisible(complet);
  const peutDemander = peutDemanderUnStationnement(membreCourant());

  return (
    <div className="page page--lecture">
      <p className="surtitre">
        <Link href="/emplacements" className="lien">
          Tous les emplacements
        </Link>
      </p>

      <h1 className="titre-page">
        Un emplacement près de {fiche.quartier}
      </h1>
      <p className="chapeau">
        {complet.type}, chez {fiche.prenomDuBikeSitter}. La carte montre une
        zone d’environ {fiche.rayonDeLaZone} mètres : l’adresse exacte vous sera
        donnée par {fiche.prenomDuBikeSitter} si votre demande est acceptée.
      </p>

      <ZoneApproximative taches={[{ x: 50, y: 45 }]} />

      <h2 className="titre-section titre-section--aere">
        Ce qu’il faut savoir
      </h2>
      <dl className="details">
        <div>
          <dt>Type d’emplacement</dt>
          <dd>{complet.type}</dd>
        </div>
        <div>
          <dt>Vélos accueillis en même temps</dt>
          <dd>{complet.capacite}</dd>
        </div>
        <div>
          <dt>Fermeture</dt>
          <dd>{VERROUILLAGES[complet.verrouillage]}</dd>
        </div>
        <div>
          <dt>Intempéries</dt>
          <dd>{INTEMPERIES[complet.intemperie]}</dd>
        </div>
        <div>
          <dt>Accès avec le vélo</dt>
          <dd>{complet.acces}</dd>
        </div>
        <div>
          <dt>Ancrage sur place</dt>
          <dd>{complet.ancrage}</dd>
        </div>
        <div>
          <dt>Vélos acceptés</dt>
          <dd>{complet.velosAcceptes.join(', ')}</dd>
        </div>
        <div>
          <dt>En plus</dt>
          <dd>
            {complet.services.length > 0
              ? complet.services.join(', ')
              : 'Rien de particulier'}
          </dd>
        </div>
        <div>
          <dt>Adresse exacte</dt>
          <dd>après acceptation de votre demande</dd>
        </div>
      </dl>

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
