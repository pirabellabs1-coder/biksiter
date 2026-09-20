import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { RubriquesDeQuestions } from '@/components/app/questions';
import { RUBRIQUES_D_AIDE } from '@/lib/contenu/aide';
import { LONGUEUR_D_UNE_RECHERCHE, rubriquesAffichees } from '@/lib/contenu/questions';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Centre d’aide') };
}

export default async function CentreDAide({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await exigerUnMembre();
  const { p } = await textes();
  const { q, rubrique: ouverte } = await searchParams;
  const recherche = typeof q === 'string' ? q : '';
  const rubriques = rubriquesAffichees(RUBRIQUES_D_AIDE, p, recherche);

  return (
    <main id="contenu">
      <EnTete p={p} retour="/profil" />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Centre d’aide')}</h1>
        <p className="sous-titre">
          {p('Vous trouverez ici les réponses aux principales questions sur le fonctionnement de Bike Sitters.')}
        </p>

        <form action="/aide" method="get" role="search">
          <label className="champ-app champ-recherche">
            <Icone nom="recherche" taille={20} />
            <span className="lecteur">{p('Rechercher dans l’aide')}</span>
            <input
              type="search"
              name="q"
              defaultValue={typeof q === 'string' ? q : ''}
              maxLength={LONGUEUR_D_UNE_RECHERCHE}
              placeholder={p('Comment pouvons-nous vous aider ?')}
            />
          </label>
        </form>

        {rubriques.length === 0 ? (
          <div className="carte vide-liste" style={{ marginTop: 14 }}>
            <Icone nom="recherche" taille={30} className="texte-leger" />
            <strong>{p('Aucune réponse ne correspond.')}</strong>
            <span className="texte-doux">{p('Essayez d’autres mots, ou écrivez-nous.')}</span>
            <Link href="/aide" className="lien-souligne">
              {p('Voir toutes les questions')}
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <RubriquesDeQuestions
              p={p}
              rubriques={rubriques}
              ouverte={ouverte}
              recherche={recherche.trim() !== ''}
            />
          </div>
        )}

        <div className="boutons" style={{ marginTop: 16 }}>
          <Link href="/contact" className="bouton plein">
            <Icone nom="messages" taille={20} />
            {p('Contacter l’association')}
          </Link>
          <Link href="/faq" className="bouton contour">
            <Icone nom="document" taille={20} />
            {p('Questions fréquentes')}
          </Link>
        </div>
      </div>
    </main>
  );
}
