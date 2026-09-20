import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { ICONE_DE_LA_CATEGORIE, enPoints, motifDuRefusDEchange } from '@/components/app/progression';
import { offreDuCatalogue } from '@/lib/depot/catalogue';
import { comptesDuMembre, soldeDuMembre } from '@/lib/depot/maillons';
import { textes } from '@/lib/i18n/langue';
import { decisionDEchange, pointsManquants, stockAAfficher } from '@/lib/regles/catalogue';
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
  const { p } = await textes();
  const { id } = await params;
  const [offre, solde, comptes] = await Promise.all([
    offreDuCatalogue(id),
    soldeDuMembre(membre.id),
    comptesDuMembre(membre.id),
  ]);
  if (!offre) notFound();

  const decision = decisionDEchange(offre, solde, comptes.accueillies);
  const manquants = pointsManquants(offre, solde);
  const stock = stockAAfficher(offre);

  return (
    <main id="contenu" className="avec-barre-d-action">
      <EnTete p={p} retour="/catalogue" />
      <div className="ecran-app ecran-large">
        <div className="offre-hero" aria-hidden="true">
          <span className="pastille">
            <Icone nom="bouclier" taille={14} />
            {p('Partenaire {nom}', { nom: offre.partenaire })}
          </span>
          <Icone nom={ICONE_DE_LA_CATEGORIE[offre.categorie]} taille={84} strokeWidth={1.3} />
        </div>
        <h1 className="titre-ecran">{offre.titre}</h1>
        {offre.description ? <p className="sous-titre">{offre.description}</p> : null}

        <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
          <li className="ligne ligne-info">
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="maison" taille={24} />
            </span>
            <span className="ligne-texte">
              <strong>{offre.partenaire}</strong>
              <span>
                {offre.quartier
                  ? p('Partenaire du réseau · {quartier}', { quartier: offre.quartier })
                  : p('Partenaire du réseau')}
              </span>
            </span>
          </li>
          {offre.retrait ? (
            <li className="ligne ligne-info">
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom="epingle" taille={24} />
              </span>
              <span className="ligne-texte">
                <strong>{p('Retrait chez le partenaire')}</strong>
                <span>{offre.retrait}</span>
              </span>
            </li>
          ) : null}
          {stock ? (
            <li className="ligne ligne-info">
              <span className="ligne-icone" aria-hidden="true">
                <Icone nom="cadeau" taille={24} />
              </span>
              <span className="ligne-texte">
                <strong>{p('Disponibilité')}</strong>
                <span>
                  {offre.stockRestant > 0
                    ? offre.stockRestant === 1
                      ? p('1 exemplaire restant')
                      : p('{n} exemplaires restants', { n: offre.stockRestant })
                    : p('Épuisé pour le moment')}
                </span>
              </span>
            </li>
          ) : null}
        </ul>

        <div className="encart solde-encart" style={{ marginTop: 12 }}>
          <span className="rond-etat" style={{ width: 44, height: 44, boxShadow: 'none' }} aria-hidden="true">
            <Icone nom="etoile" taille={22} plein />
          </span>
          <span>
            <strong>{enPoints(p, offre.coutEnMaillons)}</strong>
            {p('Vous avez {n} points', { n: solde.acquis })}
          </span>
        </div>
      </div>

      <div className="barre-d-action">
        {decision.possible ? (
          <Link href={`/catalogue/${offre.id}/confirmer`} className="bouton plein">
            {p('Échanger contre {n} points', { n: offre.coutEnMaillons })}
          </Link>
        ) : (
          <button type="button" className="bouton plein" disabled>
            {motifDuRefusDEchange(p, decision.motif, manquants)}
          </button>
        )}
        <p className="petit texte-doux centre" style={{ margin: '8px 0 0' }}>
          <Icone nom="info" taille={15} /> {p('Les points ne peuvent pas être achetés.')}
        </p>
      </div>
    </main>
  );
}
