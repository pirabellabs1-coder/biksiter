import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { bonDuMembre } from '@/lib/depot/catalogue';
import { textes } from '@/lib/i18n/langue';
import { enJour } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Votre bon') };
}

export default async function UnBon({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const [{ id }, { nouveau }] = await Promise.all([params, searchParams]);
  const bon = await bonDuMembre(membre.id, id);
  if (!bon) notFound();

  return (
    <main id="contenu">
      <EnTete p={p} retour="/catalogue/bons" cloche={false} />
      <div className="ecran-app centre-vertical">
        {nouveau ? (
          <>
            <span className="rond-etat grand" aria-hidden="true">
              <Icone nom="coche" taille={46} strokeWidth={2.6} />
            </span>
            <h1 className="titre-ecran centre">{p('Avantage échangé !')}</h1>
          </>
        ) : (
          <h1 className="titre-ecran centre">{bon.titre}</h1>
        )}
        <p className="sous-titre centre">
          {p('Présentez ce code chez {partenaire}.', { partenaire: bon.partenaire })}
        </p>

        <div className="carte centre" style={{ width: '100%' }}>
          {nouveau ? <strong style={{ display: 'block', marginBottom: 6 }}>{bon.titre}</strong> : null}
          <p className="code-affiche bon-code" aria-label={p('Code du bon : {code}', { code: bon.code.split('').join(' ') })}>
            {bon.code.slice(0, 4)} {bon.code.slice(4)}
          </p>
          <span className={bon.utiliseLe ? 'pastille gris' : 'pastille'}>
            {bon.utiliseLe
              ? p('Utilisé le {date}', { date: enJour(new Date(bon.utiliseLe)) })
              : p('Échangé le {date}', { date: enJour(new Date(bon.echangeLe)) })}
          </span>
        </div>

        <div className="boutons" style={{ marginTop: 16, width: '100%' }}>
          <Link href="/catalogue/bons" className="bouton plein">
            {p('Mes bons')}
          </Link>
          <Link href="/catalogue" className="bouton discret">
            {p('Retour au catalogue')}
          </Link>
        </div>
      </div>
    </main>
  );
}
