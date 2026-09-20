import { EXPIRATION_D_UNE_DEMANDE_HEURES } from '../regles/garde';
import { POINTS_PAR_GARDE } from '../regles/maillons';
import { SEUIL_DESISTEMENT_TARDIF_HEURES } from '../regles/annulation';
import {
  CHIFFRES_DU_CODE_DE_REMISE,
  ESSAIS_PAR_CODE,
  VALIDITE_CODE_HEURES,
} from '../regles/remise';

import { textesDesRubriques, type RubriqueDAide } from './questions';

/**
 * Le centre d'aide de l'application.
 *
 * Chaque réponse s'appuie sur une règle du produit ; les chiffres viennent des
 * constantes, pour qu'une règle qui change ne laisse pas une réponse fausse
 * derrière elle. Les valeurs se glissent dans la phrase à l'affichage.
 */

export const RUBRIQUES_D_AIDE: readonly RubriqueDAide[] = [
  {
    cle: 'demandes',
    titre: 'Demandes et gardes',
    description: 'Demander, accepter, suivre une garde',
    icone: 'calendrier',
    questions: [
      {
        question: 'Comment demander une garde ?',
        reponse:
          'Cherchez un lieu près de chez vous, choisissez votre créneau et votre vélo, puis envoyez la demande. Le Bike Sitter a {heures} heures pour vous répondre.',
        valeurs: { heures: EXPIRATION_D_UNE_DEMANDE_HEURES },
        lien: { href: '/recherche', libelle: 'Trouver un Bike Sitter' },
      },
      {
        question: 'Combien coûte une garde ?',
        reponse:
          'Rien. Le stationnement est entièrement gratuit, et aucun paiement ne passe entre membres.',
      },
      {
        question: 'Quand est-ce que je vois l’adresse exacte ?',
        reponse:
          'Dès que le Bike Sitter accepte votre demande. Avant, la fiche du lieu montre une zone approximative.',
      },
    ],
  },
  {
    cle: 'remise',
    titre: 'Dépôt et récupération',
    description: 'Le code, le constat, les bonnes pratiques',
    icone: 'velo',
    questions: [
      {
        question: 'Comment se passe la remise du vélo ?',
        reponse:
          'Celui qui remet le vélo affiche un code à {chiffres} chiffres et le dicte à voix haute ; celui qui le reçoit le saisit. Avant chaque remise, le cycliste photographie son vélo : ces photos accompagnent le dépôt et le retour.',
        valeurs: { chiffres: CHIFFRES_DU_CODE_DE_REMISE },
      },
      {
        question: 'Et pour un vélo électrique ?',
        reponse:
          'Un coup d’œil à la batterie au moment du dépôt : si elle est gonflée, chaude ou abîmée, le vélo n’est pas accueilli.',
        lien: { href: '/regles/batteries', libelle: 'Vélos électriques' },
      },
      {
        question: 'Et si le code ne passe pas ?',
        reponse:
          'Chaque code permet {essais} essais et reste valable {heures} heures. Au-delà, un nouveau code est proposé : vérifiez simplement les chiffres ensemble.',
        valeurs: { essais: ESSAIS_PAR_CODE, heures: VALIDITE_CODE_HEURES },
      },
    ],
  },
  {
    cle: 'retards',
    titre: 'Retards et annulations',
    description: 'Que faire en cas de changement ?',
    icone: 'horloge',
    questions: [
      {
        question: 'Je vais être en retard',
        reponse:
          'Depuis la garde, « Je serai en retard » prévient l’autre personne en un geste, dans les trois heures qui précèdent le dépôt ou la reprise. Pour tout autre changement, écrivez un message.',
        lien: { href: '/gardes', libelle: 'Mes gardes' },
      },
      {
        question: 'Comment annuler une garde ?',
        reponse:
          'Depuis la garde, à tout moment. Moins de {heures} heures avant le dépôt, l’annulation compte comme un désistement tardif : pensez à prévenir le plus tôt possible.',
        valeurs: { heures: SEUIL_DESISTEMENT_TARDIF_HEURES },
      },
    ],
  },
  {
    cle: 'identite',
    titre: 'Identité et vérification',
    description: 'Vérification des profils et confiance',
    icone: 'verifie',
    questions: [
      {
        question: 'Pourquoi vérifier mon identité ?',
        reponse:
          'Pour proposer un lieu, une personne de l’association vérifie votre pièce d’identité. C’est ce qui permet à chacun d’ouvrir sa porte en confiance.',
        lien: { href: '/profil/verifications', libelle: 'Mes vérifications' },
      },
      {
        question: 'Qui voit mes informations ?',
        reponse:
          'Les autres membres voient votre prénom et l’initiale de votre nom. Votre téléphone n’est communiqué que pendant une garde acceptée, à l’autre personne seulement.',
        lien: {
          href: '/profil/confidentialite',
          libelle: 'Confidentialité et sécurité',
        },
      },
    ],
  },
  {
    cle: 'points',
    titre: 'Points et avantages',
    description: 'Badges, classement et catalogue',
    icone: 'etoile',
    questions: [
      {
        question: 'Comment gagner des points ?',
        reponse:
          'En accueillant des vélos : chaque garde menée à terme rapporte au moins {points} points, à échanger contre des avantages du catalogue.',
        valeurs: { points: POINTS_PAR_GARDE },
        lien: { href: '/progression/regles', libelle: 'Les règles des points' },
      },
      {
        question: 'Dois-je apparaître dans le classement ?',
        reponse:
          'Seulement si vous le souhaitez. Le classement ne montre jamais votre adresse ni votre quartier.',
      },
    ],
  },
  {
    cle: 'securite',
    titre: 'Sécurité et litiges',
    description: 'Signaler un problème, médiation',
    icone: 'bouclier',
    questions: [
      {
        question: 'Quelles sont les règles du réseau ?',
        reponse:
          'Un Bike Sitter présent, un espace privé et fermé, une garde gratuite et un code pour chaque remise.',
        lien: { href: '/regles', libelle: 'Règles de la communauté' },
      },
      {
        question: 'Un problème pendant une garde ?',
        reponse:
          'Signalez-le depuis la garde. Elle est mise en pause et une personne de la modération reprend le dossier avec son historique complet.',
      },
      {
        question: 'En cas d’urgence ou de vol',
        reponse:
          'En cas de danger, appelez le 112. Pour un vol, contactez la police au 101, puis signalez-le depuis la garde.',
        lien: { href: '/urgence', libelle: 'Urgence et vol' },
      },
    ],
  },
];

/** Tous les textes du centre d'aide, pour le test de traduction. */
export function textesDuCentreDAide(): string[] {
  return textesDesRubriques(RUBRIQUES_D_AIDE);
}
