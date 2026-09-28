import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { OngletsDeModeration } from '@/components/maquette/moderation/onglets';
import { enPoints } from '@/components/app/progression';
import { offresEnGestion } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Catalogue des avantages') };
}

export default async function CatalogueEnGestion({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const [{ enregistre }, offres] = await Promise.all([
    searchParams,
    offresEnGestion(),
  ]);
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  return (
    <main id="contenu">
      <EnTeteDeModeration initiales={initiales} />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">CATALOGUE D’AVANTAGES</span>
          <h1>{p('Avantages des partenaires')}</h1>
          <p>
            {p(
              'Ces avantages sont offerts aux membres du réseau contre leurs points. Modifier un avantage n’affecte jamais les bons déjà remis.',
            )}
          </p>
        </header>

        <OngletsDeModeration p={p} actif="catalogue" />

        {enregistre ? (
          <article className="mod-carte" role="status">
            <div className="mod-tete">
              <span className="mod-etat">{p('Avantage enregistré')}</span>
            </div>
            <p className="gris">
              {enregistre === 'masque'
                ? p('Il reste masqué aux membres tant qu’il n’est pas activé.')
                : p('Il est déjà visible dans le catalogue des membres.')}
            </p>
          </article>
        ) : null}

        <div className="actions-fin" style={{ marginTop: 0, marginBottom: 12 }}>
          <Link
            href="/administration/catalogue/nouvel-avantage"
            className="primary"
          >
            {p('Ajouter un avantage')}
          </Link>
        </div>

        {offres.length === 0 ? (
          <article className="mod-carte">
            <div className="mod-tete">
              <span className="mod-etat">{p('Catalogue vide')}</span>
            </div>
            <p className="vide-onglet">
              {p('Aucun avantage n’est proposé pour le moment.')}
            </p>
          </article>
        ) : (
          offres.map((offre) => (
            <article key={offre.id} className="mod-carte">
              <div className="mod-tete">
                <span
                  className={
                    offre.active && offre.stockRestant > 0
                      ? 'mod-etat vert'
                      : 'mod-etat'
                  }
                >
                  {offre.active
                    ? offre.stockRestant > 0
                      ? `${p('Actif')}`
                      : `${p('Épuisé')}`
                    : `${p('Désactivé')}`}
                </span>
                <span className="gris">{offre.partenaire}</span>
              </div>
              <h3>
                <Link href={`/administration/catalogue/${offre.id}`}>
                  {offre.titre}
                </Link>
              </h3>
              <p className="gris">
                {enPoints(p, offre.coutEnMaillons)} ·{' '}
                {p('Stock : {n}', { n: offre.stockRestant })} ·{' '}
                {p(offre.echanges > 1 ? '{n} échanges' : '{n} échange', { n: offre.echanges })}
              </p>
              <div className="actions-fin">
                <Link
                  href={`/administration/catalogue/${offre.id}`}
                  className="outline"
                >
                  {p('Modifier l’avantage')}
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
