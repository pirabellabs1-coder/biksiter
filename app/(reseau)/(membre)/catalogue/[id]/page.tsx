import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { offreDuCatalogue } from '@/lib/depot/catalogue';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { comptesDuMembre, soldeDuMembre } from '@/lib/depot/maillons';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import {
  CATEGORIES_D_OFFRE,
  decisionDEchange,
  pointsManquants,
  stockAAfficher,
} from '@/lib/regles/catalogue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { p } = await textes();
  const offre = await offreDuCatalogue((await params).id);
  return { title: offre?.titre ?? p('Avantage') };
}

export default async function FicheDUnAvantage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id } = await params;
  const [offre, solde, comptes, _nonLues, _mesEmplacements] = await Promise.all(
    [
      offreDuCatalogue(id),
      soldeDuMembre(membre.id),
      comptesDuMembre(membre.id),
      nombreDeNotificationsNonLues(membre.id),
      nombreDEmplacements(membre.id),
    ],
  );
  if (!offre) notFound();

  const decision = decisionDEchange(offre, solde, comptes.accueillies);
  const manquants = pointsManquants(offre, solde);
  const stock = stockAAfficher(offre);
  const titreDeLaCategorie =
    CATEGORIES_D_OFFRE.find((c) => c.cle === offre.categorie)?.titre ??
    offre.categorie;

  return (
    <main id="contenu">
      <section className="app-screen active" id="recompense">
        <div className="page page-etroite" id="recompenseContenu">
          <nav className="fil" aria-label="Fil d’Ariane">
            <Link href="/catalogue">Catalogue</Link>
            <span>›</span>
            <Link href={`/catalogue?categorie=${offre.categorie}`}>
              {titreDeLaCategorie}
            </Link>
            <span>›</span>
            <b>{offre.titre}</b>
          </nav>

          <header className="rc-tete-grande">
            <div>
              <span className="reco-cat">{titreDeLaCategorie}</span>
              <h1>{offre.titre}</h1>
              <p className="gris">
                Offert par {offre.partenaire}
                {offre.quartier ? ` · ${offre.quartier}` : ''}
              </p>
            </div>
            <div className="rc-cout-grand">
              <b>{offre.coutEnMaillons}</b>
              <span>{offre.coutEnMaillons > 1 ? 'points' : 'point'}</span>
            </div>
          </header>

          <section className="bloc">
            <h2>Ce que vous obtenez</h2>
            <p>
              {offre.description ??
                `Un geste offert par ${offre.partenaire}, à retirer sur place.`}
            </p>
            <dl className="infos">
              <div className="info">
                <dt>Comment l’utiliser</dt>
                <dd>
                  <b>Présentez votre bon au comptoir.</b>
                  <span>
                    {offre.retrait ??
                      'Le bon s’affiche dans votre espace dès l’échange.'}
                  </span>
                </dd>
              </div>
              {stock ? (
                <div className="info">
                  <dt>Disponibilité</dt>
                  <dd>
                    <b>
                      {offre.stockRestant > 0
                        ? offre.stockRestant === 1
                          ? '1 exemplaire restant'
                          : `${offre.stockRestant} exemplaires restants`
                        : 'Épuisé pour le moment'}
                    </b>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="bloc">
            <h2>Le partenaire</h2>
            <div className="part-tete">
              <span className="part-ini" aria-hidden="true">
                {offre.partenaire.charAt(0)}
              </span>
              <div>
                <b>{offre.partenaire}</b>
                {offre.quartier ? (
                  <span className="gris">{offre.quartier}</span>
                ) : null}
              </div>
            </div>
          </section>

          <section className="bloc">
            <h2>Ce que le partenariat veut dire</h2>
            <ul className="liste-nette">
              <li>
                <b>Le commerce ne paie rien à l’association</b> et ne reçoit
                rien d’elle. Il offre un geste, c’est tout.
              </li>
              <li>
                <b>Aucune donnée ne lui est transmise.</b> Il voit un bon, pas
                un profil.
              </li>
              <li>
                <b>Il peut arrêter quand il veut</b>, et les bons déjà émis
                restent honorés jusqu’à leur date limite.
              </li>
            </ul>
          </section>

          <div className="actions-fin">
            {decision.possible ? (
              <Link className="bleu" href={`/catalogue/${offre.id}/confirmer`}>
                Échanger {offre.coutEnMaillons} points
              </Link>
            ) : (
              <button type="button" className="outline" disabled>
                {decision.motif === 'jamais_accueilli'
                  ? 'Les points arrivent dès votre première garde accueillie'
                  : decision.motif === 'rupture'
                    ? 'Épuisé pour le moment'
                    : decision.motif === 'solde_insuffisant'
                      ? manquants > 1
                        ? `Il vous manque ${manquants} points`
                        : 'Il vous manque 1 point'
                      : 'Ce geste n’est plus proposé'}
              </button>
            )}
            <Link className="outline" href="/catalogue">
              Retour au catalogue
            </Link>
          </div>

          <p className="mention">
            Vous avez {solde.acquis} {solde.acquis > 1 ? 'points' : 'point'}.
            Les points ne s’achètent pas : ils viennent des gardes menées à
            terme.
          </p>
        </div>
      </section>
    </main>
  );
}
