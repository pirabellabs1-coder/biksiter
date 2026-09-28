/**
 * L'adresse où revenir après la connexion.
 *
 * Elle voyage dans l'adresse de la page (`?suite=`) : n'importe qui peut donc
 * en fabriquer une. On n'accepte qu'un chemin de ce site — jamais une adresse
 * complète ni un `//autre-site` qui ferait sortir la personne vers une page
 * qui imiterait la nôtre.
 */
export function cheminDeRetour(valeur: unknown): string | null {
  if (typeof valeur !== 'string') return null;
  if (valeur.length === 0 || valeur.length > 500) return null;
  if (!valeur.startsWith('/') || valeur.startsWith('//')) return null;
  if (valeur.includes('\\') || !/^\/[\x21-\x7e]*$/.test(valeur)) return null;
  // Ni le lien de démonstration (il ouvre une autre session), ni une route
  // technique : on ne revient que sur une page du site.
  if (/^\/(lien-demo|api)(\/|\?|$)/.test(valeur)) return null;
  return valeur;
}
