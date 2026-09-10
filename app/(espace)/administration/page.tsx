import type { Metadata } from 'next';
import Link from 'next/link';

import BaseNonBranchee from '@/components/base-non-branchee';
import EnteteDePage from '@/components/espace/entete-de-page';
import IconeCaracteristique from '@/components/icone-caracteristique';
import { baseConfiguree } from '@/lib/bd/client';
import {
  etatDesDons,
  etatDuCatalogue,
  etatDuReseau,
  fileDEnvoi,
  maillonsEnSuspens,
  quartiersACouvrir,
  type QuartierACouvrir,
} from '@/lib/depot/administration';
import {
  candidaturesEnAttente,
  dossiersAVerifier,
} from '@/lib/depot/moderation';
import { ecrireUnNombre } from '@/lib/regles/chiffres';
import {
  BIKE_SITTERS_POUR_OUVRIR,
  bikeSittersManquants,
  maturiteDUnQuartier,
} from '@/lib/regles/ouverture';
import { exigerUnModerateur } from '@/lib/session';

export const metadata: Metadata = { title: 'Administration' };
export const dynamic = 'force-dynamic';

/** Au-delà, la file d'envoi n'est plus lente : elle est arrêtée. */
const HEURES_AVANT_DE_SINQUIETER = 6;

