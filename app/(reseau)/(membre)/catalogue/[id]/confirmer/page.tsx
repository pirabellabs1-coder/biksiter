import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { ICONE_DE_LA_CATEGORIE, enPoints } from '@/components/app/progression';
import { offreDuCatalogue } from '@/lib/depot/catalogue';
import { comptesDuMembre, soldeDuMembre } from '@/lib/depot/maillons';
import { textes } from '@/lib/i18n/langue';
import { decisionDEchange } from '@/lib/regles/catalogue';
import { exigerUnMembre } from '@/lib/session';

import { confirmerLEchange } from '../../actions';
import { FormulaireDEchange } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Confirmer l’avantage') };
}

export default async function ConfirmerUnAvantage({
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
  if (!decisionDEchange(offre, solde, comptes.accueillies).possible) {
    redirect(`/catalogue/${offre.id}`);
  }

  const lignes: [string, string, boolean][] = [
    [p('Votre solde'), enPoints(p, solde.acquis), false],
    [p('Coût'), `− ${enPoints(p, offre.coutEnMaillons)}`, false],
    [p('Solde après échange'), enPoints(p, solde.acquis - offre.coutEnMaillons), true],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/catalogue/${offre.id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Confirmer l’avantage')}</h1>
        <p className="sous-titre">{p('Vous êtes sur le point d’échanger vos points contre l’avantage suivant.')}</p>

        <div className="carte ligne ligne-info" style={{ alignItems: 'center' }}>
          <span className="vignette-app" style={{ width: 84, height: 72, color: 'var(--trust-deep)' }} aria-hidden="true">
            <Icone nom={ICONE_DE_LA_CATEGORIE[offre.categorie]} taille={38} strokeWidth={1.5} />
          </span>
          <span className="ligne-texte">
            <strong>{offre.titre}</strong>
            {offre.description ? <span>{offre.description}</span> : null}
            <span className="pastille" style={{ alignSelf: 'flex-start', width: 'fit-content', marginTop: 4 }}>
              {enPoints(p, offre.coutEnMaillons)}
            </span>
          </span>
        </div>

        <h2 className="titre-section">{p('Détail de l’échange')}</h2>
        <dl className="liste" style={{ margin: 0 }}>
          {lignes.map(([terme, valeur, total]) => (
            <div key={terme} className="ligne ligne-info" style={{ justifyContent: 'space-between' }}>
              <dt style={{ fontWeight: total ? 800 : 500 }}>{terme}</dt>
              <dd className="texte-vert" style={{ margin: 0, fontWeight: 800 }}>{valeur}</dd>
            </div>
          ))}
        </dl>

        {offre.retrait ? (
          <div className="carte ligne ligne-info" style={{ marginTop: 12 }}>
            <span className="ligne-icone" aria-hidden="true">
              <Icone nom="epingle" taille={24} />
            </span>
            <span className="ligne-texte">
              <strong>{p('Retrait chez le partenaire')}</strong>
              <span>{offre.retrait}</span>
            </span>
          </div>
        ) : null}

        <FormulaireDEchange
          action={confirmerLEchange.bind(null, offre.id)}
          retour={`/catalogue/${offre.id}`}
          textes={{
            confirmer: p('Confirmer avec {n} points', { n: offre.coutEnMaillons }),
            envoi: p('Échange…'),
            annuler: p('Annuler'),
          }}
        />
        <p className="periode" style={{ justifyContent: 'center', marginTop: 10 }}>
          <Icone nom="cadenas" taille={16} />
          {p('Cet échange sera enregistré dans votre historique.')}
        </p>
      </div>
    </main>
  );
}
