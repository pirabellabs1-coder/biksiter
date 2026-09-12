import type { Metadata } from 'next';
import Link from 'next/link';

import Appel from '@/components/appel';
import Chiffres from '@/components/chiffres';
import IconeCaracteristique from '@/components/icone-caracteristique';
import Illustration from '@/components/illustration';
import ZoneApproximative from '@/components/zone-approximative';
import { baseConfiguree } from '@/lib/bd/client';
import { ASSOCIATION } from '@/lib/contenu/association';
import { derniersAvisDuReseau, type AvisDuReseau } from '@/lib/depot/avis';
import { mesuresDuReseau } from '@/lib/depot/chiffres';
import {
  emplacementsPublies,
  quartiersOuverts,
  type FicheDEmplacement,
  type QuartierOuvert,
} from '@/lib/depot/emplacements';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';
import {
  chiffresAAfficher,
  type Chiffre,
  type MesuresDuReseau,
} from '@/lib/regles/chiffres';
import { TYPES_VELO, typeVeloDansUnePhrase } from '@/lib/regles/velos';
import { jourABruxelles } from '@/lib/temps';

export const metadata: Metadata = {
  title: 'Bike Sitters — votre vélo à l’abri, chez quelqu’un du quartier',
  description:
    'Un réseau d’entraide entre habitants de Bruxelles : quelqu’un garde votre vélo chez lui, gratuitement, le temps de votre journée. Association sans but lucratif.',
};

const RIEN_ENCORE: MesuresDuReseau = {
  gardesRealisees: 0,
  habitantsQuiAccueillent: 0,
  quartiersOuverts: 0,
};

/** Ce qu'on montre en vitrine : assez pour donner une idée, jamais un palmarès. */
const EMPLACEMENTS_EN_VITRINE = 3;

export default async function Accueil() {
  // La page d'accueil doit s'afficher même sans base : c'est souvent le premier
  // écran qu'on ouvre après un déploiement, et une erreur de connexion ne
  // dirait rien d'utile à qui découvre le service.
  const [mesures, avis, quartiers, emplacements] = baseConfiguree()
    ? await Promise.all([
        mesuresDuReseau(),
        derniersAvisDuReseau(),
        quartiersOuverts(),
        emplacementsPublies({}),
      ])
    : [
        RIEN_ENCORE,
        [] as AvisDuReseau[],
        [] as QuartierOuvert[],
        [] as FicheDEmplacement[],
      ];

  const chiffres = chiffresAAfficher(mesures);

  return (
    <>
      <Accroche />
      <Recherche />
      {chiffres.length === 0 ? null : <BandeauDeChiffres chiffres={chiffres} />}
      <TroisFacons />
      <CommentCaSePasse />
      <PresDeChezVous
        quartiers={quartiers}
        vitrine={emplacements.slice(0, EMPLACEMENTS_EN_VITRINE)}
      />
      <Confiance />
      <Temoignages avis={avis} />
      <LesVelos />
      <Rejoindre />
    </>
  );
}

/* --- 1. L'accroche ---------------------------------------------------------- */

function Accroche() {
  return (
    <section className="accroche">
      <div className="accroche__interieur">
        <div className="accroche__propos apparait">
          <p className="surtitre">Plus qu’un stationnement, des voisins</p>

          <h1 className="titre-page titre-page--phrase">
            Confiez votre vélo à quelqu’un du quartier.
          </h1>

          <p className="chapeau">
            Un bike sitter est un habitant qui range votre vélo chez lui — un
            garage, une cave, une cour fermée — pour quelques heures ou quelques
            jours. Le service est gratuit, et chaque bike sitter est vérifié par
            l’association avant de pouvoir accueillir.
          </p>

          <div className="boutons">
            <Link href="/emplacements" className="bouton bouton--principal">
              Trouver un emplacement
            </Link>
            <Link
              href="/proposer-un-emplacement"
              className="bouton bouton--discret"
            >
              Accueillir un vélo
            </Link>
          </div>

          {/* Trois faits, pas trois arguments : chacun se vérifie ailleurs sur
              le site, et aucun ne promet ce que le produit ne fait pas. */}
          <ul className="gages">
            <li>
              <IconeCaracteristique pictogramme="identite" />
              Identité vérifiée par une personne
            </li>
            <li>
              <IconeCaracteristique pictogramme="prive" />
              Emplacements privés et fermés
            </li>
            <li>
              <IconeCaracteristique pictogramme="code" />
              Remise par code à quatre chiffres
            </li>
          </ul>
        </div>

        <div className="accroche__scene apparait">
          <Illustration scene="la-remise" />
        </div>
      </div>
    </section>
  );
}