export default async function Administration() {
  const moderateur = await exigerUnModerateur();

  if (!baseConfiguree()) {
    return (
      <>
        <EnteteDePage surtitre="Administration" titre="L’état du réseau" />
        <BaseNonBranchee />
      </>
    );
  }

  const [reseau, file, quartiers, catalogue, dons, suspens, dossiers, candidatures] =
    await Promise.all([
      etatDuReseau(),
      fileDEnvoi(),
      quartiersACouvrir(),
      etatDuCatalogue(),
      etatDesDons(),
      maillonsEnSuspens(),
      dossiersAVerifier(),
      candidaturesEnAttente(),
    ]);

  const fileEnRetard =
    file.attenteLaPlusLongueEnHeures !== null &&
    file.attenteLaPlusLongueEnHeures >= HEURES_AVANT_DE_SINQUIETER;

  const prets = quartiers.filter(
    (quartier) =>
      !quartier.dejaOuvert && maturiteDUnQuartier(quartier.bikeSitters) === 'pret',
  );

  const aFaire = [
    ...(file.enEchec > 0 || fileEnRetard
      ? [
          {
            cle: 'file',
            variante: 'bloquant' as const,
            titre:
              file.enEchec > 0
                ? `${file.enEchec} message${file.enEchec > 1 ? 's' : ''} en échec d’envoi`
                : 'La file d’envoi n’avance plus',
            phrase:
              'Rien ne casse à l’écran quand la file s’arrête : les messages s’empilent, et quelqu’un attend devant une porte l’adresse qu’il n’a jamais reçue.',
            lien: null,
          },
        ]
      : []),
    ...(dossiers.length > 0
      ? [
          {
            cle: 'pieces',
            variante: 'attente' as const,
            titre:
              dossiers.length === 1
                ? 'Une pièce d’identité attend une relecture'
                : `${dossiers.length} pièces d’identité attendent une relecture`,
            phrase:
              'Elles sont supprimées automatiquement au bout de quelques jours, vérifiées ou non.',
            lien: '/moderation',
          },
        ]
      : []),
    ...(candidatures.length > 0
      ? [
          {
            cle: 'candidatures',
            variante: 'attente' as const,
            titre:
              candidatures.length === 1
                ? 'Une candidature d’emplacement à classer'
                : `${candidatures.length} candidatures d’emplacement à classer`,
            phrase:
              'Déposées par des personnes qui n’ont pas encore de compte, et qui attendent une réponse.',
            lien: '/moderation',
          },
        ]
      : []),
    ...(suspens.gardesContestees > 0
      ? [
          {
            cle: 'contestations',
            variante: 'actif' as const,
            titre:
              suspens.gardesContestees === 1
                ? 'Une garde est contestée'
                : `${suspens.gardesContestees} gardes sont contestées`,
            phrase: `${suspens.maillonsRetenus} maillon${suspens.maillonsRetenus > 1 ? 's sont retenus' : ' est retenu'} le temps que quelqu’un regarde.`,
            lien: null,
          },
        ]
      : []),
    ...(prets.length > 0
      ? [
          {
            cle: 'ouvertures',
            variante: 'attente' as const,
            titre:
              prets.length === 1
                ? `${prets[0].quartier} a de quoi ouvrir`
                : `${prets.length} quartiers ont de quoi ouvrir`,
            phrase: `Au moins ${BIKE_SITTERS_POUR_OUVRIR} bike sitters y sont inscrits sur la liste d’attente, et aucun emplacement n’y est publié.`,
            lien: null,
          },
        ]
      : []),
  ];

  const chiffres = [
    {
      valeur: `${ecrireUnNombre(reseau.membresVerifies)} / ${ecrireUnNombre(reseau.membres)}`,
      libelle: 'membres vérifiés',
    },
    {
      valeur: `${ecrireUnNombre(reseau.emplacementsPublies)} / ${ecrireUnNombre(reseau.emplacements)}`,
      libelle: 'emplacements publiés',
    },
    {
      valeur: ecrireUnNombre(reseau.quartiersOuverts),
      libelle:
        reseau.quartiersOuverts > 1 ? 'quartiers ouverts' : 'quartier ouvert',
    },
    {
      valeur: ecrireUnNombre(reseau.gardesEnCours),
      libelle:
        reseau.gardesEnCours > 1
          ? 'vélos gardés en ce moment'
          : 'vélo gardé en ce moment',
    },
    {
      valeur: ecrireUnNombre(reseau.gardesTerminees),
      libelle:
        reseau.gardesTerminees > 1
          ? 'gardes menées à bien'
          : 'garde menée à bien',
    },
    {
      valeur: ecrireUnNombre(reseau.surLaListeDAttente),
      libelle:
        reseau.surLaListeDAttente > 1
          ? 'personnes sur la liste d’attente'
          : 'personne sur la liste d’attente',
    },
  ];

  return (
    <>
      {/* Un bandeau de marque plutôt qu'un en-tête de page ordinaire : cet
          écran ne se lit pas, il se consulte, et les six nombres qui le
          résument doivent tenir dans le premier regard. */}
      <section className="console">
        <div className="console__propos">
          <p className="surtitre">Administration</p>
          <h1>L’état du réseau</h1>
          <p>
            Bonjour {moderateur.prenom}. Des nombres et des états — aucune
            adresse, aucun corps de message, aucun classement entre membres.
          </p>
        </div>

        <ul className="console__chiffres">
          {chiffres.map((chiffre) => (
            <li key={chiffre.libelle}>
              <span className="console__valeur">{chiffre.valeur}</span>
              <span className="console__libelle">{chiffre.libelle}</span>
            </li>
          ))}
        </ul>

        <div className="boutons">
          <Link href="/moderation" className="bouton bouton--clair">
            Aller à la modération
          </Link>
        </div>
      </section>

      {aFaire.length === 0 ? (
        <div className="a-faire">
          <div className="a-faire__entree a-faire__entree--calme">
            <div className="a-faire__corps">
              <strong>Rien n’attend de décision</strong>
              <p>
                Pas de pièce à relire, pas de candidature à classer, pas de
                message en échec. C’est l’état normal, et c’est très bien.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="a-faire">
          {aFaire.map((entree) => (
            <div
              key={entree.cle}
              className={
                entree.variante === 'attente'
                  ? 'a-faire__entree'
                  : `a-faire__entree a-faire__entree--${entree.variante}`
              }
            >
              <div className="a-faire__corps">
                <strong>{entree.titre}</strong>
                <p>{entree.phrase}</p>
              </div>
              {entree.lien ? (
                <Link href={entree.lien} className="bouton bouton--discret">
                  Ouvrir
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="panneaux panneaux--deux">
        <section className="panneau">
          <div className="panneau__entete">
            <h2>Où ouvrir ensuite</h2>
            <span className="discret">
              {BIKE_SITTERS_POUR_OUVRIR} bike sitters pour ouvrir
            </span>
          </div>

          <div className="panneau__corps">
            <p className="discret">
              Ce sont les bike sitters qui décident, jamais les cyclistes&nbsp;:
              un quartier plein de gens qui cherchent une place et vide de gens
              qui en offrent n’est pas près d’ouvrir, il est près de décevoir.
            </p>
          </div>

          {quartiers.length === 0 ? (
            <div className="vide">
              <IconeCaracteristique pictogramme="carte" />
              <p>
                Personne ne s’est encore inscrit sur la liste d’attente. Ce
                panneau est la carte des quartiers à venir&nbsp;: il se remplit
                à mesure que les gens disent où ils habitent.
              </p>
            </div>
          ) : (
            <ul className="lignes">
              {quartiers.map((quartier) => (
                <LigneDeQuartier key={quartier.quartier} quartier={quartier} />
              ))}
            </ul>
          )}
        </section>

        <div className="panneaux">
          <section className="panneau">
            <div className="panneau__entete">
              <h2>La file d’envoi</h2>
              <span
                className={
                  file.enEchec > 0 || fileEnRetard
                    ? 'pastille pastille--refus'
                    : 'pastille pastille--verifie'
                }
              >
                {file.enEchec > 0 || fileEnRetard ? 'à regarder' : 'elle passe'}
              </span>
            </div>

            <div className="panneau__corps">
              <dl className="details">
                <div>
                  <dt>En attente</dt>
                  <dd>{ecrireUnNombre(file.enAttente)}</dd>
                </div>
                <div>
                  <dt>En échec</dt>
                  <dd>{ecrireUnNombre(file.enEchec)}</dd>
                </div>
                <div>
                  <dt>Partis ces sept jours</dt>
                  <dd>{ecrireUnNombre(file.envoyesCetteSemaine)}</dd>
                </div>
                <div>
                  <dt>Plus longue attente</dt>
                  <dd>
                    {file.attenteLaPlusLongueEnHeures === null
                      ? '—'
                      : `${ecrireUnNombre(file.attenteLaPlusLongueEnHeures)} h`}
                  </dd>
                </div>
              </dl>

              {/* Ce panneau compte, il ne lit pas : les messages d'acceptation
                  contiennent les adresses que tout le reste du produit
                  protège (règle 4). */}
              <p className="discret">
                On compte les messages, on ne les ouvre pas. Un message
                d’acceptation contient une adresse exacte, et cet écran n’a
                aucune raison de la connaître.
              </p>
            </div>
          </section>

          <section className="panneau">
            <div className="panneau__entete">
              <h2>Le catalogue</h2>
              <Link href="/catalogue">Le voir</Link>
            </div>
            <div className="panneau__corps">
              <dl className="details">
                <div>
                  <dt>Partenaires</dt>
                  <dd>{ecrireUnNombre(catalogue.partenaires)}</dd>
                </div>
                <div>
                  <dt>Offres actives</dt>
                  <dd>{ecrireUnNombre(catalogue.offresActives)}</dd>
                </div>
                <div>
                  <dt>Exemplaires restants</dt>
                  <dd>{ecrireUnNombre(catalogue.exemplairesRestants)}</dd>
                </div>
                <div>
                  <dt>Bons échangés</dt>
                  <dd>
                    {ecrireUnNombre(catalogue.bonsEchanges)}
                    {catalogue.bonsEchanges > 0
                      ? ` · ${ecrireUnNombre(catalogue.bonsUtilises)} utilisé${catalogue.bonsUtilises > 1 ? 's' : ''}`
                      : ''}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="panneau">
            <div className="panneau__entete">
              <h2>Les dons</h2>
            </div>
            <div className="panneau__corps">
              <dl className="details">
                <div>
                  <dt>Annoncés</dt>
                  <dd>{ecrireUnNombre(dons.annonces)}</dd>
                </div>
                <div>
                  <dt>À rapprocher</dt>
                  <dd>{ecrireUnNombre(dons.aRapprocher)}</dd>
                </div>
                <div>
                  <dt>Total annoncé</dt>
                  <dd>{ecrireUnNombre(dons.totalAnnonceEnEuros)} €</dd>
                </div>
              </dl>
              <p className="discret">
                Des annonces, jamais des donateurs&nbsp;: ni prénom ni adresse
                n’apparaissent ici. Un don ne donne aucun avantage sur le
                service, et un écran qui nommerait ceux qui donnent finirait par
                en donner un.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function LigneDeQuartier({ quartier }: { quartier: QuartierACouvrir }) {
  const maturite = maturiteDUnQuartier(quartier.bikeSitters);
  const manquants = bikeSittersManquants(quartier.bikeSitters);

  const etat = quartier.dejaOuvert
    ? { classe: 'pastille pastille--verifie', mot: 'ouvert' }
    : maturite === 'pret'
      ? { classe: 'pastille pastille--verifie', mot: 'de quoi ouvrir' }
      : maturite === 'bientot'
        ? {
            classe: 'pastille pastille--neutre',
            mot: `il en manque ${manquants}`,
          }
        : { classe: 'pastille pastille--neutre', mot: 'trop tôt' };

  return (
    <li>
      <div className="ligne">
        <span className="ligne__corps">
          <span className="ligne__titre">{quartier.quartier}</span>
          <span className="ligne__detail">
            {quartier.bikeSitters} bike sitter
            {quartier.bikeSitters > 1 ? 's' : ''} · {quartier.cyclistes}{' '}
            cycliste{quartier.cyclistes > 1 ? 's' : ''}
          </span>
        </span>
        <span className="ligne__fin">
          <span className={etat.classe}>{etat.mot}</span>
        </span>
      </div>
    </li>
  );
}
