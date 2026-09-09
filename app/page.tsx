import type { Metadata } from 'next';
import Link from 'next/link';

import Chiffres from '@/components/chiffres';
import ZoneApproximative from '@/components/zone-approximative';
import { baseConfiguree } from '@/lib/bd/client';
import { ASSOCIATION } from '@/lib/contenu/association';
import { derniersAvisDuReseau, type AvisDuReseau } from '@/lib/depot/avis';
import { mesuresDuReseau } from '@/lib/depot/chiffres';
import { zonesOuvertes } from '@/lib/depot/emplacements';
import { chiffresAAfficher, type MesuresDuReseau } from '@/lib/regles/chiffres';
import { TYPES_VELO, typeVeloDansUnePhrase } from '@/lib/regles/velos';

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

export default async function Accueil() {
  // La page d'accueil doit s'afficher même sans base : c'est souvent le premier
  // écran qu'on ouvre après un déploiement, et une erreur de connexion ne
  // dirait rien d'utile à qui découvre le service.
  const [mesures, avis, zones] = baseConfiguree()
    ? await Promise.all([
        mesuresDuReseau(),
        derniersAvisDuReseau(),
        zonesOuvertes(),
      ])
    : [RIEN_ENCORE, [] as AvisDuReseau[], []];

  const chiffres = chiffresAAfficher(mesures);

  return (
    <>
      <div className="accroche">
        <div>
          <h1 className="titre-page titre-page--phrase">
            Quelqu’un, près de chez vous, peut garder votre vélo cet après-midi.
          </h1>

          <p className="chapeau">
            Un bike sitter, c’est un habitant qui range votre vélo chez lui —
            un garage, une cave, une cour fermée — le temps que vous en avez
            besoin. C’est gratuit, et son identité a été vérifiée par une
            personne avant qu’il puisse accueillir quoi que ce soit.
          </p>

          <form action="/emplacements" method="get" className="recherche">
            <div className="recherche__champ">
              <label htmlFor="quartier-accueil">Où allez-vous&nbsp;?</label>
              <input
                id="quartier-accueil"
                name="quartier"
                type="search"
                placeholder="Flagey, Saint-Gilles, Gare du Midi…"
              />
            </div>
            <button type="submit" className="bouton bouton--principal">
              Voir les emplacements
            </button>
          </form>

          {/* Deux liens, pas deux boutons : la recherche est l'action de cet
              écran, et deux boutons de même poids l'auraient annulée. */}
          <p className="accroche__chemins">
            <Link href="/emplacements" className="lien">
              Je cherche un emplacement
            </Link>
            <Link href="/proposer-un-emplacement" className="lien">
              J’ai de la place chez moi
            </Link>
          </p>

          <div className="encart">
            <p>
              <strong>Le réseau ouvre quartier par quartier.</strong> On y entre
              aujourd’hui sur invitation d’un membre&nbsp;: c’est ce qui permet
              de vérifier chaque personne une par une.{' '}
              <Link href="/liste-attente" className="lien">
                Dites-nous où vous habitez
              </Link>{' '}
              — c’est ce qui nous dit où ouvrir ensuite.
            </p>
          </div>
        </div>

        {zones.length === 0 ? (
          <div className="accroche__figure--vide">
            <h2 className="titre-section">Le réseau se construit maintenant</h2>
            <p className="discret">
              Aucun emplacement n’est encore publié. Un quartier ouvre quand il
              compte assez de bike sitters pour qu’un cycliste y trouve une
              place à chaque fois — c’est pour cela qu’on commence par en
              réunir, avant d’ouvrir la recherche à tout le monde.
            </p>
            <p className="discret">
              <Link href="/proposer-un-emplacement" className="lien">
                Proposer le premier de votre rue
              </Link>
            </p>
          </div>
        ) : (
          <figure className="accroche__figure">
            <ZoneApproximative taches={zones} />
            <figcaption className="discret">
              Les quartiers ouverts, en zones approximatives. C’est aussi tout
              ce qu’un emplacement montre de lui&nbsp;: son adresse exacte
              n’apparaît qu’une fois votre demande acceptée.
            </figcaption>
          </figure>
        )}
      </div>

      {chiffres.length === 0 ? null : (
        <div className="bandeau-chiffres">
          <h2 className="visuellement-cache">Le réseau en chiffres</h2>
          <Chiffres chiffres={chiffres} />
        </div>
      )}

      <div className="page">
        <section className="bloc">
          <p className="surtitre">Pourquoi ça existe</p>
          <h2 className="titre-section">
            Il manque des places, pas de la place
          </h2>
          <p className="chapeau">
            Bruxelles ne manque pas d’endroits où ranger un vélo. Elle manque
            d’endroits où le ranger quand on n’est pas chez soi.
          </p>

          <ol className="etapes grille">
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>Un antivol tient quelques minutes</h3>
              <p className="discret">
                Le temps d’un café, ça va. Une journée entière attaché à un
                poteau, c’est autre chose — et beaucoup de gens finissent par
                laisser le vélo à la maison.
              </p>
            </li>
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>La place existe déjà</h3>
              <p className="discret">
                Derrière les façades, des garages, des caves et des cours
                fermées restent vides toute la journée. Il n’y a rien à
                construire&nbsp;: il faut juste que les deux se rencontrent.
              </p>
            </li>
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>Ce n’est pas une place de marché</h3>
              <p className="discret">
                Personne ne paie, personne n’est noté, personne n’est classé. On
                rend service à quelqu’un du quartier, et un jour quelqu’un vous
                le rend.
              </p>
            </li>
          </ol>
        </section>

        <section className="bloc alternance">
          <div className="alternance__rang">
            <div>
              <p className="surtitre">En ville, pour la journée</p>
              <h2 className="titre-section">
                Une course, un rendez-vous, un cinéma
              </h2>
              <p className="discret">
                Vous cherchez un emplacement près de là où vous allez, vous
                convenez d’une heure d’arrivée et d’une heure de retour, et le
                vélo passe l’après-midi à l’abri plutôt qu’accroché à une
                barrière.
              </p>
              <p className="discret">
                Vous voyez la zone avant de demander, jamais l’adresse. Elle
                vous est communiquée quand le bike sitter accepte — et
                seulement à vous.
              </p>
            </div>

            <div className="carte carte--aeree">
              <p className="surtitre">Un stationnement typique</p>
              <dl className="details">
                <div>
                  <dt>Créneau</dt>
                  <dd>Aujourd’hui, 9h → 18h</dd>
                </div>
                <div>
                  <dt>Emplacement</dt>
                  <dd>Cave privative, fermée à clé</dd>
                </div>
                <div>
                  <dt>Ce que vous voyez avant</dt>
                  <dd>Une zone d’environ 500 mètres</dd>
                </div>
                <div>
                  <dt>Coût</dt>
                  <dd>Gratuit</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="alternance__rang">
            <div>
              <p className="surtitre">Pour aller travailler</p>
              <h2 className="titre-section">
                Ni place au bureau, ni local à vélos
              </h2>
              <p className="discret">
                Un bike sitter proche de votre lieu de travail peut vous
                accueillir plusieurs fois, sur le même créneau. Chaque
                stationnement reste une demande à part&nbsp;: personne ne
                s’engage pour six mois sans l’avoir voulu.
              </p>
              <p className="discret">
                Et comme le compte est unique, rien ne vous empêche d’accueillir
                à votre tour, chez vous, le soir ou le week-end.
              </p>
            </div>

            <div className="carte carte--aeree">
              <p className="surtitre">Ce que ça change</p>
              <ul className="marques">
                <li>Le vélo ne dort pas dehors pendant huit heures.</li>
                <li>Vous n’avez personne à convaincre dans votre immeuble.</li>
                <li>
                  Vous connaissez quelqu’un à deux rues de votre bureau, ce qui
                  n’est pas le moins intéressant.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bloc">
          <p className="surtitre">Les vélos</p>
          <h2 className="titre-section">Tous, ou presque</h2>
          <p className="chapeau">
            Chaque bike sitter annonce ce qui passe par sa porte. Un cargo et un
            longtail sont distingués parce qu’ils n’entrent pas aux mêmes
            endroits&nbsp;— mieux vaut le savoir avant de traverser la ville.
          </p>
          <ul className="jetons">
            {TYPES_VELO.map((velo) => (
              <li key={velo} className="pastille pastille--neutre">
                {velo}
              </li>
            ))}
          </ul>
        </section>

        <section className="bloc">
          <p className="surtitre">Comment ça se passe</p>
          <h2 className="titre-section">Trois gestes, et c’est réglé</h2>

          <ol className="etapes grille">
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>Vous demandez</h3>
              <p className="discret">
                Vous choisissez un emplacement, une heure d’arrivée et une heure
                de retour. Le bike sitter accepte, ou non — il n’a rien à
                justifier.
              </p>
            </li>
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>Vous déposez</h3>
              <p className="discret">
                L’adresse vous est communiquée à l’acceptation. Sur place, vous
                lui dictez un code à quatre chiffres&nbsp;: c’est ce qui acte la
                remise du vélo.
              </p>
            </li>
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>Vous reprenez</h3>
              <p className="discret">
                Un second code, dans l’autre sens, et la garde est terminée. Le
                vélo n’a jamais changé de mains sans que les deux personnes
                soient d’accord.
              </p>
            </li>
          </ol>

          <p className="bloc__apres">
            <Link href="/fonctionnement" className="lien">
              Le déroulé complet, étape par étape
            </Link>
          </p>
        </section>

        <section className="bloc">
          <p className="surtitre">Confiance et sécurité</p>
          <h2 className="titre-section">
            Ce qui rend acceptable d’ouvrir sa porte
          </h2>

          <div className="grille grille--deux">
            <article className="carte">
              <h3>Une identité vérifiée par une personne</h3>
              <p className="discret">
                Pièce d’identité, adresse e-mail et téléphone. La vérification
                est faite à la main par un membre de l’association&nbsp;: aucun
                emplacement ne se publie avant.
              </p>
            </article>
            <article className="carte">
              <h3>Une adresse qui n’apparaît nulle part</h3>
              <p className="discret">
                Ni sur la fiche, ni dans l’adresse de la page, ni dans les
                métadonnées des photos. Avant l’acceptation, il n’existe qu’une
                zone d’environ cinq cents mètres.
              </p>
            </article>
            <article className="carte">
              <h3>Un code pour chaque remise</h3>
              <p className="discret">
                Celui qui remet le vélo détient le code, celui qui le reçoit le
                saisit. Il se dicte à voix haute, fonctionne dans une cave sans
                réseau, et expire au bout de six heures.
              </p>
            </article>
            <article className="carte">
              <h3>Des emplacements privés, jamais partagés</h3>
              <p className="discret">
                Un garage, une cave, une cour fermée. Un local à vélos
                d’immeuble n’est pas proposable&nbsp;: d’autres personnes y ont
                accès, et ce n’est plus la même promesse.
              </p>
            </article>
          </div>

          <h3 className="titre-sous-section">Ce qu’en disent les cyclistes</h3>

          {avis.length === 0 ? (
            <div className="carte">
              <p className="discret">
                Rien à afficher pour l’instant. Les avis sont écrits par les
                cyclistes après la reprise de leur vélo, et nous n’en écrivons
                aucun à leur place&nbsp;: cette place restera vide tant que
                personne n’aura raconté sa garde.
              </p>
            </div>
          ) : (
            <div className="grille grille--deux">
              {avis.map((temoignage) => (
                <figure key={temoignage.id} className="carte temoignage">
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
              ))}
            </div>
          )}
        </section>

        <section className="bloc">
          <div className="carte carte--aeree">
            <p className="surtitre">L’association</p>
            <h2 className="titre-section">
              Gratuit, et construit pour le rester
            </h2>
            <p className="discret">
              Bike Sitters est une {ASSOCIATION.forme} bruxelloise. Pas de
              commission, pas d’abonnement, pas de version payante&nbsp;: il n’y
              a rien à vendre, donc rien à optimiser contre vous. Ce qui coûte,
              c’est l’hébergement et le temps passé à vérifier les identités.
            </p>
            <div className="boutons">
              <Link href="/a-propos" className="bouton bouton--discret">
                Qui sommes-nous
              </Link>
              <Link href="/soutenir" className="bouton bouton--discret">
                Nous soutenir
              </Link>
            </div>
          </div>
        </section>

        <section className="bloc">
          <h2 className="visuellement-cache">Entrer dans le réseau</h2>
          <div className="grille grille--deux">
            <article className="carte carte--aeree">
              <h3>Je cherche un emplacement</h3>
              <p className="discret">
                Regardez ce qui est ouvert autour de votre destination.
                Envoyer une demande suppose un compte vérifié&nbsp;; regarder,
                non.
              </p>
              <div className="boutons">
                <Link href="/emplacements" className="bouton bouton--principal">
                  Voir les emplacements
                </Link>
              </div>
            </article>
            <article className="carte carte--aeree">
              <h3>J’ai de la place chez moi</h3>
              <p className="discret">
                Un garage, une cave, une cour fermée suffisent. Accueillir ne
                coûte rien et ne vous engage à rien&nbsp;: chaque demande se
                refuse sans avoir à se justifier.
              </p>
              <div className="boutons">
                <Link
                  href="/proposer-un-emplacement"
                  className="bouton bouton--principal"
                >
                  Proposer mon emplacement
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}
