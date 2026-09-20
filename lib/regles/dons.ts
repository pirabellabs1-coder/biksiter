/**
 * Les dons.
 *
 * Pas de paiement par carte : la commission d'un prestataire prend entre deux
 * et trois pour cent de chaque don, et un virement n'en prend rien. Pour une
 * association qui vit de petits montants, c'est la différence entre financer
 * onze mois et en financer douze.
 *
 * Le virement se rapproche du donateur par une communication structurée, le
 * format belge que toutes les banques savent lire et recopier sans erreur.
 */

/**
 * Douze chiffres : dix libres, puis deux de contrôle qui valent le reste de la
 * division des dix premiers par 97 — et 97 quand ce reste est nul, parce que
 * « 00 » ne serait pas distinguable d'un champ vide.
 */
export function communicationStructuree(numero: number): string {
  if (!Number.isInteger(numero) || numero < 0 || numero > 9_999_999_999) {
    throw new Error('Le numéro doit tenir sur dix chiffres.');
  }

  const base = String(numero).padStart(10, '0');
  const reste = Number(base) % 97;
  const controle = String(reste === 0 ? 97 : reste).padStart(2, '0');
  const douze = `${base}${controle}`;

  return `+++${douze.slice(0, 3)}/${douze.slice(3, 7)}/${douze.slice(7)}+++`;
}

export function communicationValide(communication: string): boolean {
  const chiffres = communication.replace(/[^0-9]/g, '');

  if (!/^\+\+\+[0-9]{3}\/[0-9]{4}\/[0-9]{5}\+\+\+$/.test(communication)) {
    return false;
  }

  const base = chiffres.slice(0, 10);
  const controle = chiffres.slice(10);
  const reste = Number(base) % 97;

  return controle === String(reste === 0 ? 97 : reste).padStart(2, '0');
}

/**
 * Ce qu'un montant couvre. Sert à dire à quoi sert l'argent plutôt qu'à
 * suggérer un montant : personne n'est classé selon ce qu'il donne.
 */
export const CE_QUE_COUVRE_UN_DON = [
  { montant: 5, usage: 'un mois de carte pour un quartier' },
  { montant: 20, usage: 'la vérification de vingt candidatures' },
  { montant: 50, usage: 'un mois de fonctionnement complet' },
] as const;

/**
 * Les dons ne s'ouvrent qu'avec un compte pour les recevoir.
 *
 * Tant que l'association n'a pas d'IBAN, un formulaire de don produirait une
 * communication structurée pour un compte qui n'existe pas — et enverrait
 * quelqu'un faire un virement dans le vide. La règle est vérifiée deux fois :
 * la page ne montre pas le formulaire, et l'action serveur refuse quand même,
 * parce qu'un formulaire caché reste soumettable.
 */
export function lesDonsSontOuverts<T extends { iban: string | null }>(
  association: T,
): association is T & { iban: string } {
  return association.iban !== null;
}

/**
 * Un prénom, une adresse : les tailles au-delà desquelles on refuse.
 *
 * Personne n'a un prénom de quatre-vingts caractères ; une adresse tient très
 * largement en cent vingt. Refuser au-delà évite qu'un envoi automatique
 * fasse gonfler la table `don` ou le corps du courriel de remerciement.
 */
export const LONGUEUR_MAXIMALE_DU_PRENOM_D_UN_DON = 80;
export const LONGUEUR_MAXIMALE_DE_L_EMAIL_D_UN_DON = 120;

/**
 * On accepte jusqu'à trois annonces par adresse et par jour.
 *
 * Sans plafond, un formulaire ouvert au public devient un relais : quelqu'un
 * de mal intentionné pourrait envoyer en boucle « les coordonnées du
 * virement » à l'adresse d'un tiers. Trois annonces suffisent à quelqu'un
 * qui hésite entre un premier essai anonyme et un envoi identifié ; au
 * quatrième on demande de patienter.
 */
export const DONS_ANNONCES_PAR_ADRESSE_PAR_JOUR = 3;

export function peutEncoreAnnoncerUnDon(dejaAnnonces: number): boolean {
  return dejaAnnonces < DONS_ANNONCES_PAR_ADRESSE_PAR_JOUR;
}
