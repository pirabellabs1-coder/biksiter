import type { Metadata } from 'next';
import Link from 'next/link';

import ZoneApproximative from '@/components/zone-approximative';
import { EMPLACEMENTS_DE_DEMONSTRATION } from '@/lib/donnees/emplacements-de-demonstration';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';

export const metadata: Metadata = {
  title: 'Trouver un emplacement',
  description:
    'Les emplacements du réseau, affichés en zone approximative. L’adresse exacte n’est communiquée qu’une fois votre demande acceptée.',
};

export default async function Emplacements({
  searchParams,
}: {
  searchParams: Promise<{ quartier?: string }>;
}) {
  const { quartier } = await searchParams;
  const recherche = quartier?.trim() ?? '';

  // La liste complète tant qu'il n'y a pas de recherche : à ce stade le réseau
  // est petit, et cacher des emplacements derrière un champ vide n'aiderait
  // personne.
  const emplacements = recherche
    ? EMPLACEMENTS_DE_DEMONSTRATION.filter((emplacement) =>
        emplacement.quartier.toLowerCase().includes(recherche.toLowerCase()),
      )
    : EMPLACEMENTS_DE_DEMONSTRATION;

  return (
    <div className="page">
      <p className="surtitre">Trouver un emplacement</p>
      <h1 className="titre-page">Où souhaitez-vous laisser votre vélo ?</h1>
      <p className="chapeau">
        Les emplacements sont affichés en zone approximative. L’adresse exacte
        vous est communiquée dès que le bike sitter accepte votre demande — pas
        avant.
      </p>

      <div className="encart">
        <p>
          <strong>Vous pouvez regarder, pas encore demander.</strong> Le réseau
          est ouvert sur invitation pendant sa phase de démarrage. Vous voyez où
          sont les emplacements ; envoyer une demande suppose un compte dont
          l’identité a été vérifiée.
        </p>
      </div>

      <form action="/emplacements" method="get" className="recherche">
        <div className="recherche__champ">
          <label htmlFor="quartier">Quartier ou point de repère</label>
          <input
            id="quartier"
            name="quartier"
            type="search"
            defaultValue={recherche}
            placeholder="Bruxelles-Central, Flagey, Gare du Nord…"
          />
        </div>
        <button type="submit" className="bouton bouton--principal">
          Chercher
        </button>
      </form>

      <ZoneApproximative
        haute
        taches={emplacements.map((emplacement) => emplacement.position)}
      />

      <section className="resultats">
        <h2 className="surtitre">
          {emplacements.length === 0
            ? 'Aucun emplacement ouvert dans ce quartier'
            : `${emplacements.length} emplacement${emplacements.length > 1 ? 's' : ''} autour de ce point`}
        </h2>

        {emplacements.length === 0 ? (
          <div className="carte">
            <h3>Ce quartier n’est pas encore ouvert</h3>
            <p className="discret">
              Un quartier ouvre quand il compte assez de bike sitters pour qu’un
              cycliste y trouve une place à chaque fois. Dites-nous où vous
              êtes : c’est ce qui nous dit où ouvrir ensuite.
            </p>
            <div className="boutons">
              <Link href="/liste-attente" className="bouton bouton--principal">
                Rejoindre la liste d’attente
              </Link>
              <Link href="/emplacements" className="bouton bouton--discret">
                Voir tous les emplacements
              </Link>
            </div>
          </div>
        ) : (
          <ul className="emplacements">
            {emplacements.map((emplacement) => (
              <li key={emplacement.reference} className="emplacement">
                <span className="emplacement__initiale" aria-hidden="true">
                  {emplacement.prenomDuBikeSitter.charAt(0)}
                </span>

                <div className="emplacement__corps">
                  <h3>{emplacement.prenomDuBikeSitter}</h3>
                  <p>
                    {emplacement.type} ·{' '}
                    {emplacement.capacite > 1
                      ? `${emplacement.capacite} vélos`
                      : '1 vélo'}{' '}
                    · {VERROUILLAGES[emplacement.verrouillage].toLowerCase()} ·{' '}
                    {INTEMPERIES[emplacement.intemperie].toLowerCase()}
                  </p>
                  <p>
                    à quelques centaines de mètres de {emplacement.quartier}
                  </p>
                </div>

                <Link
                  href={`/emplacements/${emplacement.reference}`}
                  className="bouton bouton--discret"
                >
                  Voir l’emplacement
                  <span className="visuellement-cache">
                    {' '}
                    de {emplacement.prenomDuBikeSitter}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
