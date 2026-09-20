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
      titre: p('Vous confiez votre vélo à un bike sitter'),
      resume: p(
        'Vous cherchez un emplacement près de votre destination, envoyez une demande et déposez votre vélo pour la durée souhaitée.',
      ),
      etapes: [
        [
          p('Rechercher un emplacement'),
          p(
            'Vous indiquez votre destination et la date souhaitée. Chaque fiche présente la zone approximative de l’emplacement, les horaires du bike sitter et les types de vélos acceptés.',
          ),
        ],
        [
          p('Envoyer une demande'),
          p(
            'Vous choisissez votre créneau et le vélo à confier, puis envoyez la demande. Le bike sitter dispose de {heures} heures pour répondre. Une fois la demande acceptée, vous recevez l’adresse exacte.',
            { heures: EXPIRATION_D_UNE_DEMANDE_HEURES },
          ),
        ],
        [
          p('Déposer votre vélo'),
          p(
            'À la porte, vous prenez quelques photos de votre vélo pour établir un constat, puis vous communiquez votre code de dépôt au bike sitter.',
          ),
        ],
        [
          p('Récupérer votre vélo'),
          p(
            'Au retour, vous prenez à nouveau quelques photos, puis vous saisissez le code de restitution communiqué par le bike sitter pour clôturer la garde.',
          ),
        ],
      ],
    },
    {
      icone: 'maison',
      titre: p('Vous accueillez un vélo chez vous'),
      resume: p('Vous proposez un espace privé, définissez vos disponibilités et acceptez les demandes qui vous conviennent.'),
      etapes: [
        [
          p('Faire vérifier votre identité'),
          p(
            'Une personne de l’association vérifie votre pièce d’identité avant que votre emplacement puisse être publié. Cette étape prend en général quarante-huit heures.',
          ),
        ],
        [
          p('Décrire votre espace'),
          p(
            'Vous précisez le type d’espace, les horaires d’accueil, la capacité et les types de vélos acceptés. Votre adresse exacte n’apparaît pas sur la fiche publique.',
          ),
        ],
        [
          p('Répondre aux demandes'),
          p(
            'Vous acceptez uniquement les demandes qui vous conviennent et disposez de {heures} heures pour répondre à chacune.',
            { heures: EXPIRATION_D_UNE_DEMANDE_HEURES },
          ),
        ],
        [
          p('Accueillir le vélo'),
          p(
            'Vous vérifiez les photos du cycliste, saisissez son code, puis suivez la garde depuis votre espace. Chaque garde menée à son terme vous rapporte au moins {points} points.',
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
      titre={p('Une garde en quelques étapes, des deux côtés de la porte.')}
      introduction={p(
        'Le fonctionnement du réseau est entièrement gratuit. Un même compte vous permet de confier votre vélo à un autre membre ou de proposer votre propre emplacement, à votre rythme.',
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
