import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone, type NomDIcone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';
import { EXPIRATION_D_UNE_DEMANDE_HEURES } from '@/lib/regles/garde';
import { POINTS_PAR_GARDE } from '@/lib/regles/maillons';

import { PagePublique } from '../page-publique';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Comment ça marche') };
}

/**
 * Le parcours, des deux côtés de la porte. Chaque étape correspond à un écran
 * de l'application, dans l'ordre où on le rencontre. Sur ordinateur, les deux
 * parcours se lisent côte à côte.
 */
export default async function CommentCaMarche() {
  const lesTextes = await textes();
  const { p } = lesTextes;

  const parcours: {
    icone: NomDIcone;
    titre: string;
    resume: string;
    etapes: [string, string][];
  }[] = [
    {
      icone: 'velo',
      titre: p('Vous confiez votre vélo'),
      resume: p(
        'Un lieu fermé et une personne de confiance, près de votre destination.',
      ),
      etapes: [
        [
          p('Trouvez un emplacement'),
          p(
            'Cherchez près de votre destination : chaque fiche indique une zone approximative, les horaires et les vélos acceptés.',
          ),
        ],
        [
          p('Envoyez une demande'),
          p(
            'Choisissez votre créneau et votre vélo. Le bike sitter répond dans les {heures} heures ; dès qu’il accepte, vous recevez l’adresse exacte.',
            { heures: EXPIRATION_D_UNE_DEMANDE_HEURES },
          ),
        ],
        [
          p('Déposez votre vélo'),
          p(
            'Devant la porte, photographiez votre vélo, puis montrez votre code de dépôt au bike sitter.',
          ),
        ],
        [
          p('Récupérez-le'),
          p(
            'Reprenez quelques photos, puis saisissez le code de restitution que le bike sitter vous montre.',
          ),
        ],
      ],
    },
    {
      icone: 'maison',
      titre: p('Vous accueillez un vélo'),
      resume: p('Un garage, une cave ou une cour fermée suffit.'),
      etapes: [
        [
          p('Faites vérifier votre identité'),
          p(
            'Une personne de l’association vérifie votre pièce d’identité avant la publication de votre emplacement.',
          ),
        ],
        [
          p('Décrivez votre espace'),
          p(
            'Type d’espace, horaires, capacité et vélos acceptés. Votre adresse n’apparaît jamais sur la fiche.',
          ),
        ],
        [
          p('Répondez aux demandes'),
          p(
            'Vous acceptez celles qui vous conviennent, dans les {heures} heures.',
            { heures: EXPIRATION_D_UNE_DEMANDE_HEURES },
          ),
        ],
        [
          p('Accueillez le vélo'),
          p(
            'Vérifiez les photos du cycliste, saisissez son code, et gagnez au moins {points} points à chaque garde menée à son terme.',
            { points: POINTS_PAR_GARDE },
          ),
        ],
      ],
    },
  ];

  return (
    <PagePublique
      textes={lesTextes}
      surtitre={p('Comment ça marche')}
      titre={p('Un espace fermé. Une personne présente.')}
      introduction={p(
        'Le stationnement est entièrement gratuit. Un seul compte pour les deux : vous confiez votre vélo quand vous en avez besoin, et vous pourrez proposer un emplacement à tout moment depuis votre espace.',
      )}
      enTete={
        <div className="actions-heros">
          <Link href="/bienvenue" className="bouton plein">
            {p('Rejoindre le réseau')}
            <Icone nom="chevron" taille={20} />
          </Link>
          <Link href="/faq" className="bouton contour">
            {p('Questions fréquentes')}
          </Link>
        </div>
      }
    >
      <div className="parcours">
        {parcours.map((chemin) => (
          <section
            key={chemin.titre}
            className="carte-de-parcours"
            aria-label={chemin.titre}
          >
            <div className="carte-de-parcours-tete">
              <span className="carte-de-contenu-icone" aria-hidden="true">
                <Icone nom={chemin.icone} taille={24} />
              </span>
              <div>
                <h2>{chemin.titre}</h2>
                <p>{chemin.resume}</p>
              </div>
            </div>
            <ol className="pas-a-pas">
              {chemin.etapes.map(([titre, texte], rang) => (
                <li key={titre}>
                  <span className="pas-a-pas-numero" aria-hidden="true">
                    {rang + 1}
                  </span>
                  <span className="ligne-texte">
                    <strong>{titre}</strong>
                    <span>{texte}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </PagePublique>
  );
}
