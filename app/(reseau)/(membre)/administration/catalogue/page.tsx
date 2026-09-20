import type { Metadata } from 'next';
import Link from 'next/link';

import { NavigationDAdministration } from '@/components/app/administration';
import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { enPoints, ICONE_DE_LA_CATEGORIE } from '@/components/app/progression';
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
  await exigerUnModerateur();
  const { p } = await textes();
  const [{ enregistre }, offres] = await Promise.all([searchParams, offresEnGestion()]);

  return (
    <main id="contenu">
      <EnTete p={p} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Catalogue des avantages')}</h1>
        <p className="sous-titre">{p('Consultez et modifiez les avantages proposés par les partenaires du réseau.')}</p>
        <NavigationDAdministration p={p} actif="catalogue" />

        {enregistre ? (
          <div className="encart" role="status" style={{ marginBottom: 12 }}>
            <Icone nom="coche" taille={22} />
            <span>{p('Avantage enregistré.')}</span>
          </div>
        ) : null}

        <Link href="/administration/catalogue/nouvel-avantage" className="bouton plein" style={{ marginBottom: 12 }}>
          <Icone nom="plus" taille={20} />
          {p('Ajouter un avantage')}
        </Link>

        <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
          {offres.map((offre) => (
            <li key={offre.id}>
              <Link href={`/administration/catalogue/${offre.id}`} className="ligne">
                <span className="vignette-app petite" aria-hidden="true">
                  <Icone nom={ICONE_DE_LA_CATEGORIE[offre.categorie]} taille={26} />
                </span>
                <span className="ligne-texte">
                  <strong>{offre.titre}</strong>
                  <span>
                    {offre.partenaire} · {enPoints(p, offre.coutEnMaillons)}
                  </span>
                  <span>
                    {p('Stock : {n}', { n: offre.stockRestant })} · {p('{n} échange(s)', { n: offre.echanges })}
                  </span>
                </span>
                <span className={offre.active ? (offre.stockRestant > 0 ? 'pastille' : 'pastille ambre') : 'pastille gris'}>
                  {offre.active ? (offre.stockRestant > 0 ? p('Actif') : p('Épuisé')) : p('Désactivé')}
                </span>
                <Icone nom="chevron" taille={20} className="texte-leger" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
