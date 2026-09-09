import type { Metadata } from 'next';
import Link from 'next/link';

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
        emplacementsPublies(),
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
            jours. C’est gratuit, et son identité a été vérifiée par une
            personne avant qu’il puisse accueillir quoi que ce soit.
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
              Identité vérifiée à la main
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
            Les emplacements s’affichent en zone approximative. L’adresse exacte
            vous est communiquée quand le bike sitter accepte — pas avant.
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
      'Vous cherchez un emplacement près de là où vous allez, vous convenez d’une heure d’arrivée et d’une heure de retour, et le vélo passe la journée derrière une porte qui se ferme.',
  },
  {
    scene: 'garder' as const,
    titre: 'Garder celui d’un autre',
    texte:
      'Un garage, une cave, une cour fermée suffisent. Accueillir ne coûte rien et ne vous engage à rien : chaque demande se refuse sans avoir à se justifier.',
  },
  {
    scene: 'ensemble' as const,
    titre: 'Faire vivre le réseau',
    texte:
      'Le compte est unique : on est cycliste et bike sitter selon le moment. Chaque garde ajoute une porte de plus à un quartier, et c’est ce qui le fait grandir.',
  },
];

function TroisFacons() {
  return (
    <section className="section section--claire">
      <div className="section__interieur">
        <div className="entete-de-section entete-de-section--centree apparait">
          <p className="surtitre">Un réseau, pas une place de marché</p>
          <h2 className="titre-section titre-section--large">
            Personne ne paie, personne n’est classé.
          </h2>
          <p className="chapeau">
            Il n’y a rien à vendre ici, donc rien à optimiser contre vous. Trois
            façons d’en être, et la même personne les tient souvent toutes les
            trois.
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
      'Sur invitation d’un membre pendant le démarrage. Votre identité est vérifiée par une personne : c’est ce qui rend acceptable d’ouvrir sa porte.',
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
      'Vous proposez une heure d’arrivée et une heure de retour. Le bike sitter accepte, ou non — il n’a rien à justifier.',
  },
  {
    pictogramme: 'code' as const,
    titre: 'Vous déposez, puis vous reprenez',
    texte:
      'L’adresse arrive à l’acceptation. Sur place, un code à quatre chiffres acte la remise, et un second acte le retour.',
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
              Aucun emplacement n’est encore publié. Un quartier ouvre quand il
              compte assez de bike sitters pour qu’un cycliste y trouve une
              place à chaque fois — ouvrir plus tôt reviendrait à promettre une
              place qui n’existe pas.
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
            sont réels, et montrés dans l’ordre où ils ont été publiés&nbsp;: il
            n’existe ici aucun classement qui permettrait d’en préférer un.
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
              Une figure, pas une carte&nbsp;: chaque tache situe un quartier,
              jamais une maison.
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
              — c’est ce qui nous dit où ouvrir ensuite.
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
      'Pièce d’identité, adresse e-mail et téléphone. La vérification est faite à la main par un membre de l’association : aucun emplacement ne se publie avant.',
  },
  {
    pictogramme: 'carte' as const,
    titre: 'Une adresse qui n’apparaît nulle part',
    texte:
      'Ni sur la fiche, ni dans l’adresse de la page, ni dans les métadonnées des photos. Avant l’acceptation, il n’existe qu’une zone d’environ cinq cents mètres.',
  },
  {
    pictogramme: 'code' as const,
    titre: 'Un code pour chaque remise',
    texte:
      'Celui qui remet le vélo détient le code, celui qui le reçoit le saisit. Il se dicte à voix haute, fonctionne dans une cave sans réseau, et expire au bout de six heures.',
  },
  {
    pictogramme: 'journal' as const,
    titre: 'Une garde qui laisse une trace',
    texte:
      'Chaque dépôt et chaque reprise sont datés. Les deux personnes voient la même chose au même moment, et rien ne change d’état sans que les deux soient d’accord.',
  },
];

function Confiance() {
  return (
    <section className="section">
      <div className="section__interieur">
        <div className="deux-colonnes deux-colonnes--collante">
          <div className="apparait">
            <div className="entete-de-section">
              <p className="surtitre">La confiance, dans les deux sens</p>
              <h2 className="titre-section titre-section--large">
                Ce qui rend acceptable d’ouvrir sa porte.
              </h2>
              <p className="chapeau">
                Un cycliste confie un objet qui compte. Un bike sitter laisse
                entrer quelqu’un chez lui. Les deux prennent un risque, et c’est
                pour cela que rien n’est vérifié d’un seul côté.
              </p>
            </div>

            <figure className="figure-illustree">
              <Illustration scene="velo-a-labri" />
            </figure>
          </div>

          <ul className="garanties">
            {GARANTIES.map((garantie) => (
              <li key={garantie.titre} className="garantie apparait">
                <span className="garantie__jeton">
                  <IconeCaracteristique pictogramme={garantie.pictogramme} />
                </span>
                <div>
                  <h3>{garantie.titre}</h3>
                  <p className="discret">{garantie.texte}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="boutons boutons--centres apparait">
          <Link href="/questions-frequentes" className="bouton bouton--discret">
            Les questions qu’on nous pose
          </Link>
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
            Des récits, pas des notes.
          </h2>
          <p className="chapeau">
            Il n’y a ni étoiles, ni moyenne, ni classement — la note appartient
            à la personne. On lit ce que les cyclistes ont écrit après avoir
            repris leur vélo, dans l’ordre où ils l’ont écrit.
          </p>
        </div>

        {avis.length === 0 ? (
          <div className="carte carte--aeree centre apparait">
            <p className="discret">
              Rien à afficher pour l’instant. Les avis sont écrits par les
              cyclistes après la reprise de leur vélo, et nous n’en écrivons
              aucun à leur place&nbsp;: cette place restera vide tant que
              personne n’aura raconté sa garde.
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
            Chaque bike sitter annonce ce qui passe par sa porte. Un cargo et un
            longtail sont distingués parce qu’ils n’entrent pas aux mêmes
            endroits — mieux vaut le savoir avant de traverser la ville.
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
    <section className="appel">
      <div className="appel__interieur apparait">
        <p className="surtitre">Rejoindre le réseau</p>
        <h2 className="titre-page titre-page--phrase">
          Votre vélo mérite mieux qu’un poteau.
        </h2>
        <p className="chapeau">
          Bike Sitters est une {ASSOCIATION.forme} bruxelloise. Pas de
          commission, pas d’abonnement, pas de version payante&nbsp;: ce qui
          coûte, c’est l’hébergement et le temps passé à vérifier les identités.
        </p>

        <div className="boutons boutons--centres">
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

        <p className="appel__note discret">
          Le réseau est ouvert sur invitation pendant son démarrage.{' '}
          <Link href="/liste-attente" className="lien">
            Dites-nous où vous habitez
          </Link>{' '}
          si vous n’en avez pas.
        </p>
      </div>
    </section>
  );
}
