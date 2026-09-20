import { SEUIL_DESISTEMENT_TARDIF_HEURES } from '../regles/annulation';
import { HORIZON_JOURS } from '../regles/creneau';
import {
  EMPLACEMENTS_PAR_MEMBRE,
  TYPES_EMPLACEMENT_PRIVE,
} from '../regles/emplacements';
import { EXPIRATION_D_UNE_DEMANDE_HEURES } from '../regles/garde';
import { POINTS_PAR_GARDE } from '../regles/maillons';
import {
  INSCRIPTION_SUR_INVITATION,
  MODULE_VOLS_ACTIF,
} from '../regles/modules';
import { CONSERVATION_MAXIMALE_JOURS } from '../regles/pieces';
import { CHIFFRES_DU_CODE_DE_REMISE } from '../regles/remise';
import { PROLONGATION_MAXIMALE_JOURS } from '../regles/amenagements';

import {
  textesDesRubriques,
  type QuestionDAide,
  type RubriqueDAide,
} from './questions';

/**
 * Les questions fréquentes du site public, pour qui découvre le réseau.
 *
 * Le centre d'aide des membres explique l'usage de l'application ; ici, on
 * répond à ce qu'on se demande avant de rejoindre. Les chiffres viennent des
 * règles, et les liens ne mènent qu'à des pages ouvertes sans compte.
 */

const REJOINDRE: QuestionDAide = INSCRIPTION_SUR_INVITATION
  ? {
      question: 'Comment rejoindre le réseau ?',
      reponse:
        'Pendant le lancement, on rejoint Bike Sitters sur invitation d’un membre. Sans invitation, laissez votre adresse : nous vous écrivons dès qu’une place s’ouvre dans votre quartier.',
      lien: { href: '/liste-attente', libelle: 'Rejoindre la liste d’attente' },
    }
  : {
      question: 'Comment rejoindre le réseau ?',
      reponse:
        'Créez votre compte, confirmez votre adresse e-mail et votre téléphone, puis faites vérifier votre identité.',
      lien: { href: '/inscription', libelle: 'Créer un compte' },
    };

const VELO_VOLE: readonly QuestionDAide[] = MODULE_VOLS_ACTIF
  ? [
      {
        question: 'Comment retrouver un vélo volé ?',
        reponse:
          'Déclarez-le depuis votre espace : sa fiche devient publique, et chacun peut signaler l’avoir aperçu.',
      },
    ]
  : [];