/* --- 2. La recherche -------------------------------------------------------- */

function Recherche() {
  const aujourdhui = jourABruxelles();

  return (
    <section className="recherche-vedette" aria-labelledby="recherche-titre">
      <div className="recherche-vedette__carte apparait">
        <div className="recherche-vedette__entete">
          <h2 id="recherche-titre" className="titre-section">
            Où souhaitez-vous laisser votre vélo&nbsp;?
          </h2>
          <p className="discret">
            Les emplacements s’affichent dans une zone approximative ; l’adresse
            exacte vous est transmise dès que le bike sitter accepte votre
            demande.
          </p>
        </div>

        <form
          action="/emplacements"
          method="get"
          className="recherche-detaillee"
        >
          <div className="champ-en-ligne champ-en-ligne--large">
            <label htmlFor="quartier-accueil">Destination</label>
            <input
              id="quartier-accueil"
              name="quartier"
              type="search"
              placeholder="Flagey, Saint-Gilles, Gare du Midi…"
            />
          </div>

          <div className="champ-en-ligne">
            <label htmlFor="jour-accueil">Jour</label>
            <input
              id="jour-accueil"
              name="jour"
              type="date"
              defaultValue={aujourdhui}
              min={aujourdhui}
            />
          </div>

          <div className="champ-en-ligne">
            <label htmlFor="arrivee-accueil">Dépôt</label>
            <input
              id="arrivee-accueil"
              name="arrivee"
              type="time"
              step={1800}
              defaultValue="09:00"
            />
          </div>

          <div className="champ-en-ligne">
            <label htmlFor="retour-accueil">Reprise</label>
            <input
              id="retour-accueil"
              name="retour"
              type="time"
              step={1800}
              defaultValue="18:00"
            />
          </div>

          <button type="submit" className="bouton bouton--principal">
            Chercher
          </button>
        </form>
      </div>
    </section>
  );
}

/* --- 3. Le bandeau de chiffres ---------------------------------------------- */

function BandeauDeChiffres({ chiffres }: { chiffres: readonly Chiffre[] }) {
  return (
    <section className="bandeau-chiffres">
      <h2 className="visuellement-cache">Le réseau en chiffres</h2>
      <div className="bandeau-chiffres__interieur apparait">
        <Chiffres chiffres={chiffres} />
      </div>
    </section>
  );
}

/* --- 4. Trois façons de participer ------------------------------------------ */

const FACONS = [
  {
    scene: 'confier' as const,
    titre: 'Confier son vélo',
    texte:
      'Choisissez un emplacement près de votre destination et convenez d’une heure de dépôt et de reprise : votre vélo passe la journée à l’abri, derrière une porte fermée.',
  },
  {
    scene: 'garder' as const,
    titre: 'Garder celui d’un autre',
    texte:
      'Un garage, une cave ou une cour fermée suffisent. Accueillir est gratuit et sans engagement : vous acceptez les demandes qui vous conviennent.',
  },
  {
    scene: 'ensemble' as const,
    titre: 'Faire vivre le réseau',
    texte:
      'Avec un seul compte, vous pouvez faire garder votre vélo comme accueillir celui d’un voisin. Chaque nouvel emplacement aide le réseau à s’étendre dans votre quartier.',
  },
];

