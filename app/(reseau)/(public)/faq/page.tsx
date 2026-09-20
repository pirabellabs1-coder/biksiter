import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { RubriquesDeQuestions } from '@/components/app/questions';
import { RUBRIQUES_DE_LA_FAQ } from '@/lib/contenu/faq';
import {
  LONGUEUR_D_UNE_RECHERCHE,
  rubriquesAffichees,
} from '@/lib/contenu/questions';
import { textes } from '@/lib/i18n/langue';

import { BlocDeCote, PagePublique, Sommaire } from '../page-publique';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Questions fréquentes') };
}

export default async function QuestionsFrequentes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lesTextes = await textes();
  const { p } = lesTextes;
  const { q, rubrique } = await searchParams;
  const recherche = typeof q === 'string' ? q : '';
  const rubriques = rubriquesAffichees(RUBRIQUES_DE_LA_FAQ, p, recherche);

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Aide')}
      titre={p('Questions fréquentes')}
      introduction={p(
        'Les réponses aux questions qu’on se pose avant de rejoindre Bike Sitters.',
      )}
      enTete={
        <form
          action="/faq"
          method="get"
          role="search"
          className="recherche-de-page"
        >
          <label className="champ-app champ-recherche">
            <Icone nom="recherche" taille={20} />
            <span className="lecteur">
              {p('Rechercher dans les questions')}
            </span>
            <input
              type="search"
              name="q"
              defaultValue={recherche}
              maxLength={LONGUEUR_D_UNE_RECHERCHE}
              placeholder={p('Comment pouvons-nous vous aider ?')}
            />
          </label>
        </form>
      }
      coteAGauche
      cote={
        <>
          <BlocDeCote titre={p('Rubriques')}>
            <Sommaire
              entrees={RUBRIQUES_DE_LA_FAQ.map(
                (r) => [p(r.titre), `/faq?rubrique=${r.cle}#${r.cle}`] as const,
              )}
            />
          </BlocDeCote>
          <BlocDeCote titre={p('Vous ne trouvez pas votre réponse ?')}>
            <p>{p('Une personne de l’association vous répond.')}</p>
            <Link href="/contact" className="bouton plein">
              <Icone nom="messages" taille={20} />
              {p('Contacter l’association')}
            </Link>
          </BlocDeCote>
        </>
      }
    >
      {rubriques.length === 0 ? (
        <div className="carte vide-liste" role="status">
          <Icone nom="recherche" taille={30} className="texte-leger" />
          <strong>{p('Aucune réponse ne correspond.')}</strong>
          <span className="texte-doux">
            {p('Essayez d’autres mots, ou écrivez-nous.')}
          </span>
          <Link href="/faq" className="lien-souligne">
            {p('Voir toutes les questions')}
          </Link>
        </div>
      ) : (
        <RubriquesDeQuestions
          p={p}
          rubriques={rubriques}
          ouverte={typeof rubrique === 'string' ? rubrique : undefined}
          recherche={recherche.trim() !== ''}
        />
      )}
    </PagePublique>
  );
}
