import type { Metadata } from 'next';
import Link from 'next/link';

import BarreDuMembre from '@/components/barre-du-membre';
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
    'Des commerçants de quartier remercient celles et ceux qui accueillent des vélos chez eux. Ces avantages ne s’achètent pas.',
};

export default async function Catalogue() {
  const entete = (
    <>
      <p className="surtitre">Catalogue</p>
      <h1 className="titre-page">Offert par nos partenaires</h1>
    </>
  );

  if (!baseConfiguree()) {
    return (
      <div className="page page--lecture">
        {entete}
        <BaseNonBranchee />
      </div>
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
    <div className="page page--lecture">
      {membre ? <BarreDuMembre membre={membre} page="catalogue" /> : null}

      {entete}

      {accueille ? (
        <p className="chapeau">
          {comptes.accueillies} vélo
          {comptes.accueillies > 1 ? 's' : ''} accueilli
          {comptes.accueillies > 1 ? 's' : ''} — merci. Vous avez{' '}
          <strong>{solde.acquis} maillons</strong>.
        </p>
      ) : (
        <>
          <p className="chapeau">
            Des commerçants du quartier remercient celles et ceux qui
            accueillent des vélos chez eux.
          </p>
          {/* Dit une fois, en haut, calmement. Pas offre par offre, et sans
              jamais chiffrer ce qui manque. */}
          <div className="encart">
            <p>
              Ces avantages remercient les personnes qui accueillent des vélos
              chez elles. <strong>Ils ne s’achètent pas</strong>, et faire garder
              son vélo n’en consomme aucun — c’est gratuit, et ça le reste.
            </p>
          </div>
        </>
      )}

      {offres.length === 0 ? (
        <div className="carte">
          <h2>Le catalogue est encore vide</h2>
          <p className="discret">
            Nous parlons aux commerçants des quartiers ouverts. Les premières
            offres arriveront avec eux — nous n’en inventerons pas en attendant.
          </p>
        </div>
      ) : (
        <CatalogueEchangeable offres={affichees} />
      )}

      {accueille ? null : (
        <div className="boutons">
          <Link
            href="/proposer-un-emplacement"
            className="bouton bouton--principal"
          >
            Comment devient-on bike sitter&nbsp;?
          </Link>
        </div>
      )}

      {bons.length > 0 ? (
        <>
          <h2 className="titre-section titre-section--aere">
            Mes échanges
            {enCours.length > 0 ? ` — ${enCours.length} bon${enCours.length > 1 ? 's' : ''} en cours` : ''}
          </h2>
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
        </>
      ) : null}
    </div>
  );
}