function TroisFacons() {
  return (
    <section className="section section--marque">
      <div className="section__interieur">
        <div className="entete-de-section entete-de-section--centree apparait">
          <p className="surtitre">Un réseau d’entraide</p>
          <h2 className="titre-section titre-section--large">
            Gratuit, entre voisins, en toute confiance.
          </h2>
          <p className="chapeau">
            Bike Sitters est une association : le service est gratuit et le
            restera. Vous pouvez y participer de trois façons, souvent toutes à
            la fois.
          </p>
        </div>

        <ul className="grille grille--trois cartes-nues">
          {FACONS.map((facon) => (
            <li key={facon.titre} className="carte carte--illustree apparait">
              <div className="carte__illustration">
                <Illustration scene={facon.scene} />
              </div>
              <div className="carte__corps">
                <h3>{facon.titre}</h3>
                <p className="discret">{facon.texte}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --- 5. Comment ça se passe -------------------------------------------------- */

const ETAPES = [
  {
    pictogramme: 'compte' as const,
    titre: 'Vous entrez dans le réseau',
    texte:
      'Sur invitation d’un membre pendant le lancement. Une personne de l’association vérifie votre identité, pour la sécurité de tous.',
  },
  {
    pictogramme: 'carte' as const,
    titre: 'Vous cherchez près de votre destination',
    texte:
      'Chaque emplacement s’affiche en zone approximative, avec son type, sa fermeture et les vélos qu’il accueille.',
  },
  {
    pictogramme: 'message' as const,
    titre: 'Vous envoyez votre demande',
    texte:
      'Vous proposez une heure de dépôt et une heure de reprise. Le bike sitter vous répond depuis son espace.',
  },
  {
    pictogramme: 'code' as const,
    titre: 'Vous déposez, puis vous reprenez',
    texte:
      'L’adresse vous est transmise dès l’acceptation. Sur place, un code à quatre chiffres confirme le dépôt, puis un second la reprise.',
  },
];

function CommentCaSePasse() {
  return (
    <section className="section">
      <div className="section__interieur">
        <div className="entete-de-section entete-de-section--centree apparait">
          <p className="surtitre">Comment ça se passe</p>
          <h2 className="titre-section titre-section--large">
            Quatre étapes, et rien à installer.
          </h2>
        </div>

        <ol className="parcours">
          {ETAPES.map((etape, rang) => (
            <li key={etape.titre} className="parcours__etape apparait">
              <div className="parcours__marque">
                <span className="parcours__jeton">
                  <IconeCaracteristique pictogramme={etape.pictogramme} />
                </span>
                <span className="parcours__numero" aria-hidden="true">
                  {rang + 1}
                </span>
              </div>
              <h3>{etape.titre}</h3>
              <p className="discret">{etape.texte}</p>
            </li>
          ))}
        </ol>

        <div className="boutons boutons--centres apparait">
          <Link href="/fonctionnement" className="bouton bouton--discret">
            Le déroulé complet, étape par étape
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --- 6. Près de chez vous ---------------------------------------------------- */

function PresDeChezVous({
  quartiers,
  vitrine,
}: {
  quartiers: QuartierOuvert[];
  vitrine: FicheDEmplacement[];
}) {
  if (quartiers.length === 0) {
    return (
      <section className="section section--claire">
        <div className="section__interieur">
          <div className="entete-de-section apparait">
            <p className="surtitre">Où c’est ouvert</p>
            <h2 className="titre-section titre-section--large">
              Le réseau se construit en ce moment.
            </h2>
            <p className="chapeau">
              Les premiers emplacements arrivent bientôt. Chaque quartier ouvre
              dès qu’il compte assez de bike sitters pour accueillir les
              cyclistes dans de bonnes conditions.
            </p>
            <div className="boutons">
              <Link
                href="/proposer-un-emplacement"
                className="bouton bouton--principal"
              >
                Proposer le premier de votre rue
              </Link>
              <Link href="/liste-attente" className="bouton bouton--discret">
                Me prévenir quand mon quartier ouvre
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--claire">
      <div className="section__interieur">
        <div className="entete-de-section apparait">
          <p className="surtitre">Où c’est ouvert</p>
          <h2 className="titre-section titre-section--large">
            {quartiers.length === 1
              ? 'Un quartier, pour commencer.'
              : `${quartiers.length} quartiers, aujourd’hui.`}
          </h2>
          <p className="chapeau">
            Le réseau ouvre quartier par quartier. Les emplacements ci-dessous
            sont présentés dans l’ordre de leur publication.
          </p>
        </div>

        <div className="deux-colonnes deux-colonnes--figure apparait">
          <figure className="figure-illustree">
            <ZoneApproximative
              taches={quartiers.map(({ latitude, longitude }) => ({
                latitude,
                longitude,
              }))}
            />
            <figcaption className="discret">
              Chaque zone situe un quartier ; les adresses restent
              confidentielles.
            </figcaption>
          </figure>

          <div>
            <ul className="quartiers">
              {quartiers.map((ouvert) => (
                <li key={ouvert.quartier}>
                  <Link
                    href={`/emplacements?quartier=${encodeURIComponent(ouvert.quartier)}`}
                  >
                    <span>{ouvert.quartier}</span>
                    <span className="discret">
                      {ouvert.combien === 1
                        ? '1 emplacement'
                        : `${ouvert.combien} emplacements`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="bloc__apres">
              Votre quartier n’y est pas&nbsp;?{' '}
              <Link href="/liste-attente" className="lien">
                Dites-le nous
              </Link>{' '}
              et nous vous préviendrons dès son ouverture.
            </p>
          </div>
        </div>

        {vitrine.length === 0 ? null : (
          <>
            <h3 className="titre-sous-section apparait">
              Quelques emplacements ouverts
            </h3>

            <ul className="grille grille--trois cartes-nues">
              {vitrine.map((emplacement) => (
                <li
                  key={emplacement.reference}
                  className="carte carte--aeree carte--profil apparait"
                >
                  <div className="carte__tete">
                    <span className="emplacement__initiale" aria-hidden="true">
                      {emplacement.prenomDuBikeSitter.charAt(0)}
                    </span>
                    <div>
                      <h4>{emplacement.prenomDuBikeSitter}</h4>
                      {/* Ni note, ni moyenne, ni nombre d'avis : la seule
                          mention possible est un fait, et il est vrai de tout
                          emplacement publié (règle 2). */}
                      <p className="pastille pastille--verifie">
                        Identité vérifiée
                      </p>
                    </div>
                  </div>

                  <dl className="details details--serres">
                    <div>
                      <dt>Emplacement</dt>
                      <dd>{emplacement.type}</dd>
                    </div>
                    <div>
                      <dt>Fermeture</dt>
                      <dd>{VERROUILLAGES[emplacement.verrouillage]}</dd>
                    </div>
                    <div>
                      <dt>Intempéries</dt>
                      <dd>{INTEMPERIES[emplacement.intemperie]}</dd>
                    </div>
                    <div>
                      <dt>Capacité</dt>
                      <dd>
                        {emplacement.capacite === 1
                          ? '1 vélo'
                          : `${emplacement.capacite} vélos`}
                      </dd>
                    </div>
                    <div>
                      <dt>Zone</dt>
                      <dd>{emplacement.quartier}</dd>
                    </div>
                  </dl>

                  <Link
                    href={`/emplacements/${emplacement.reference}`}
                    className="bouton bouton--discret bouton--large"
                  >
                    Voir l’emplacement
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

/* --- 7. La confiance --------------------------------------------------------- */

const GARANTIES = [
  {
    pictogramme: 'identite' as const,
    titre: 'Une identité vérifiée par une personne',
    texte:
      'Pièce d’identité, adresse e-mail et téléphone sont vérifiés par une personne de l’association avant toute publication.',
  },
  {
    pictogramme: 'carte' as const,
    titre: 'Une adresse qui reste confidentielle',
    texte:
      'Jusqu’à l’acceptation d’une demande, seule une zone d’environ cinq cents mètres est visible. L’adresse n’apparaît ni sur la fiche ni dans les photos.',
  },
  {
    pictogramme: 'code' as const,
    titre: 'Un code pour chaque remise',
    texte:
      'La personne qui remet le vélo communique le code, celle qui le reçoit le saisit. Il se dicte facilement, fonctionne même sans réseau et reste valable six heures.',
  },
  {
    pictogramme: 'journal' as const,
    titre: 'Une garde qui laisse une trace',
    texte:
      'Chaque dépôt et chaque reprise sont datés. Le cycliste et le bike sitter suivent le même stationnement, et chaque étape est confirmée par les deux.',
  },
];

function Confiance() {
  return (
    <section className="section">
      <div className="section__interieur">
        <div className="rassurance">
          <div className="rassurance__entete">
            <div>
              <p className="surtitre">La confiance, dans les deux sens</p>
              <h2>Accueillir et confier en toute sérénité</h2>
              <p className="rassurance__chapeau">
                Le cycliste confie un vélo qui compte pour lui ; le bike sitter
                ouvre sa porte. C’est pourquoi les vérifications s’appliquent à
                tous les membres, des deux côtés.
              </p>
            </div>

            <Link href="/questions-frequentes" className="bouton bouton--clair">
              Les questions qu’on nous pose
            </Link>
          </div>

          <ul className="rassurance__points">
            {GARANTIES.map((garantie, rang) => (
              <li key={garantie.titre}>
                <span className="rassurance__medaillon" aria-hidden="true">
                  <IconeCaracteristique pictogramme={garantie.pictogramme} />
                </span>
                <span className="rassurance__rang" aria-hidden="true">
                  {String(rang + 1).padStart(2, '0')}
                </span>
                <h3>{garantie.titre}</h3>
                <p>{garantie.texte}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* --- 8. Les témoignages ------------------------------------------------------ */

function Temoignages({ avis }: { avis: AvisDuReseau[] }) {
  return (
    <section className="section section--claire">
      <div className="section__interieur">
        <div className="entete-de-section entete-de-section--centree apparait">
          <p className="surtitre">Ce qu’en disent les cyclistes</p>
          <h2 className="titre-section titre-section--large">
            Leurs mots, après chaque stationnement.
          </h2>
          <p className="chapeau">
            Après avoir repris leur vélo, les cyclistes peuvent partager
            quelques mots sur leur expérience. Nous les publions tels qu’ils ont
            été écrits.
          </p>
        </div>

        {avis.length === 0 ? (
          <div className="carte carte--aeree centre apparait">
            <p className="discret">
              Les premiers récits apparaîtront ici, après les premiers
              stationnements.
            </p>
          </div>
        ) : (
          <ul className="grille grille--deux cartes-nues">
            {avis.map((temoignage) => (
              <li key={temoignage.id}>
                <figure className="carte carte--aeree temoignage apparait">
                  <blockquote>{temoignage.corps}</blockquote>
                  <figcaption>
                    <span className="emplacement__initiale" aria-hidden="true">
                      {temoignage.prenomDeLAuteur.charAt(0)}
                    </span>
                    <span>
                      <strong>{temoignage.prenomDeLAuteur}</strong>
                      <span className="discret">
                        {' '}
                        · {typeVeloDansUnePhrase(temoignage.typeVelo)} ·{' '}
                        {temoignage.quartier}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* --- 9. Les vélos acceptés --------------------------------------------------- */

function LesVelos() {
  return (
    <section className="section">
      <div className="section__interieur section__interieur--etroit">
        <div className="entete-de-section entete-de-section--centree apparait">
          <p className="surtitre">Les vélos</p>
          <h2 className="titre-section titre-section--large">
            Tous, ou presque.
          </h2>
          <p className="chapeau">
            Chaque bike sitter indique les vélos qu’il peut accueillir. Cargo et
            longtail sont distingués, car ils ne demandent pas la même place :
            vous le savez avant de vous déplacer.
          </p>
        </div>

        <ul className="jetons jetons--centres apparait">
          {TYPES_VELO.map((velo) => (
            <li key={velo} className="pastille pastille--neutre">
              {velo}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --- 10. Rejoindre ----------------------------------------------------------- */

function Rejoindre() {
  return (
    <Appel
      surtitre="Rejoindre le réseau"
      titre="Votre vélo mérite mieux qu’un poteau."
      chapeau={
        <>
          Bike Sitters est une {ASSOCIATION.forme} bruxelloise. Le service est
          entièrement gratuit ; ses frais de fonctionnement sont couverts par
          des dons et des partenariats.
        </>
      }
      actions={
        <>
          <Link href="/emplacements" className="bouton bouton--principal">
            Trouver un emplacement
          </Link>
          <Link
            href="/proposer-un-emplacement"
            className="bouton bouton--discret"
          >
            Accueillir un vélo
          </Link>
        </>
      }
      note={
        <>
          Pendant son lancement, le réseau s’ouvre sur invitation.{' '}
          <Link href="/liste-attente" className="lien">
            Dites-nous où vous habitez
          </Link>{' '}
          pour être prévenu de l’ouverture de votre quartier.
        </>
      }
    />
  );
}
