/**
 * Les adresses qui n'ont pas de vraie boîte derrière elles : les domaines que
 * la norme réserve aux essais (RFC 2606 et 6761) et ceux des comptes de
 * démonstration et de recette. Un courriel pour elles ne part jamais : il
 * n'arriverait nulle part, et chaque rebond abîme la réputation de
 * l'expéditeur auprès des fournisseurs de messagerie.
 */
const EXTENSIONS_RESERVEES = ['test', 'example', 'invalid', 'localhost'];
const DOMAINES_DE_DEMONSTRATION = ['exemple.be', 'exemple.test'];

export function adresseSansBoiteReelle(email: string): boolean {
  const arobase = email.lastIndexOf('@');
  const domaine = email
    .slice(arobase + 1)
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
  if (arobase < 1 || !domaine.includes('.')) return true;
  const extension = domaine.slice(domaine.lastIndexOf('.') + 1);
  return (
    EXTENSIONS_RESERVEES.includes(extension) ||
    DOMAINES_DE_DEMONSTRATION.some(
      (demo) => domaine === demo || domaine.endsWith(`.${demo}`),
    )
  );
}
