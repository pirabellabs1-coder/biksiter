/**
 * L’état partagé par tous les formulaires du site.
 *
 * Le statut `valide` mérite une explication : la validation est réelle et
 * complète (elle s’appuie sur les listes fermées de `lib/regles`), mais rien
 * n’est encore écrit nulle part — le schéma PostgreSQL n’existe pas. Plutôt
 * que d’afficher « c’est enregistré » à quelqu’un dont la demande part dans le
 * vide, on le dit. Le jour où `lib/depot` écrira vraiment, ce statut deviendra
 * `enregistre` et les messages suivront.
 */

export type EtatDuFormulaire =
  | { statut: 'vierge' }
  | { statut: 'erreur'; erreurs: Readonly<Record<string, string>> }
  | { statut: 'valide'; message: string };

export const FORMULAIRE_VIERGE: EtatDuFormulaire = { statut: 'vierge' };

/**
 * Clé réservée aux erreurs qui ne visent aucun champ — un refus d’autorisation,
 * par exemple. Le résumé d’erreurs ne la transforme pas en lien : il n’y a pas
 * de champ vers lequel envoyer le membre.
 */
export const ERREUR_GENERALE = 'formulaire';

export const RIEN_N_EST_ENCORE_ENVOYE =
  'Votre saisie est complète et valide. L’enregistrement n’est pas encore branché sur la base de données : rien n’a été transmis, et rien ne s’est perdu non plus.';

/** Lit un champ texte du formulaire sans jamais renvoyer autre chose qu’une
 *  chaîne — `FormData` peut contenir des fichiers. */
export function texte(donnees: FormData, champ: string): string {
  const valeur = donnees.get(champ);
  return typeof valeur === 'string' ? valeur.trim() : '';
}

/** Une adresse e-mail plausible. La vraie vérification, c’est le message qu’on
 *  y envoie — pas une expression régulière. */
export function ressembleAUnEmail(valeur: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur);
}
