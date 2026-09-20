import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { ICONE_DE_LA_CATEGORIE, enPoints } from '@/components/app/progression';
import { mesBons, offresDuCatalogue } from '@/lib/depot/catalogue';
import { comptesDuMembre, soldeDuMembre } from '@/lib/depot/maillons';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { CATEGORIES_D_OFFRE, type CategorieDOffre } from '@/lib/regles/catalogue';
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
  const { p } = await textes();
  const { categorie: demandee, q } = await searchParams;
  const [offres, solde, comptes, bons, nonLues] = await Promise.all([
    offresDuCatalogue(),
    soldeDuMembre(membre.id),
    comptesDuMembre(membre.id),
    mesBons(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);

  const categorie = CATEGORIES_D_OFFRE.find((c) => c.cle === demandee)?.cle ?? null;
  const recherche = (typeof q === 'string' ? q : '').trim().slice(0, 60).toLocaleLowerCase('fr');
  const visibles = offres.filter(
    (offre) =>
      (!categorie || offre.categorie === categorie) &&
      (!recherche ||
        offre.titre.toLocaleLowerCase('fr').includes(recherche) ||
        offre.partenaire.toLocaleLowerCase('fr').includes(recherche)),
  );
  const lien = (cle: CategorieDOffre | null) => {
    const params = new URLSearchParams();
    if (cle) params.set('categorie', cle);
    if (recherche) params.set('q', recherche);
    const chaine = params.toString();
    return chaine ? `/catalogue?${chaine}` : '/catalogue';
  };

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues} retour="/progression" />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Catalogue')}</h1>
        <p className="sous-titre">
          {p('Des avantages pour équiper, entretenir et profiter pleinement de votre vélo.')}
        </p>

        <div className="encart solde-encart">
          <span className="rond-etat" style={{ width: 44, height: 44, boxShadow: 'none' }} aria-hidden="true">
            <Icone nom="etoile" taille={22} plein />
          </span>
          <span>
            <strong>{p('{n} points disponibles', { n: solde.acquis })}</strong>
            {comptes.accueillies > 0
              ? p('Gagnés grâce à vos gardes')
              : p('Les avantages s’ouvrent dès votre première garde accueillie.')}
          </span>
        </div>

        {bons.length > 0 ? (
          <Link href="/catalogue/bons" className="ligne carte" style={{ marginTop: 10 }}>
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="cadeau" taille={24} />
            </span>
            <span className="ligne-texte">
              <strong>{p('Mes bons')}</strong>
              <span>{bons.length === 1
                  ? p('1 avantage échangé')
                  : p('{n} avantages échangés', { n: bons.length })}</span>
            </span>
            <Icone nom="chevron" taille={20} className="texte-leger" />
          </Link>
        ) : null}

        <form action="/catalogue" method="get" role="search" style={{ marginTop: 12 }}>
          {categorie ? <input type="hidden" name="categorie" value={categorie} /> : null}
          <label className="champ-app champ-recherche">
            <Icone nom="recherche" taille={20} />
            <span className="lecteur">{p('Rechercher un avantage')}</span>
            <input
              type="search"
              name="q"
              defaultValue={recherche}
              maxLength={60}
              placeholder={p('Rechercher un avantage')}
            />
          </label>
        </form>

        <nav className="puces" aria-label={p('Catégories')}>
          <Link href={lien(null)} className={categorie ? 'puce' : 'puce active'} aria-current={categorie ? undefined : 'page'}>
            {p('Tous')}
          </Link>
          {CATEGORIES_D_OFFRE.map((c) => (
            <Link
              key={c.cle}
              href={lien(c.cle)}
              className={c.cle === categorie ? 'puce active' : 'puce'}
              aria-current={c.cle === categorie ? 'page' : undefined}
            >
              {p(c.titre)}
            </Link>
          ))}
        </nav>

        {visibles.length === 0 ? (
          <div className="carte vide-liste" style={{ marginTop: 14 }}>
            <Icone nom="recherche" taille={30} className="texte-leger" />
            <strong>{p('Aucun avantage ne correspond.')}</strong>
            <Link href="/catalogue" className="lien-souligne">
              {p('Voir tout le catalogue')}
            </Link>
          </div>
        ) : (
          <ul className="grille-offres" style={{ listStyle: 'none', padding: 0, marginTop: 14 }}>
            {visibles.map((offre) => (
              <li key={offre.id} style={{ display: 'contents' }}>
                <Link href={`/catalogue/${offre.id}`} className="offre-carte">
                  <span className="offre-visuel">
                    <span className={offre.stockRestant > 0 ? 'pastille' : 'pastille gris'}>
                      {offre.stockRestant > 0 ? p('Disponible') : p('Épuisé')}
                    </span>
                    <Icone nom={ICONE_DE_LA_CATEGORIE[offre.categorie]} taille={44} strokeWidth={1.5} />
                  </span>
                  <strong>{offre.titre}</strong>
                  <span className="offre-pied">
                    <span className="pastille">{enPoints(p, offre.coutEnMaillons)}</span>
                    <Icone nom="chevron" taille={18} className="texte-leger" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
