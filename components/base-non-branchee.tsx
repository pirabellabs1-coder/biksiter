/**
 * Ce que voit un visiteur quand DATABASE_URL n'est pas défini.
 *
 * On préfère le dire plutôt que retomber sur des données de démonstration :
 * un jeu de fausses données affiché à la place des vraies transforme une
 * panne visible en panne silencieuse, et personne ne s'en aperçoit avant que
 * quelqu'un se déplace chez un bike sitter qui n'existe pas.
 */
export default function BaseNonBranchee() {
  return (
    <div className="encart">
      <p>
        <strong>La base de données n’est pas branchée.</strong> Cette page lit
        les emplacements réels : sans base, elle n’a rien à montrer. Les pages
        qui n’en dépendent pas fonctionnent normalement.
      </p>
      <p className="discret">
        Pour la démarrer : <code>docker compose up -d</code>, puis{' '}
        <code>npm run bd:migrer</code> et <code>npm run bd:semer</code>.
      </p>
    </div>
  );
}
