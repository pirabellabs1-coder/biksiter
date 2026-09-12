import type { Metadata } from 'next';
import Link from 'next/link';

import BandeauDePage from '@/components/bandeau-de-page';
import BaseNonBranchee from '@/components/base-non-branchee';
import { baseConfiguree } from '@/lib/bd/client';
import { mesBons, offresDuCatalogue } from '@/lib/depot/catalogue';
import { comptesDuMembre, soldeDuMembre } from '@/lib/depot/maillons';
import { decisionDEchange, stockAAfficher } from '@/lib/regles/catalogue';
import { leSoldeSAffiche } from '@/lib/regles/maillons';
import { membreConnecte } from '@/lib/session';
import { enFrancais } from '@/lib/temps';

import CatalogueEchangeable, { type OffreAffichee } from './echange';

export const metadata: Metadata = {
  title: 'Le catalogue',
  description:
    'Des commerçants de quartier remercient celles et ceux qui accueillent des vélos chez eux. Ces avantages se gagnent en accueillant.',
};

export default async function Catalogue() {
  if (!baseConfiguree()) {
    return (
      <>
        <BandeauDePage
          surtitre="Catalogue"
          titre="Offert par nos partenaires."
          scene="garder"
        />
        <section className="section">
          <div className="section__interieur">
            <BaseNonBranchee />
          </div>
        </section>
      </>
    );
  }

  const membre = await membreConnecte();
  const offres = await offresDuCatalogue();

  const [solde, comptes, bons] = membre
    ? await Promise.all([
        soldeDuMembre(membre.id),
        comptesDuMembre(membre.id),
        mesBons(membre.id),
      ])
    : [{ acquis: 0, enAttente: 0 }, { accueillies: 0, confiees: 0 }, []];

  const accueille = leSoldeSAffiche(comptes.accueillies);

  const affichees: OffreAffichee[] = offres.map((offre) => ({
    id: offre.id,
    titre: offre.titre,
    partenaire: offre.partenaire,
    quartier: offre.quartier,
    coutEnMaillons: offre.coutEnMaillons,
    stock: stockAAfficher(offre),
    echangeable: decisionDEchange(offre, solde, comptes.accueillies).possible,
  }));

  const enCours = bons.filter((bon) => bon.utiliseLe === null);

  return (
    <>
      <BandeauDePage
        surtitre="Catalogue"
        titre="Offert par nos partenaires."
        retour={
          membre
            ? { href: '/mon-compte', libelle: 'Mon tableau de bord' }
            : undefined
        }
        scene="garder"
        chapeau={
          accueille ? (
            <>
              {comptes.accueillies} vélo
              {comptes.accueillies > 1 ? 's' : ''} accueilli
              {comptes.accueillies > 1 ? 's' : ''} — merci. Vous avez{' '}
              <strong>{solde.acquis} maillons</strong>.
            </>
          ) : (
            'Des commerçants du quartier remercient celles et ceux qui accueillent des vélos chez eux.'
          )
        }
        actions={
          accueille ? null : (
            <Link
              href="/proposer-un-emplacement"
              className="bouton bouton--principal"
            >
              Comment devient-on bike sitter&nbsp;?
            </Link>
          )
        }
      >
        {/* Dit une fois, en haut, calmement. Pas offre par offre, et sans
            jamais chiffrer ce qui manque. */}
        {accueille ? null : (
          <div className="encart">
            <p>
              Ces avantages remercient les personnes qui accueillent des vélos
              chez elles : chaque vélo accueilli rapporte des maillons,{' '}
              <strong>à échanger contre une offre</strong>. Faire garder son
              vélo reste, bien sûr, entièrement gratuit.
            </p>
          </div>
        )}
      </BandeauDePage>

      <section className="section" aria-labelledby="offres-titre">
        <div className="section__interieur">
          <div className="entete-de-section">
            <h2 id="offres-titre" className="titre-section">
              Les offres du moment
            </h2>
          </div>

          {offres.length === 0 ? (
            <div className="carte">
              <h3>Le catalogue est encore vide</h3>
              <p className="discret">
                Nous échangeons en ce moment avec les commerçants des quartiers
                ouverts. Les premières offres arriveront très bientôt.
              </p>
            </div>
          ) : (
            <CatalogueEchangeable offres={affichees} />
          )}
        </div>
      </section>

      {bons.length > 0 ? (
        <section
          className="section section--claire"
          aria-labelledby="bons-titre"
        >
          <div className="section__interieur">
            <div className="entete-de-section">
              <h2 id="bons-titre" className="titre-section">
                Mes échanges
                {enCours.length > 0
                  ? ` — ${enCours.length} bon${enCours.length > 1 ? 's' : ''} en cours`
                  : ''}
              </h2>
            </div>
            <ul className="bons">
              {bons.map((bon) => (
                <li key={bon.id} className="carte bon">
                  <div>
                    <h3>{bon.titre}</h3>
                    <p className="discret">
                      {bon.partenaire} · échangé le{' '}
                      {enFrancais(new Date(bon.echangeLe)).split(' à ')[0]}
                    </p>
                  </div>
                  <code className="bon__code">{bon.code}</code>
                  {bon.utiliseLe ? (
                    <span className="pastille pastille--neutre">Utilisé</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
