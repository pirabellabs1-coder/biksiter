import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { REGLES_DE_LA_COMMUNAUTE } from '@/lib/contenu/regles';
import { chiffresDeLaCommunaute } from '@/lib/depot/reseau-public';
import { textes } from '@/lib/i18n/langue';

import { BlocDeCote, PagePublique } from '../page-publique';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Communauté') };
}

/**
 * La communauté, comptée dans la base, et les règles qui la tiennent.
 *
 * Pas de témoignage tant qu'aucun membre n'en a écrit un : une citation
 * inventée prêtée à un voisin ferait perdre la confiance que la page cherche
 * justement à donner.
 */
export default async function Communaute() {
  const lesTextes = await textes();
  const { p } = lesTextes;
  const { emplacements, stationnementsTermines } =
    await chiffresDeLaCommunaute();
  const reseauOuvert = emplacements > 0;

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Communauté')}
      titre={p('Une communauté de cyclistes bruxellois.')}
      introduction={
        reseauOuvert
          ? p(
              'Chaque emplacement du réseau est proposé par un habitant de Bruxelles, dans un espace privé de son domicile. Le réseau s’étend progressivement, quartier par quartier.',
            )
          : p(
              'Le réseau ouvre progressivement ses premiers emplacements à Bruxelles. Chaque emplacement est proposé par un habitant, dans un espace privé de son domicile.',
            )
      }
      enTete={
        reseauOuvert ? (
          <dl className="chiffres-de-page">
            <div>
              <dt>{p(emplacements > 1 ? 'emplacements' : 'emplacement')}</dt>
              <dd>{emplacements}</dd>
            </div>
            <div>
              <dt>
                {p(
                  stationnementsTermines > 1
                    ? 'gardes terminées'
                    : 'garde terminée',
                )}
              </dt>
              <dd>{stationnementsTermines}</dd>
            </div>
          </dl>
        ) : null
      }
      cote={
        <BlocDeCote
          titre={p('Vous disposez d’un espace privé ?')}
        >
          <p>
            {p(
              'Après vérification de votre identité par l’association, vous pouvez proposer votre emplacement depuis votre espace membre. Vous restez libre d’accepter les demandes qui vous conviennent.',
            )}
          </p>
          <Link href="/bienvenue" className="bouton plein">
            {p('Rejoindre le réseau')}
            <Icone nom="chevron" taille={20} />
          </Link>
        </BlocDeCote>
      }
    >
      <h2 className="titre-de-bloc">{p('Règles de la communauté')}</h2>
      <ul className="grille-de-cartes">
        {REGLES_DE_LA_COMMUNAUTE.map((regle) => (
          <li key={regle.titre} className="carte-de-contenu">
            <span className="carte-de-contenu-icone" aria-hidden="true">
              <Icone nom={regle.icone} taille={22} />
            </span>
            <h3>{p(regle.titre)}</h3>
            <p>{p(regle.texte, regle.valeurs)}</p>
          </li>
        ))}
      </ul>
    </PagePublique>
  );
}
