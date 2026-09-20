import { CHIFFRES_DU_CODE_DE_REMISE } from '../regles/remise';

/**
 * Les règles de la communauté, telles qu'on les montre (planche 24) : aux
 * membres dans leur espace, et aux visiteurs sur la page Communauté.
 */

export type RegleAffichee = {
  icone: 'utilisateurs' | 'cadenas' | 'coeur' | 'cle' | 'epingle' | 'messages';
  titre: string;
  texte: string;
  valeurs?: Readonly<Record<string, number>>;
};

export const REGLES_DE_LA_COMMUNAUTE: readonly RegleAffichee[] = [
  {
    icone: 'utilisateurs',
    titre: 'Être présent',
    texte:
      'Le Bike Sitter accueille en personne, au dépôt comme à la reprise du vélo.',
  },
  {
    icone: 'cadenas',
    titre: 'Un espace privé et fermé',
    texte:
      'Les vélos sont gardés dans un espace privé, inaccessible au public et aux autres résidents de l’immeuble.',
  },
  {
    icone: 'coeur',
    titre: 'Entièrement gratuit',
    texte:
      'Le stationnement est gratuit : aucun paiement ni échange d’argent entre membres.',
  },
  {
    icone: 'cle',
    titre: 'Un code pour chaque remise',
    texte:
      'Le vélo change de mains avec un code à {n} chiffres, dit à voix haute face à face.',
    valeurs: { n: CHIFFRES_DU_CODE_DE_REMISE },
  },
  {
    icone: 'epingle',
    titre: 'Une adresse confidentielle',
    texte:
      'L’adresse exacte n’est communiquée qu’après l’acceptation d’une garde, et à la seule personne concernée.',
  },
  {
    icone: 'messages',
    titre: 'Respect et bienveillance',
    texte:
      'Des échanges courtois, des rendez-vous tenus, et un message dès qu’un imprévu arrive.',
  },
];

/** Tous les textes des règles, pour le test de traduction. */
export function textesDesRegles(): string[] {
  return REGLES_DE_LA_COMMUNAUTE.flatMap((regle) => [regle.titre, regle.texte]);
}
