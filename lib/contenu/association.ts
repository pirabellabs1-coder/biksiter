/**
 * Les mentions de l’association.
 *
 * Ce qui n’existe pas encore vaut `null`, et le site n’en parle pas. C’est
 * volontaire et c’est le seul choix tenable : afficher un numéro d’entreprise
 * de zéros ou un IBAN inventé ferait perdre à une association exactement ce
 * qu’elle essaie de construire — et un IBAN faux ferait partir un don chez
 * quelqu’un d’autre.
 *
 * Le jour où l’ASBL est constituée, il suffit de remplacer les `null` par les
 * vraies valeurs : les pages qui en dépendent les affichent à nouveau d’un
 * coup, et les dons se rouvrent (`lesDonsSontOuverts`). Rien d’autre à
 * modifier, et surtout rien à retrouver dans quinze fichiers.
 */

export type Association = {
  nom: string;
  forme: string;
  ville: string;
  /** Adresse de contact publique. `null` tant qu’il n’y en a pas de vraie. */
  contact: string | null;
  /** Numéro d’entreprise belge. `null` tant que l’ASBL n’est pas enregistrée. */
  numeroDEntreprise: string | null;
  /** Compte de l’association. `null` ferme les dons, côté page et côté serveur. */
  iban: string | null;
};

export const ASSOCIATION: Association = {
  nom: 'Bike Sitters',
  forme: 'association sans but lucratif',
  ville: 'Bruxelles',
  contact: null,
  numeroDEntreprise: null,
  iban: null,
};
