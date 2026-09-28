/**
 * Les deux lettres de l'avatar.
 *
 * Un nom peut manquer ou tenir en une lettre : on prend ce qu'il y a, sans
 * jamais afficher un rond vide.
 */
export function initialesDuMembre(membre: {
  prenom: string;
  nom: string;
}): string {
  const lettres = `${membre.prenom.charAt(0)}${membre.nom.charAt(0)}`.trim();
  return (lettres === '' ? membre.prenom.charAt(0) : lettres).toUpperCase();
}
