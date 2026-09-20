import type { Metadata } from 'next';
import Link from 'next/link';

import {
  MISE_A_JOUR_DES_CONDITIONS,
  SECTIONS_DES_CONDITIONS,
} from '@/lib/contenu/conditions';
import { textes } from '@/lib/i18n/langue';

import {
  BlocDeCote,
  PagePublique,
  SectionsDeTexte,
  Sommaire,
  VersionDuTexte,
} from '../page-publique';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Conditions d’utilisation') };
}

export default async function ConditionsDUtilisation({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lesTextes = await textes();
  const { p } = lesTextes;
  const { section } = await searchParams;

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Vos droits')}
      titre={p('Conditions d’utilisation')}
      introduction={p(
        'En utilisant Bike Sitters, vous acceptez les conditions suivantes. Elles expliquent comment fonctionne le réseau et ce que chacun s’engage à faire.',
      )}
      enTete={
        <VersionDuTexte
          textes={lesTextes}
          miseAJour={MISE_A_JOUR_DES_CONDITIONS}
        />
      }
      coteAGauche
      cote={
        <>
          <BlocDeCote titre={p('Sommaire')}>
            <Sommaire
              numerote
              entrees={SECTIONS_DES_CONDITIONS.map(
                (s) =>
                  [
                    p(s.titre),
                    `/conditions-generales?section=${s.cle}#${s.cle}`,
                  ] as const,
              )}
            />
          </BlocDeCote>
          <BlocDeCote titre={p('Vos données')}>
            <p>
              {p('Vos données personnelles sont traitées selon la')}{' '}
              <Link
                href="/confidentialite"
                className="lien-souligne texte-vert"
              >
                {p('politique de confidentialité')}
              </Link>
              .
            </p>
          </BlocDeCote>
        </>
      }
    >
      <SectionsDeTexte
        p={p}
        sections={SECTIONS_DES_CONDITIONS}
        ouverte={typeof section === 'string' ? section : undefined}
      />
    </PagePublique>
  );
}