export const RUBRIQUES_DE_LA_FAQ: readonly RubriqueDAide[] = [
  {
    cle: 'reseau',
    titre: 'Le réseau',
    description: 'Ce qu’est Bike Sitters, et comment le rejoindre',
    icone: 'maison',
    questions: [
      {
        question: 'Qu’est-ce que Bike Sitters ?',
        reponse:
          'Un réseau d’entraide entre cyclistes à Bruxelles : des habitants accueillent chez eux le vélo d’un autre membre, pour quelques heures ou quelques jours.',
        lien: { href: '/comment-ca-marche', libelle: 'Comment ça marche' },
      },
      {
        question: 'C’est vraiment gratuit ?',
        reponse:
          'Oui. Le stationnement est entièrement gratuit, et aucun paiement ne passe entre membres. Le réseau est porté par une association sans but lucratif.',
      },
      REJOINDRE,
      {
        question: 'Faut-il deux comptes pour déposer et pour accueillir ?',
        reponse:
          'Un seul compte suffit. Vous confiez votre vélo quand vous en avez besoin, et vous pourrez proposer un emplacement à tout moment depuis votre espace.',
      },
    ],
  },
  {
    cle: 'confier',
    titre: 'Confier son vélo',
    description: 'La demande, la remise et la récupération',
    icone: 'velo',
    questions: [
      {
        question: 'Comment demander une garde ?',
        reponse:
          'Cherchez un emplacement près de votre destination, choisissez votre créneau et votre vélo, puis envoyez la demande, jusqu’à {jours} jours à l’avance. Le bike sitter a {heures} heures pour vous répondre.',
        valeurs: {
          jours: HORIZON_JOURS,
          heures: EXPIRATION_D_UNE_DEMANDE_HEURES,
        },
      },
      {
        question: 'Quand vois-je l’adresse exacte ?',
        reponse:
          'Dès que votre demande est acceptée. Avant, la fiche de l’emplacement indique une zone approximative.',
      },
      {
        question: 'Combien de temps puis-je laisser mon vélo ?',
        reponse:
          'Chaque bike sitter indique sur sa fiche la durée qu’il accepte, de quelques heures à plusieurs jours. Une garde peut ensuite être prolongée de {jours} jours au plus, si le bike sitter est d’accord.',
        valeurs: { jours: PROLONGATION_MAXIMALE_JOURS },
      },
      {
        question: 'Quels vélos sont acceptés ?',
        reponse:
          'Chaque bike sitter indique les types de vélo qu’il peut accueillir, du vélo de ville au cargo. Pour un vélo électrique, un coup d’œil à la batterie a lieu au moment du dépôt.',
      },
      {
        question: 'Comment se passe la remise ?',
        reponse:
          'Devant la porte, vous photographiez votre vélo sous plusieurs angles. Celui qui remet le vélo montre ensuite un code à {chiffres} chiffres, et l’autre le saisit. Le même geste se répète à la récupération.',
        valeurs: { chiffres: CHIFFRES_DU_CODE_DE_REMISE },
      },
      {
        question: 'Et si j’ai un empêchement ?',
        reponse:
          'Annulez depuis la garde, le plus tôt possible. Moins de {heures} heures avant le dépôt, l’annulation compte comme un désistement tardif.',
        valeurs: { heures: SEUIL_DESISTEMENT_TARDIF_HEURES },
      },
    ],
  },
  {
    cle: 'accueillir',
    titre: 'Accueillir un vélo',
    description: 'Proposer un emplacement chez soi',
    icone: 'cle',
    questions: [
      {
        question: 'Quels espaces peut-on proposer ?',
        reponse:
          'Un espace privé, inaccessible au public comme aux autres résidents de l’immeuble : un garage, une cave, une pièce du logement, une cour ou un jardin clôturés. Vous choisissez parmi {types} types d’emplacement.',
        valeurs: { types: TYPES_EMPLACEMENT_PRIVE.length },
      },
      {
        question: 'Combien d’emplacements puis-je proposer ?',
        reponse:
          'Jusqu’à {n} emplacements, chacun avec ses horaires, sa capacité et les vélos qu’il accueille.',
        valeurs: { n: EMPLACEMENTS_PAR_MEMBRE },
      },
      {
        question: 'Qu’est-ce que cela m’apporte ?',
        reponse:
          'Des points : chaque garde menée à son terme en rapporte au moins {points}, à échanger contre des avantages du catalogue. Vous apparaissez dans le classement seulement si vous le choisissez.',
        valeurs: { points: POINTS_PAR_GARDE },
      },
    ],
  },
  {
    cle: 'confiance',
    titre: 'Confiance et sécurité',
    description: 'Vérification, problèmes et urgences',
    icone: 'bouclier',
    questions: [
      {
        question: 'Faut-il vérifier son identité ?',
        reponse:
          'Oui, pour demander une garde comme pour publier un emplacement. Une personne de l’association vérifie votre pièce d’identité, qui est ensuite supprimée, au plus tard après {jours} jours.',
        valeurs: { jours: CONSERVATION_MAXIMALE_JOURS },
        lien: {
          href: '/confidentialite',
          libelle: 'Politique de confidentialité',
        },
      },
      {
        question: 'Et si un problème survient pendant une garde ?',
        reponse:
          'Signalez-le depuis la garde : elle est mise en pause, et une personne de la modération reprend le dossier avec son historique complet, photos comprises.',
      },
      {
        question: 'Qui est responsable en cas de vol ou de dégât ?',
        reponse:
          'Chaque garde est horodatée, et les photos du dépôt et du retour gardent la trace de l’état du vélo. Les règles de responsabilité et d’assurance seront précisées dans les conditions d’utilisation avant l’ouverture du service.',
        lien: {
          href: '/conditions-generales',
          libelle: 'Conditions d’utilisation',
        },
      },
      {
        question: 'En cas d’urgence ?',
        reponse:
          'En cas de danger, appelez le 112. Pour un vol, contactez la police au 101, puis signalez-le depuis la garde.',
      },
      ...VELO_VOLE,
    ],
  },
];

/** Tous les textes de la FAQ, pour le test de traduction. */
export function textesDeLaFaq(): string[] {
  return textesDesRubriques(RUBRIQUES_DE_LA_FAQ);
}
