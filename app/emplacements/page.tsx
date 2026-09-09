import type { Metadata } from 'next';
import Link from 'next/link';

import BaseNonBranchee from '@/components/base-non-branchee';
import ZoneApproximative from '@/components/zone-approximative';
import { baseConfiguree } from '@/lib/bd/client';
import { emplacementsPublies } from '@/lib/depot/emplacements';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';
import { membreConnecte } from '@/lib/session';
import { creneauEnFrancais, instantABruxelles } from '@/lib/temps';

export const metadata: Metadata = {
  title: 'Trouver un emplacement',
  description:
    'Les emplacements du réseau, affichés en zone approximative. L’adresse exacte n’est communiquée qu’une fois votre demande acceptée.',
};

/**
 * Les emplacements changent quand un bike sitter publie ou retire le sien :
 * la page se rend à chaque requête plutôt que d'être figée à la compilation.
 */
export const dynamic = 'force-dynamic';

export default async function Emplacements({
  searchParams,
}: {
  searchParams: Promise<{
    quartier?: string;
    jour?: string;
    arrivee?: string;
    retour?: string;
  }>;
}) {
  const { quartier, jour, arrivee, retour } = await searchParams;
  const recherche = quartier?.trim() ?? '';

  // Le créneau vient de la recherche de la page d'accueil. Il n'est retenu que
  // si les trois morceaux sont là et se tiennent : une reprise avant le dépôt
  // ne filtre rien, elle vide la liste sans dire pourquoi.
  const debut = jour && arrivee ? instantABruxelles(jour, arrivee) : null;
  const fin = jour && retour ? instantABruxelles(jour, retour) : null;
  const creneau =
    debut && fin && fin.getTime() > debut.getTime() ? { debut, fin } : undefined;

  const entete = (
    <>
      <p className="surtitre">Trouver un emplacement</p>
      <h1 className="titre-page">Où souhaitez-vous laisser votre vélo ?</h1>
      <p className="chapeau">
        Les emplacements sont affichés en zone approximative. L’adresse exacte
        vous est communiquée dès que le bike sitter accepte votre demande — pas
        avant.
      </p>
    </>
  );

  // Dire ce qui a été filtré, sinon une liste courte se lit comme un réseau
  // vide plutôt que comme un créneau chargé.
  const rappelDuCreneau = creneau ? (
    <div className="encart">
      <p>
        Vous cherchez pour <strong>{creneauEnFrancais(creneau.debut, creneau.fin)}</strong>.
        Les emplacements déjà pleins sur ce créneau ne sont pas affichés.{' '}
        <Link href="/emplacements" className="lien">
          Voir tous les emplacements
        </Link>
      </p>
    </div>
  ) : null;

  if (!baseConfiguree()) {
    return (
      <div className="page">
        {entete}
        <BaseNonBranchee />
      </div>
    );
  }

  const [emplacements, membre] = await Promise.all([
    emplacementsPublies(recherche, creneau),
    membreConnecte(),
  ]);

  const peutDemander = membre?.verification === 'verifiee';

  return (
    <div className="page">
      {entete}

      {rappelDuCreneau}

      {peutDemander ? null : (
        <div className="encart">
          <p>
            <strong>Vous pouvez regarder, pas encore demander.</strong> Le
            réseau est ouvert sur invitation pendant sa phase de démarrage. Vous
            voyez où sont les emplacements ; envoyer une demande suppose un
            compte dont l’identité a été vérifiée.
          </p>
        </div>
      )}

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
        {/* Le créneau suit la recherche : sans ces champs cachés, chercher
            un autre quartier le perdrait en silence. */}
        {jour ? <input type="hidden" name="jour" value={jour} /> : null}
        {arrivee ? <input type="hidden" name="arrivee" value={arrivee} /> : null}
        {retour ? <input type="hidden" name="retour" value={retour} /> : null}

        <button type="submit" className="bouton bouton--principal">
          Chercher
        </button>
      </form>

      <ZoneApproximative
        haute
        taches={emplacements.map((emplacement) => ({
          latitude: emplacement.latitude,
          longitude: emplacement.longitude,
        }))}
      />

      <section className="resultats">
        <h2 className="surtitre">
          {emplacements.length === 0
            ? 'Aucun emplacement ouvert ici'
            : `${emplacements.length} emplacement${emplacements.length > 1 ? 's' : ''} autour de ce point`}
        </h2>

        {emplacements.length === 0 ? (
          <div className="carte">
            {/* Deux vides très différents : un quartier sans bike sitter, et un
                quartier plein à cette heure-là. Les confondre enverrait sur la
                liste d'attente quelqu'un qui n'a qu'à décaler d'une heure. */}
            {creneau ? (
              <>
                <h3>Rien de libre sur ce créneau</h3>
                <p className="discret">
                  Les emplacements de ce quartier sont déjà pris à ce
                  moment-là, ou complets. Essayez une autre heure, un autre
                  jour, ou regardez ce qui est ouvert sans filtrer sur le
                  créneau.
                </p>
                <div className="boutons">
                  <Link
                    href={
                      recherche === ''
                        ? '/emplacements'
                        : `/emplacements?quartier=${encodeURIComponent(recherche)}`
                    }
                    className="bouton bouton--principal"
                  >
                    Voir sans filtrer sur le créneau
                  </Link>
                  <Link href="/liste-attente" className="bouton bouton--discret">
                    Rejoindre la liste d’attente
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3>Ce quartier n’est pas encore ouvert</h3>
                <p className="discret">
                  Un quartier ouvre quand il compte assez de bike sitters pour
                  qu’un cycliste y trouve une place à chaque fois. Dites-nous où
                  vous êtes : c’est ce qui nous dit où ouvrir ensuite.
                </p>
                <div className="boutons">
                  <Link
                    href="/liste-attente"
                    className="bouton bouton--principal"
                  >
                    Rejoindre la liste d’attente
                  </Link>
                  {recherche === '' ? null : (
                    <Link href="/emplacements" className="bouton bouton--discret">
                      Voir tous les emplacements
                    </Link>
                  )}
                </div>
              </>
            )}
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
