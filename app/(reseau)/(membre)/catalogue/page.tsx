import type { Metadata } from 'next';
import Link from 'next/link';

import { mesBons, offresDuCatalogue } from '@/lib/depot/catalogue';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { comptesDuMembre, soldeDuMembre } from '@/lib/depot/maillons';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import {
  CATEGORIES_D_OFFRE,
  type CategorieDOffre,
} from '@/lib/regles/catalogue';
import {
  POINTS_PAR_GARDE,
  POINTS_PAR_JOUR_SUPPLEMENTAIRE,
} from '@/lib/regles/maillons';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Catalogue') };
}

export default async function Catalogue({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { categorie: demandee } = await searchParams;
  const [offres, solde, comptes, bons, _nonLues, mesEmplacements] =
    await Promise.all([
      offresDuCatalogue(),
      soldeDuMembre(membre.id),
      comptesDuMembre(membre.id),
      mesBons(membre.id),
      nombreDeNotificationsNonLues(membre.id),
      nombreDEmplacements(membre.id),
    ]);

  const categorie =
    CATEGORIES_D_OFFRE.find((c) => c.cle === demandee)?.cle ?? null;
  const visibles = offres.filter(
    (offre) => !categorie || offre.categorie === categorie,
  );
  const categoriesPresentes = CATEGORIES_D_OFFRE.filter((c) =>
    offres.some((offre) => offre.categorie === c.cle),
  );
  const depenses = bons.reduce((total, bon) => total + bon.coutEnMaillons, 0);
  const lien = (cle: CategorieDOffre | null) =>
    cle ? `/catalogue?categorie=${cle}` : '/catalogue';

  return (
    <main id="contenu">
      <section className="app-screen active" id="catalogue">
        <div className="page">
          <header className="page-tete">
            <span className="kicker">CATALOGUE</span>
            <h1>Ce que vos points vous offrent.</h1>
            <p>
              Chaque garde menée à terme vous donne des points. Les commerces du
              quartier offrent un geste en échange — c’est leur façon de
              soutenir le réseau. Le catalogue est réservé aux Bike Sitters.
            </p>
          </header>

          {comptes.accueillies === 0 ? (
            // La feuille de la maquette réserve cet encart au compte tout neuf ;
            // ici, c'est l'absence de garde accueillie qui le fait apparaître.
            <div
              className="etat-vide"
              data-vide="points"
              style={{ display: 'block' }}
            >
              <span className="ev-i" aria-hidden="true">
                ★
              </span>
              <h3>Aucun point pour l’instant</h3>
              <p>
                Les points arrivent après votre première garde menée à terme :{' '}
                {POINTS_PAR_GARDE} points par garde, et{' '}
                {POINTS_PAR_JOUR_SUPPLEMENTAIRE} de plus par jour entamé au-delà
                du premier.
              </p>
              {mesEmplacements === 0 ? (
                <Link className="outline" href="/devenir-bike-sitter">
                  Proposer un emplacement
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="prog-stats" role="group" aria-label="Vos points">
            <div>
              <b data-solde>{solde.acquis}</b>
              <span>
                point{solde.acquis > 1 ? 's' : ''} disponible
                {solde.acquis > 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <b>{depenses}</b>
              <span>
                point{depenses > 1 ? 's' : ''} utilisé{depenses > 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <b>+{POINTS_PAR_GARDE}</b>
              <span>à la prochaine garde</span>
            </div>
          </div>

          {/* Un filtre ne s'affiche que s'il trie quelque chose : une
            catégorie sans offre mènerait à une liste vide. */}
          {categoriesPresentes.length > 1 ? (
            <nav className="cat-filtres" aria-label="Filtrer le catalogue">
              <Link
                href={lien(null)}
                className={categorie ? 'chip' : 'chip actif'}
                aria-current={categorie ? undefined : 'page'}
              >
                Tout
              </Link>
              {categoriesPresentes.map((c) => (
                <Link
                  key={c.cle}
                  href={lien(c.cle)}
                  className={c.cle === categorie ? 'chip actif' : 'chip'}
                  aria-current={c.cle === categorie ? 'page' : undefined}
                >
                  {c.titre}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="recos" id="listeRecompenses">
            {visibles.length > 0 ? (
              visibles.map((offre) => {
                const accessible =
                  offre.coutEnMaillons <= solde.acquis &&
                  offre.stockRestant > 0;
                const titreDeLaCategorie =
                  CATEGORIES_D_OFFRE.find((c) => c.cle === offre.categorie)
                    ?.titre ?? offre.categorie;
                return (
                  <article
                    className={accessible ? 'reco' : 'reco reco-bloquee'}
                    key={offre.id}
                  >
                    <div className="reco-tete">
                      <span className="reco-cat">
                        {offre.categorie === 'autre' ? '' : titreDeLaCategorie}
                      </span>
                      <span className="reco-cout">
                        <b>{offre.coutEnMaillons}</b> pts
                      </span>
                    </div>
                    <h3>{offre.titre}</h3>
                    <p>
                      {offre.partenaire}
                      {offre.quartier ? ` · ${offre.quartier}` : ''}
                    </p>
                    <div className="reco-actions">
                      {/* La maquette mettait cette action en bleu ; le bleu ne
                        dit que « vérifié » (règle 6), les actions restent
                        vertes. */}
                      <Link
                        className={accessible ? 'primary' : 'outline'}
                        href={`/catalogue/${offre.id}`}
                      >
                        {offre.stockRestant === 0
                          ? 'Épuisé pour le moment'
                          : accessible
                            ? 'Voir et échanger'
                            : `Encore ${offre.coutEnMaillons - solde.acquis} pts`}
                      </Link>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="gris">
                Aucun geste dans cette catégorie pour le moment.
              </p>
            )}
          </div>

          {bons.length > 0 ? (
            <p className="mention">
              <Link href="/catalogue/bons">
                Retrouver mes bons ({bons.length})
              </Link>
            </p>
          ) : null}

          <p className="mention">
            Les points n’ont aucune valeur monétaire et ne s’échangent pas
            contre de l’argent. Un geste offert reste à la discrétion du
            commerce partenaire, dans la limite de ses stocks.
          </p>
        </div>
      </section>
    </main>
  );
}
