import type { Metadata } from 'next';
import Link from 'next/link';

import BaseNonBranchee from '@/components/base-non-branchee';
import BandeauDePage from '@/components/bandeau-de-page';
import IconeCaracteristique from '@/components/icone-caracteristique';
import ZoneApproximative from '@/components/zone-approximative';
import { baseConfiguree } from '@/lib/bd/client';
import {
  emplacementsPublies,
  quartiersOuverts,
} from '@/lib/depot/emplacements';
import { quartiersEnAttente } from '@/lib/depot/liste-attente';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';
import {
  BIKE_SITTERS_POUR_OUVRIR,
  bikeSittersManquants,
} from '@/lib/regles/ouverture';
import { TYPES_VELO } from '@/lib/regles/velos';
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

/** Les trois filtres de la maquette, et rien de plus. */
const FILTRES = [
  { cle: '', libelle: 'Tous les vélos' },
  { cle: 'Cargo', libelle: 'Cargo et longtail' },
  { cle: 'Électrique', libelle: 'Électrique' },
] as const;

export default async function Emplacements({
  searchParams,
}: {
  searchParams: Promise<{
    quartier?: string;
    jour?: string;
    arrivee?: string;
    retour?: string;
    velo?: string;
    acces?: string;
  }>;
}) {
  const parametres = await searchParams;
  const recherche = parametres.quartier?.trim() ?? '';
  const velo =
    parametres.velo &&
    (TYPES_VELO as readonly string[]).includes(parametres.velo)
      ? parametres.velo
      : undefined;
  const plainPied = parametres.acces === 'plain-pied';

  // Le créneau vient de la recherche de la page d'accueil. Il n'est retenu que
  // si les trois morceaux sont là et se tiennent : une reprise avant le dépôt
  // ne filtre rien, elle vide la liste sans dire pourquoi.
  const debut =
    parametres.jour && parametres.arrivee
      ? instantABruxelles(parametres.jour, parametres.arrivee)
      : null;
  const fin =
    parametres.jour && parametres.retour
      ? instantABruxelles(parametres.jour, parametres.retour)
      : null;
  const creneau =
    debut && fin && fin.getTime() > debut.getTime()
      ? { debut, fin }
      : undefined;

  if (!baseConfiguree()) {
    return (
      <>
        <EnteteDeRecherche />
        <div className="page">
          <BaseNonBranchee />
        </div>
      </>
    );
  }

  const [emplacements, quartiers, enAttente, membre] = await Promise.all([
    emplacementsPublies({ quartier: recherche, creneau, velo, plainPied }),
    quartiersOuverts(),
    quartiersEnAttente(),
    membreConnecte(),
  ]);

  const peutDemander = membre?.verification === 'verifiee';

  /** Garde les autres filtres quand on en change un seul. */
  const avec = (changement: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const tout = {
      quartier: recherche || undefined,
      jour: parametres.jour,
      arrivee: parametres.arrivee,
      retour: parametres.retour,
      velo,
      acces: plainPied ? 'plain-pied' : undefined,
      ...changement,
    };
    for (const [nom, valeur] of Object.entries(tout)) {
      if (valeur) params.set(nom, valeur);
    }
    const chaine = params.toString();
    return chaine === '' ? '/emplacements' : `/emplacements?${chaine}`;
  };

  // Ce que la liste d'attente dit du quartier cherché, quand il n'est pas ouvert.
  const mobilisation = recherche
    ? enAttente.find((un) =>
        un.quartier.toLowerCase().includes(recherche.toLowerCase()),
      )
    : undefined;

  return (
    <>
      <EnteteDeRecherche />
      <div className="page">
        <form
          action="/emplacements"
          method="get"
          className="recherche-detaillee"
        >
          <div className="champ-en-ligne champ-en-ligne--large">
            <label htmlFor="quartier">Destination ou quartier</label>
            <input
              id="quartier"
              name="quartier"
              type="search"
              defaultValue={recherche}
              placeholder="Sainte-Catherine, Flagey, Châtelain…"
            />
          </div>

          <div className="champ-en-ligne">
            <label htmlFor="jour">Jour</label>
            <input
              id="jour"
              name="jour"
              type="date"
              defaultValue={parametres.jour ?? ''}
            />
          </div>

          <div className="champ-en-ligne">
            <label htmlFor="arrivee">Dépôt</label>
            <input
              id="arrivee"
              name="arrivee"
              type="time"
              step={1800}
              defaultValue={parametres.arrivee ?? ''}
            />
          </div>

          <div className="champ-en-ligne">
            <label htmlFor="retour">Reprise</label>
            <input
              id="retour"
              name="retour"
              type="time"
              step={1800}
              defaultValue={parametres.retour ?? ''}
            />
          </div>

          {velo ? <input type="hidden" name="velo" value={velo} /> : null}
          {plainPied ? (
            <input type="hidden" name="acces" value="plain-pied" />
          ) : null}

          <button type="submit" className="bouton bouton--principal">
            Chercher
          </button>
        </form>

        {/* Des liens et non des cases à cocher : chaque filtre est une adresse,
          donc il se partage, se met en favori et revient avec le bouton
          « précédent ». Aucun script n'est nécessaire pour cela. */}
        <nav aria-label="Filtres" className="filtres">
          {FILTRES.map((filtre) => {
            const actif = (velo ?? '') === filtre.cle;
            return (
              <Link
                key={filtre.libelle}
                href={avec({ velo: filtre.cle || undefined })}
                className={actif ? 'filtre filtre--actif' : 'filtre'}
                aria-current={actif ? 'true' : undefined}
              >
                <IconeCaracteristique pictogramme="capacite" />
                {filtre.libelle}
              </Link>
            );
          })}
          <Link
            href={avec({ acces: plainPied ? undefined : 'plain-pied' })}
            className={plainPied ? 'filtre filtre--actif' : 'filtre'}
            aria-current={plainPied ? 'true' : undefined}
          >
            <IconeCaracteristique pictogramme="acces" />
            Plain-pied
          </Link>
        </nav>

        {peutDemander ? null : (
          <p className="encart">
            <strong>Les emplacements sont consultables librement.</strong> Pour
            envoyer une demande, il vous faudra un compte vérifié ; pendant son
            lancement, le réseau s’ouvre sur invitation.
          </p>
        )}

        <section className="panneau">
          <div className="panneau__entete">
            <h2>
              <IconeCaracteristique pictogramme="carte" />
              Zones d’accueil
            </h2>
            <span className="pastille pastille--neutre pastille--sans-puce">
              rayon d’environ 500 m
            </span>
          </div>
          <div className="panneau__corps">
            <ZoneApproximative
              taches={emplacements.map(({ latitude, longitude }) => ({
                latitude,
                longitude,
              }))}
            />
            <p className="encart">
              <strong>Des zones plutôt que des adresses.</strong> Chaque zone
              situe un quartier. L’adresse exacte vous est transmise dès que
              votre demande est acceptée, pour préserver la vie privée des bike
              sitters.
            </p>
          </div>
        </section>

        <div className="resultats__entete">
          <h2 className="titre-section">
            {emplacements.length === 0
              ? 'Aucun emplacement ici'
              : emplacements.length === 1
                ? 'Un emplacement libre'
                : `${emplacements.length} emplacements libres`}
          </h2>
          {creneau ? (
            <p className="discret">
              pour {creneauEnFrancais(creneau.debut, creneau.fin)} ·{' '}
              <Link
                href={avec({
                  jour: undefined,
                  arrivee: undefined,
                  retour: undefined,
                })}
                className="lien"
              >
                sans le créneau
              </Link>
            </p>
          ) : null}
        </div>

        {emplacements.length === 0 ? (
          <ListeVide
            creneau={creneau !== undefined}
            recherche={recherche}
            mobilisation={mobilisation}
            sansCreneau={avec({
              jour: undefined,
              arrivee: undefined,
              retour: undefined,
            })}
            quartiersOuverts={quartiers}
          />
        ) : (
          <ul className="offres-emplacements">
            {emplacements.map((emplacement) => (
              <li key={emplacement.reference} className="panneau">
                <div className="panneau__corps carte-emplacement">
                  <div className="carte-emplacement__tete">
                    <span className="jeton-initiale" aria-hidden="true">
                      {emplacement.prenomDuBikeSitter.charAt(0)}
                    </span>
                    <div>
                      <p className="carte-emplacement__nom">
                        {emplacement.prenomDuBikeSitter}
                        <span className="pastille pastille--verifie">
                          Identité vérifiée
                        </span>
                      </p>
                      <p className="discret">{emplacement.quartier}</p>
                    </div>
                    <span className="pastille pastille--neutre pastille--sans-puce">
                      Gratuit
                    </span>
                  </div>

                  <h3 className="carte-emplacement__titre">
                    {emplacement.type}
                  </h3>

                  <ul className="caracteres">
                    <li className="caractere">
                      <IconeCaracteristique pictogramme="fermeture" />
                      {VERROUILLAGES[emplacement.verrouillage]}
                    </li>
                    <li className="caractere">
                      <IconeCaracteristique pictogramme="abri" />
                      {INTEMPERIES[emplacement.intemperie]}
                    </li>
                    <li className="caractere">
                      <IconeCaracteristique pictogramme="acces" />
                      {emplacement.acces}
                    </li>
                    <li className="caractere">
                      <IconeCaracteristique pictogramme="capacite" />
                      {emplacement.capacite > 1
                        ? `Jusqu’à ${emplacement.capacite} vélos`
                        : 'Un vélo à la fois'}
                    </li>
                  </ul>

                  <div className="carte-emplacement__velos">
                    <p className="carte-emplacement__libelle">
                      Vélos accueillis
                    </p>
                    <ul className="mini-jetons">
                      {emplacement.velosAcceptes.map((type) => (
                        <li key={type}>{type}</li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/emplacements/${emplacement.reference}`}
                    className="bouton bouton--principal bouton--large"
                  >
                    Voir l’emplacement
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function EnteteDeRecherche() {
  return (
    <BandeauDePage
      surtitre="Trouver un emplacement"
      titre="Où souhaitez-vous laisser votre vélo ?"
      chapeau="Les emplacements sont affichés en zone approximative. L’adresse exacte vous est communiquée dès que le bike sitter accepte votre demande — pas avant."
      scene="la-cave"
    />
  );
}

/**
 * Deux vides très différents, et une barre de mobilisation.
 *
 * Un quartier sans bike sitter et un quartier plein à cette heure-là ne se
 * disent pas pareil : le premier envoie sur la liste d'attente, le second
 * propose de décaler. Confondre les deux enverrait s'inscrire quelqu'un qui
 * n'avait qu'à changer d'heure.
 */
function ListeVide({
  creneau,
  recherche,
  mobilisation,
  sansCreneau,
  quartiersOuverts,
}: {
  creneau: boolean;
  recherche: string;
  mobilisation?: { quartier: string; bikeSitters: number };
  sansCreneau: string;
  quartiersOuverts: { quartier: string; combien: number }[];
}) {
  if (creneau) {
    return (
      <section className="panneau">
        <div className="panneau__entete">
          <h2>
            <IconeCaracteristique pictogramme="calendrier" />
            Rien de libre sur ce créneau
          </h2>
        </div>
        <div className="panneau__corps">
          <p className="discret">
            Les emplacements de cette recherche sont déjà occupés à ce
            moment-là. Essayez de décaler votre créneau d’une demi-heure : un
            battement de trente minutes est prévu entre deux vélos.
          </p>
          <div className="boutons">
            <Link href={sansCreneau} className="bouton bouton--principal">
              Voir sans filtrer sur l’heure
            </Link>
            <Link href="/liste-attente" className="bouton bouton--discret">
              Me prévenir quand il y en aura
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panneau">
      <div className="panneau__entete">
        <h2>
          <IconeCaracteristique pictogramme="carte" />
          {recherche === ''
            ? 'Aucun emplacement publié pour l’instant'
            : 'Ce quartier n’est pas encore ouvert'}
        </h2>
      </div>
      <div className="panneau__corps">
        <p className="discret">
          Le réseau s’étend quartier par quartier. Chaque quartier ouvre dès
          qu’il compte assez de bike sitters pour accueillir les cyclistes dans
          de bonnes conditions.
        </p>

        {mobilisation ? (
          <div className="mobilisation">
            <p className="mobilisation__ligne">
              <strong>{mobilisation.quartier}</strong>
              <span className="discret">
                {mobilisation.bikeSitters} sur {BIKE_SITTERS_POUR_OUVRIR} bike
                sitters
              </span>
            </p>
            <div
              className="mobilisation__jauge"
              role="img"
              aria-label={`${mobilisation.bikeSitters} bike sitters inscrits sur les ${BIKE_SITTERS_POUR_OUVRIR} nécessaires`}
            >
              <span
                style={{
                  width: `${Math.min(100, Math.round((mobilisation.bikeSitters / BIKE_SITTERS_POUR_OUVRIR) * 100))}%`,
                }}
              />
            </div>
            <p className="discret">
              {bikeSittersManquants(mobilisation.bikeSitters) === 0
                ? 'Ce quartier compte assez de bike sitters : son ouverture est en préparation.'
                : `Plus que ${bikeSittersManquants(mobilisation.bikeSitters)} pour ouvrir ce quartier.`}
            </p>
          </div>
        ) : null}

        <div className="boutons">
          <Link href="/liste-attente" className="bouton bouton--principal">
            Rejoindre la liste d’attente
          </Link>
          <Link
            href="/proposer-un-emplacement"
            className="bouton bouton--discret"
          >
            J’ai de la place ici
          </Link>
        </div>

        {quartiersOuverts.length === 0 ? null : (
          <>
            <p className="carte-emplacement__libelle">Quartiers déjà ouverts</p>
            <ul className="mini-jetons">
              {quartiersOuverts.map((ouvert) => (
                <li key={ouvert.quartier}>
                  <Link
                    href={`/emplacements?quartier=${encodeURIComponent(ouvert.quartier)}`}
                  >
                    {ouvert.quartier} · {ouvert.combien}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
