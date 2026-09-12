import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BandeauDePage from '@/components/bandeau-de-page';
import BaseNonBranchee from '@/components/base-non-branchee';

import Fiche from './fiche';
import { baseConfiguree } from '@/lib/bd/client';
import { avisDeLEmplacement } from '@/lib/depot/avis';
import {
  creneauxAcceptesDuJour,
  ficheParReference,
  signauxDeLEmplacement,
} from '@/lib/depot/emplacements';
import { photosDeLEmplacement } from '@/lib/depot/photos';
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
    title: `${fiche.type} à ${fiche.quartier}`,
    description: `${fiche.type} chez ${fiche.prenomDuBikeSitter}, à quelques centaines de mètres de ${fiche.quartier}. Gratuit, entre membres vérifiés.`,
  };
}

export default async function FicheEmplacement({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  if (!baseConfiguree()) {
    return (
      <>
        <BandeauDePage titre="Emplacement" />
        <section className="section">
          <div className="section__interieur">
            <BaseNonBranchee />
          </div>
        </section>
      </>
    );
  }

  const { reference } = await params;

  // La fiche vient de la vue `emplacement_visible` : ni adresse exacte, ni
  // position exacte n'existent dans cet objet (règle 4).
  const fiche = await ficheParReference(reference);
  if (!fiche) {
    notFound();
  }

  const aujourdhui = new Date();

  const [signaux, photos, avis, creneaux, membre] = await Promise.all([
    signauxDeLEmplacement(reference),
    photosDeLEmplacement(reference),
    avisDeLEmplacement(reference),
    creneauxAcceptesDuJour(reference, aujourdhui),
    membrePourLesRegles(),
  ]);

  return (
    <div className="page">
      <nav aria-label="Fil d’Ariane" className="fil-ariane">
        <Link href="/emplacements">Emplacements</Link>
        <span aria-hidden="true"> › </span>
        <span>{fiche.quartier}</span>
        <span aria-hidden="true"> › </span>
        <span>{fiche.type}</span>
      </nav>

      <Fiche
        fiche={fiche}
        signaux={signaux}
        photos={photos}
        avis={avis}
        creneaux={creneaux}
        jour={aujourdhui}
        peutDemander={peutDemanderUnStationnement(membre)}
      />
    </div>
  );
}
