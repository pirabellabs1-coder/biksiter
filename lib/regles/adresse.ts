/**
 * Règle 4 — l'adresse exacte n'existe qu'après acceptation.
 *
 * Ni sur la fiche, ni dans la réponse de l'API. C'est la règle qui rend le
 * réseau acceptable pour les bike sitters : tant qu'ils n'ont pas dit oui à
 * quelqu'un, personne ne sait où ils habitent.
 *
 * La fonction `ficheVisible` est le seul chemin autorisé pour envoyer un
 * emplacement vers l'interface. Elle retire l'adresse du type lui-même, pour
 * qu'oublier de la masquer devienne une erreur de compilation et non un bug
 * qu'on découvre en production.
 */

export type Emplacement = {
  reference: string;
  prenomDuBikeSitter: string;
  quartier: string;
  /** Rayon en mètres de la zone affichée à la place du point exact. */
  rayonDeLaZone: number;
  adresseExacte: string;
};

export type FicheVisible = Omit<Emplacement, 'adresseExacte'>;

/** L'état d'un stationnement, réduit à ce dont cette règle a besoin. */
export type EtatDuStationnement = 'demande' | 'accepte' | 'refuse' | 'annule';

export function ficheVisible(emplacement: Emplacement): FicheVisible {
  const { adresseExacte: _adresseExacte, ...visible } = emplacement;
  return visible;
}

/**
 * Renvoie l'adresse au cycliste, ou `null` tant que le bike sitter n'a pas
 * accepté. Un refus ou une annulation la reprennent : une adresse obtenue une
 * fois ne reste pas acquise.
 */
export function adressePourLeCycliste(
  emplacement: Emplacement,
  etat: EtatDuStationnement,
): string | null {
  return etat === 'accepte' ? emplacement.adresseExacte : null;
}

/** Le rayon minimal d'une zone : en dessous, on désignerait une maison. */
export const RAYON_MINIMAL_DE_ZONE_METRES = 250;

export function zoneAssezFloue(rayonEnMetres: number): boolean {
  return rayonEnMetres >= RAYON_MINIMAL_DE_ZONE_METRES;
}
