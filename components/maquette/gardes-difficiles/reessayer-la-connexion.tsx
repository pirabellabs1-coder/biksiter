'use client';

/**
 * Le bouton qui redemande la page.
 *
 * Rien à tester côté client : si le réseau est revenu, le rechargement le
 * montre tout de suite ; s'il n'est pas revenu, la page hors connexion
 * revient d'elle-même.
 */
export function ReessayerLaConnexion() {
  return (
    <button
      type="button"
      className="outline"
      onClick={() => window.location.reload()}
    >
      Réessayer la connexion
    </button>
  );
}
