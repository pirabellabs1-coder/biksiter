import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { ListeDesRegles } from '@/components/app/regles';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Règles de la communauté') };
}

export default async function ReglesDeLaCommunaute() {
  await exigerUnMembre();
  const { p } = await textes();

  return (
    <main id="contenu">
      <EnTete p={p} retour="/aide" />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Règles de la communauté')}</h1>
        <p className="sous-titre">{p('Le bon fonctionnement du réseau repose sur quelques règles partagées par tous les membres.')}</p>

        <ListeDesRegles p={p} />

        <Link href="/regles/batteries" className="encart lien-encart">
          <Icone nom="batterie" taille={24} />
          <span>
            <strong>{p('Vélos électriques')}</strong>
            {p('Ce qu’il faut vérifier sur la batterie avant d’accueillir un vélo.')}
          </span>
          <Icone nom="chevron" taille={20} />
        </Link>

        <div className="boutons" style={{ marginTop: 16 }}>
          <Link href="/aide" className="bouton plein">
            {p('J’ai compris')}
          </Link>
        </div>
      </div>
    </main>
  );
}
