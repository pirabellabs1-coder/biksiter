import { SEUIL_DESISTEMENT_TARDIF_HEURES } from '../regles/annulation';
import { CHIFFRES_DU_CODE_DE_REMISE } from '../regles/remise';

/**
 * Les conditions d'utilisation, découpées comme dans les maquettes (planche
 * 23) : six sections, chacune avec son résumé.
 *
 * Tant qu'un juriste ne les a pas relues, elles restent une version de travail,
 * et la page le dit. Les clauses d'assurance et de responsabilité en cas de vol
 * annoncent qu'elles seront précisées : elles engagent l'association, et
 * aucune ne s'écrit sans conseil. Le jour de la validation,
 * `MISE_A_JOUR_DES_CONDITIONS` prend sa date et la page affiche « Dernière
 * mise à jour ».
 */

/** La date de la version validée, au format « 2026-09-14 ». `null` : version de travail. */
export const MISE_A_JOUR_DES_CONDITIONS: string | null = null;

export type SectionDeTexte = {
  cle: string;
  icone:
    'document' | 'profil' | 'utilisateurs' | 'bouclier' | 'balance' | 'info';
  titre: string;
  resume: string;
  paragraphes: readonly string[];
  valeurs?: Readonly<Record<string, number>>;
};

export const SECTIONS_DES_CONDITIONS: readonly SectionDeTexte[] = [
  {
    cle: 'objet',
    icone: 'document',
    titre: 'Objet du service',
    resume: 'Mise en relation pour la garde de vélos',
    paragraphes: [
      'Bike Sitters est un réseau d’entraide entre cyclistes, porté par une association sans but lucratif à Bruxelles. Il met en relation des cyclistes et des membres qui accueillent un vélo dans un espace privé, pour quelques heures ou quelques jours.',
      'Le stationnement est entièrement gratuit. Aucun paiement ne passe par Bike Sitters ni entre membres.',
      'L’association fournit l’application, les règles du réseau et la modération ; ce sont les membres qui accueillent les vélos.',
    ],
  },
  {
    cle: 'comptes',
    icone: 'profil',
    titre: 'Comptes et responsabilités',
    resume: 'Création de compte et usage sécurisé',
    paragraphes: [
      'Chaque personne dispose d’un seul compte. On y est cycliste quand on confie son vélo, et bike sitter quand on en accueille un.',
      'L’adresse e-mail et le numéro de téléphone sont confirmés à l’inscription. Une personne de l’association vérifie la pièce d’identité avant la première demande de garde ou la publication d’un emplacement.',
      'Vous gardez votre mot de passe pour vous, et les informations de votre profil restent exactes.',
    ],
  },
  {
    cle: 'utilisation',
    icone: 'utilisateurs',
    titre: 'Utilisation du service',
    resume: 'Règles entre cyclistes et bike sitters',
    valeurs: { chiffres: CHIFFRES_DU_CODE_DE_REMISE },
    paragraphes: [
      'Un emplacement se publie seulement s’il est privé : inaccessible au public comme aux autres résidents de l’immeuble.',
      'L’adresse exacte d’un emplacement est communiquée après l’acceptation d’une demande. Avant, une zone approximative est affichée.',
      'Avant chaque remise, le cycliste photographie son vélo. Celui qui remet le vélo montre ensuite un code à {chiffres} chiffres, que l’autre saisit.',
      'Le téléphone et l’adresse d’un membre servent uniquement à la garde pour laquelle ils ont été communiqués.',
    ],
  },
  {
    cle: 'assurance',
    icone: 'bouclier',
    titre: 'Assurance et limitations',
    resume: 'Couverture et cas d’exclusion',
    paragraphes: [
      'Les conditions d’assurance applicables aux gardes seront précisées dans cette section avant l’ouverture du service.',
      'Chaque garde est horodatée, et les photos prises au dépôt et au retour gardent la trace de l’état du vélo.',
      'Pour un vélo électrique, le bike sitter peut refuser le vélo au moment du dépôt si la batterie paraît gonflée, chaude ou abîmée.',
    ],
  },
  {
    cle: 'responsabilites',
    icone: 'balance',
    titre: 'Responsabilités',
    resume: 'Engagements des membres',
    valeurs: { heures: SEUIL_DESISTEMENT_TARDIF_HEURES },
    paragraphes: [
      'Le cycliste confie un vélo avec son antivol, et vient le récupérer à l’heure convenue ou prévient en cas de retard.',
      'Le bike sitter est présent aux heures annoncées et range le vélo dans l’espace décrit sur sa fiche.',
      'Une annulation moins de {heures} heures avant le dépôt compte comme un désistement tardif.',
      'La modération peut suspendre un compte qui ne respecte pas ces règles. Chacune de ses décisions est enregistrée.',
      'La répartition des responsabilités en cas de vol ou de dégât sera précisée avec un juriste avant l’ouverture du service.',
    ],
  },
  {
    cle: 'modifications',
    icone: 'info',
    titre: 'Modifications',
    resume: 'Évolution des conditions',
    paragraphes: [
      'Ces conditions évoluent avec le service. Chaque version validée indique sa date de mise à jour en haut de cette page.',
      'Pour toute question sur ces conditions, écrivez-nous depuis la page Contact.',
    ],
  },
];

/** Tous les textes des sections, pour le test de traduction. */
export function textesDesSections(
  sections: readonly SectionDeTexte[],
): string[] {
  return sections.flatMap((section) => [
    section.titre,
    section.resume,
    ...section.paragraphes,
  ]);
}
