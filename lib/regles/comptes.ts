/**
 * La création d'un compte, la connexion et le mot de passe oublié.
 */

/**
 * Huit caractères, et rien d'autre comme exigence : imposer une majuscule, un
 * chiffre et un caractère spécial produit des mots de passe plus prévisibles,
 * pas plus sûrs. Une phrase courte dont on se souvient fait très bien l'affaire.
 */
export const LONGUEUR_MINIMALE_DU_MOT_DE_PASSE = 8;

/** Au-delà, un mot de passe est presque toujours un texte collé par erreur. */
export const LONGUEUR_MAXIMALE_DU_MOT_DE_PASSE = 200;

/** Le lien de confirmation d'adresse : deux jours pour ouvrir sa messagerie. */
export const VALIDITE_DU_LIEN_DE_CONFIRMATION_HEURES = 48;

/**
 * Le lien pour choisir un nouveau mot de passe : une heure. Il donne l'accès
 * au compte ; plus il vit longtemps, plus une boîte de réception compromise
 * plus tard suffirait à s'en servir.
 */
export const VALIDITE_DU_LIEN_DE_MOT_DE_PASSE_MINUTES = 60;

export type UsageDeJeton = 'confirmation_email' | 'nouveau_mot_de_passe';

export function dureeDeValidite(usage: UsageDeJeton): number {
  return usage === 'confirmation_email'
    ? VALIDITE_DU_LIEN_DE_CONFIRMATION_HEURES * 60 * 60 * 1000
    : VALIDITE_DU_LIEN_DE_MOT_DE_PASSE_MINUTES * 60 * 1000;
}

/** La longueur maximale d'une adresse e-mail (RFC 5321). */
export const LONGUEUR_MAXIMALE_D_UN_EMAIL = 254;

/**
 * Une adresse e-mail plausible. La vraie vérification, c'est le message qu'on
 * y envoie — pas une expression régulière.
 *
 * La longueur est bornée avant l'expression, et chaque partie du domaine est
 * délimitée par ses points : l'évaluation reste linéaire. Une expression où
 * deux répétitions se disputent les mêmes caractères prend un temps qui
 * explose avec la longueur, et une seule adresse de quelques centaines de
 * kilo-octets suffirait à bloquer le serveur.
 */
export function ressembleAUnEmail(valeur: string): boolean {
  return (
    valeur.length <= LONGUEUR_MAXIMALE_D_UN_EMAIL &&
    /^[^\s@]{1,64}@[^\s@.]{1,63}(?:\.[^\s@.]{1,63})*\.[^\s@.]{2,63}$/.test(
      valeur,
    )
  );
}

/** Un caractère nul n'a rien à faire dans un texte, et PostgreSQL le refuse. */
export function contientUnCaractereNul(valeur: string): boolean {
  return valeur.includes('\u0000');
}

export function erreurDeMotDePasse(motDePasse: string): string | null {
  if (motDePasse.length < LONGUEUR_MINIMALE_DU_MOT_DE_PASSE) {
    return `Le mot de passe doit faire au moins ${LONGUEUR_MINIMALE_DU_MOT_DE_PASSE} caractères.`;
  }
  if (motDePasse.length > LONGUEUR_MAXIMALE_DU_MOT_DE_PASSE) {
    return `Le mot de passe peut contenir jusqu’à ${LONGUEUR_MAXIMALE_DU_MOT_DE_PASSE} caractères.`;
  }
  return null;
}

export type SaisieDInscription = {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
};

export type ErreursDInscription = Partial<
  Record<keyof SaisieDInscription, string>
>;

export function verifierLInscription(
  saisie: SaisieDInscription,
): ErreursDInscription {
  const erreurs: ErreursDInscription = {};
  if (saisie.prenom.trim() === '') {
    erreurs.prenom = 'Indiquez votre prénom.';
  }
  if (saisie.nom.trim() === '') {
    erreurs.nom = 'Indiquez votre nom.';
  }
  if (!ressembleAUnEmail(saisie.email)) {
    erreurs.email = 'Indiquez une adresse e-mail valide.';
  }
  const motDePasse = erreurDeMotDePasse(saisie.motDePasse);
  if (motDePasse) {
    erreurs.motDePasse = motDePasse;
  }
  return erreurs;
}

/**
 * Le prénom et le nom figurent sur la pièce que la modération examine ou a
 * examinée. Les changer ensuite ferait mentir la vérification : on passe alors
 * par une demande à l'association.
 */
export function nomModifiable(verification: string): boolean {
  return verification !== 'verifiee' && verification !== 'en_cours';
}

/**
 * Une demande attend une réponse, une garde engage quelqu'un, un litige attend
 * la modération : supprimer le compte à ce moment laisserait l'autre personne
 * sans interlocuteur, parfois sans son vélo.
 */
export const ETATS_QUI_RETIENNENT_UN_COMPTE = [
  'demande',
  'accepte',
  'arrivee',
  'en_cours',
  'reprise_demandee',
  'litige',
] as const;

export function compteSupprimable(etatsDesGardes: readonly string[]): boolean {
  return !etatsDesGardes.some((etat) =>
    (ETATS_QUI_RETIENNENT_UN_COMPTE as readonly string[]).includes(etat),
  );
}
