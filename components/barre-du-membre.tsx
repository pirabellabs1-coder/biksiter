import Link from 'next/link';

import BoutonDeDeconnexion from '@/components/bouton-de-deconnexion';
import type { MembreConnecte } from '@/lib/depot/sessions';

/**
 * La navigation des pages réservées aux membres.
 *
 * Elle ne vit pas dans l'en-tête du site pour ne pas rendre dynamiques les
 * pages publiques, et parce que les deux navigations ne servent pas au même
 * moment : on ne lit pas la FAQ en même temps qu'on répond à une demande.
 */
export default function BarreDuMembre({
  membre,
  page,
}: {
  membre: MembreConnecte;
  page: 'compte' | 'emplacements' | 'stationnements';
}) {
  return (
    <div className="barre-membre">
      <div className="barre-membre__identite">
        <span className="emplacement__initiale" aria-hidden="true">
          {membre.prenom.charAt(0)}
        </span>
        <div>
          <strong>{membre.prenom}</strong>
          <div className="discret">
            {membre.verification === 'verifiee' ? (
              <span className="pastille pastille--verifie">Identité vérifiée</span>
            ) : (
              <span className="pastille pastille--neutre">
                Vérification en attente
              </span>
            )}
          </div>
        </div>
      </div>

      <nav aria-label="Mon espace" className="barre-membre__liens">
        <Link
          href="/mon-compte"
          aria-current={page === 'compte' ? 'page' : undefined}
        >
          Mon compte
        </Link>
        <Link
          href="/mes-emplacements"
          aria-current={page === 'emplacements' ? 'page' : undefined}
        >
          Mes emplacements
        </Link>
        <Link
          href="/mes-stationnements"
          aria-current={page === 'stationnements' ? 'page' : undefined}
        >
          Mes stationnements
        </Link>
      </nav>

      <BoutonDeDeconnexion />
    </div>
  );
}
