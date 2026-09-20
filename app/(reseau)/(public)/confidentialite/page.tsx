import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone, type NomDIcone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';

import { BlocDeCote, ListeDeLiens, PagePublique } from '../page-publique';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Politique de confidentialité') };
}

export default async function Confidentialite() {
  const lesTextes = await textes();
  const { p } = lesTextes;

  // Chaque engagement a son exécutant dans le code : la règle 4, le script de
  // purge, l'export et la suppression du compte.
  const articles: [NomDIcone, string, string][] = [
    [
      'globe',
      p('Où sont vos données'),
      p(
        'Hébergement dans l’Union européenne. Aucune donnée n’est transférée hors UE.',
      ),
    ],
    [
      'epingle',
      p('Votre adresse'),
      p(
        'L’adresse exacte de votre emplacement n’est lisible que par vous, par un cycliste dont vous avez accepté la demande, et par un administrateur.',
      ),
    ],
    [
      'verifie',
      p('Votre pièce d’identité'),
      p(
        'Vérifiée puis supprimée, au plus tard après sept jours. Ni l’image ni le numéro ne sont conservés.',
      ),
    ],
    [
      'photo',
      p('Les photos du vélo'),
      p(
        'Les photos prises au dépôt et au retour sont visibles par les deux membres de la garde, et par l’équipe en cas de signalement. Elles sont supprimées quatorze jours après la fin de la garde.',
      ),
    ],
    [
      'document',
      p('Vos droits'),
      p(
        'Export complet et suppression de compte disponibles à tout moment depuis les paramètres.',
      ),
    ],
  ];

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Vos droits')}
      titre={p('Politique de confidentialité')}
      introduction={p(
        'Vos données servent à faire fonctionner le réseau. Voici où elles sont, qui les voit et combien de temps elles sont gardées.',
      )}
      cote={
        <>
          <BlocDeCote titre={p('Une question sur vos données ?')}>
            <p>{p('Une personne de l’association vous répond.')}</p>
            <Link href="/contact" className="bouton contour">
              <Icone nom="messages" taille={20} />
              {p('Écrivez-nous')}
            </Link>
          </BlocDeCote>
          <BlocDeCote titre={p('Pour aller plus loin')}>
            <ListeDeLiens
              liens={[
                [
                  'document',
                  p('Conditions d’utilisation'),
                  '/conditions-generales',
                ],
                ['bouclier', p('Sécurité'), '/securite'],
              ]}
            />
          </BlocDeCote>
        </>
      }
    >
      <ul className="grille-de-cartes">
        {articles.map(([icone, titre, texte]) => (
          <li key={titre} className="carte-de-contenu">
            <span className="carte-de-contenu-icone" aria-hidden="true">
              <Icone nom={icone} taille={22} />
            </span>
            <h2>{titre}</h2>
            <p>{texte}</p>
          </li>
        ))}
      </ul>
    </PagePublique>
  );
}
