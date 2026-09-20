import type { Metadata } from 'next';
import Link from 'next/link';

import { NavigationDAdministration } from '@/components/app/administration';
import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { statistiques } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { PERIODES_DE_STATISTIQUES } from '@/lib/regles/moderation';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Statistiques') };
}

export default async function Statistiques({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await exigerUnModerateur();
  const { p } = await textes();
  const { periode: demande } = await searchParams;
  const periode = PERIODES_DE_STATISTIQUES.find((x) => x.cle === demande) ?? PERIODES_DE_STATISTIQUES[1];
  const chiffres = await statistiques(periode.cle);

  const evolution = (valeur: number | null, unite = '%') =>
    valeur === null
      ? p('Pas de période précédente à comparer')
      : p('{signe}{n} {unite} par rapport à la période précédente', {
          signe: valeur > 0 ? '+' : valeur < 0 ? '−' : '',
          n: Math.abs(valeur),
          unite,
        });
  const tuiles: [NomDIcone, string, string, string][] = [
    ['velo', String(chiffres.gardesRealisees.valeur), p('gardes réalisées'), evolution(chiffres.gardesRealisees.variation)],
    [
      'coche',
      chiffres.tauxDeFinalisation.valeur === null ? '—' : `${chiffres.tauxDeFinalisation.valeur} %`,
      p('taux de finalisation'),
      evolution(chiffres.tauxDeFinalisation.variation, p('points')),
    ],
    ['alerte', String(chiffres.incidents.valeur), p('incidents signalés'), evolution(chiffres.incidents.variation)],
    ['utilisateurs', String(chiffres.bikeSittersActifs.valeur), p('Bike Sitters actifs'), evolution(chiffres.bikeSittersActifs.variation)],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Statistiques')}</h1>
        <p className="sous-titre">{p('L’activité du réseau, en chiffres collectifs.')}</p>
        <NavigationDAdministration p={p} actif="statistiques" />

        <nav className="segments" aria-label={p('Période')}>
          {PERIODES_DE_STATISTIQUES.map((x) => (
            <Link
              key={x.cle}
              href={`/administration/statistiques?periode=${x.cle}`}
              aria-current={x.cle === periode.cle ? 'page' : undefined}
            >
              {p(x.titre)}
            </Link>
          ))}
        </nav>

        <div className="deux-colonnes" style={{ alignItems: 'stretch' }}>
          {tuiles.map(([icone, valeur, libelle, detail]) => (
            <div key={libelle} className="carte" style={{ display: 'grid', gap: 4 }}>
              <Icone nom={icone} taille={24} className={icone === 'alerte' ? 'texte-rouge' : 'texte-vert'} />
              <strong style={{ fontSize: 24 }}>{valeur}</strong>
              <span className="petit">{libelle}</span>
              <span className="petit texte-doux">{detail}</span>
            </div>
          ))}
        </div>

        <h2 className="titre-section">{p('Gardes par quartier')}</h2>
        {chiffres.parQuartier.length === 0 ? (
          <p className="texte-doux">{p('Aucune garde terminée sur cette période.')}</p>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
            {chiffres.parQuartier.map((quartier) => (
              <li key={quartier.quartier} className="ligne ligne-info" style={{ flexWrap: 'wrap' }}>
                <span className="ligne-texte">
                  <strong>{quartier.quartier}</strong>
                  <span>{p('{n} garde(s)', { n: quartier.gardes })}</span>
                </span>
                <strong>{quartier.part} %</strong>
                <span className="jauge" aria-hidden="true" style={{ flexBasis: '100%' }}>
                  <span style={{ width: `${quartier.part}%` }} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
