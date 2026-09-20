import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { mesBons } from '@/lib/depot/catalogue';
import { textes } from '@/lib/i18n/langue';
import { enJour } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes bons') };
}

export default async function MesBons() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const bons = await mesBons(membre.id);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/catalogue" />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Mes bons')}</h1>
        <p className="sous-titre">{p('Les avantages que vous avez échangés, à présenter chez le partenaire.')}</p>

        {bons.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="cadeau" taille={30} className="texte-leger" />
            <strong>{p('Aucun bon pour l’instant.')}</strong>
            <Link href="/catalogue" className="lien-souligne">
              {p('Voir le catalogue')}
            </Link>
          </div>
        ) : (
          <ul className="liste" style={{ listStyle: 'none', padding: 0 }}>
            {bons.map((bon) => (
              <li key={bon.id}>
                <Link href={`/catalogue/bons/${bon.id}`} className="ligne">
                  <span className="ligne-icone" aria-hidden="true">
                    <Icone nom="cadeau" taille={24} />
                  </span>
                  <span className="ligne-texte">
                    <strong>{bon.titre}</strong>
                    <span>
                      {bon.partenaire} · {enJour(new Date(bon.echangeLe))}
                    </span>
                  </span>
                  {bon.utiliseLe ? (
                    <span className="pastille gris">{p('Utilisé')}</span>
                  ) : (
                    <span className="pastille">{p('À utiliser')}</span>
                  )}
                  <Icone nom="chevron" taille={20} className="texte-leger" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
