/**
 * L'adresse publique du site, pour les liens envoyés par courriel.
 *
 * Elle vient de la configuration et jamais de la requête : un lien construit
 * à partir de l'en-tête « Host » pourrait être détourné vers un autre site,
 * et c'est précisément le lien qui donne accès au compte.
 */
export function adresseDuSite(): string {
  const configuree = process.env.ADRESSE_DU_SITE?.trim();
  if (configuree) {
    return configuree.replace(/\/+$/, '');
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000';
  }
  throw new Error(
    'ADRESSE_DU_SITE n’est pas définie : les liens envoyés par courriel ne peuvent pas être construits.',
  );
}
