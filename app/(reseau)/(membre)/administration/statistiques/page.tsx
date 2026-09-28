import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { OngletsDeModeration } from '@/components/maquette/moderation/onglets';
import { statistiques } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { PERIODES_DE_STATISTIQUES } from '@/lib/regles/moderation';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Statistiques') };
}

export default async function StatistiquesDeModeration({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const { periode: demande } = await searchParams;
  const periode =
    PERIODES_DE_STATISTIQUES.find((x) => x.cle === demande) ??
    PERIODES_DE_STATISTIQUES[1];
  const chiffres = await statistiques(periode.cle);
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  // Sans période précédente, la comparaison se dit une fois sous les chiffres,
  // pas quatre fois dans chaque case.
  const sansComparaison = chiffres.gardesRealisees.variation === null;
  const evolution = (valeur: number | null, unite = '%') =>
    valeur === null
      ? null
      : p('{signe}{n} {unite} par rapport à la période précédente', {
          signe: valeur > 0 ? '+' : valeur < 0 ? '−' : '',
          n: Math.abs(valeur),
          unite,
        });

  return (
    <main id="contenu">
      <EnTeteDeModeration initiales={initiales} />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">STATISTIQUES</span>
          <h1>{p('Statistiques')}</h1>
          <p>
            {p(
              'Les indicateurs collectifs, pour comprendre comment se portent les gardes du réseau. Aucune donnée individuelle n’apparaît ici.',
            )}
          </p>
        </header>

        <OngletsDeModeration p={p} actif="statistiques" />

        <nav className="puces" aria-label={p('Période')}>
          {PERIODES_DE_STATISTIQUES.map((x) => (
            <Link
              key={x.cle}
              href={`/administration/statistiques?periode=${x.cle}`}
              className={x.cle === periode.cle ? 'puce active' : 'puce'}
              aria-current={x.cle === periode.cle ? 'page' : undefined}
            >
              {p(x.titre)}
            </Link>
          ))}
        </nav>

        <div className="mod-chiffres">
          <div>
            <b>{chiffres.gardesRealisees.valeur}</b>
            <span>
              {p(chiffres.gardesRealisees.valeur > 1 ? 'gardes réalisées' : 'garde réalisée')}
            </span>
            <i className="ind-note">
              {evolution(chiffres.gardesRealisees.variation)}
            </i>
          </div>
          <div>
            <b>
              {chiffres.tauxDeFinalisation.valeur === null
                ? '—'
                : `${chiffres.tauxDeFinalisation.valeur} %`}
            </b>
            <span>{p('gardes menées à terme')}</span>
            <i className="ind-note">
              {evolution(chiffres.tauxDeFinalisation.variation, p('points'))}
            </i>
          </div>
          <div className={chiffres.incidents.valeur > 0 ? 'alerte' : undefined}>
            <b>{chiffres.incidents.valeur}</b>
            <span>{p('incidents signalés')}</span>
            <i className="ind-note">
              {evolution(chiffres.incidents.variation)}
            </i>
          </div>
          <div>
            <b>{chiffres.bikeSittersActifs.valeur}</b>
            <span>{p('Bike Sitters actifs')}</span>
            <i className="ind-note">
              {evolution(chiffres.bikeSittersActifs.variation)}
            </i>
          </div>
        </div>
        {sansComparaison ? (
          <p className="petit texte-doux">
            {p('Pas encore de période précédente à comparer.')}
          </p>
        ) : null}

        <article className="mod-carte">
          <div className="mod-tete">
            <span className="mod-etat">{p('Gardes par quartier')}</span>
            <span className="gris">{p(periode.titre)}</span>
          </div>
          {chiffres.parQuartier.length === 0 ? (
            <p className="vide-onglet">
              {p('Aucune garde terminée sur cette période.')}
            </p>
          ) : (
            <ul className="liste-nette">
              {chiffres.parQuartier.map((quartier) => (
                <li key={quartier.quartier}>
                  <b>
                    {quartier.quartier} · {quartier.part} %
                  </b>
                  <span>{p(quartier.gardes > 1 ? '{n} gardes' : '{n} garde', { n: quartier.gardes })}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </main>
  );
}
