import Link from 'next/link';

import Chiffres from '@/components/chiffres';
import { CHIFFRES_DU_RESEAU } from '@/lib/contenu/chiffres';

export default function Accueil() {
  return (
    <>
      <div className="accroche">
        <div>
          <h1 className="titre-page">
            Votre vélo passe la journée à l’abri, chez un bike sitter
          </h1>

          <p className="chapeau">
            Un bike sitter, c’est un habitant qui garde votre vélo chez lui,
            dans un emplacement privé et fermé — un garage, une cave, une cour —
            près de là où vous allez. C’est gratuit, et chaque membre est
            recommandé par un autre, puis vérifié par une personne.
          </p>

          <div className="encart">
            <p>
              <strong>Le réseau ouvre quartier par quartier.</strong> On y entre
              aujourd’hui sur invitation d’un membre. Dites-nous où vous
              habitez : nous ouvrons un quartier dès qu’il compte assez de bike
              sitters.
            </p>
          </div>

          <form action="/emplacements" method="get" className="recherche">
            <div className="recherche__champ">
              <label htmlFor="quartier-accueil">Votre quartier</label>
              <input
                id="quartier-accueil"
                name="quartier"
                type="search"
                placeholder="Ixelles, Saint-Gilles, Schaerbeek…"
              />
            </div>
            <button type="submit" className="bouton bouton--principal">
              Voir les emplacements
            </button>
          </form>

          <p className="discret">
            <Link href="/inscription" className="lien">
              Créer mon compte
            </Link>{' '}
            — l’inscription demande une invitation.{' '}
            <Link href="/liste-attente" className="lien">
              Je n’en ai pas
            </Link>
          </p>
        </div>

        <div className="carte carte--aeree">
          <h2 className="titre-section">Un réseau fermé, par choix</h2>
          <p className="discret">
            Les emplacements ne sont visibles en détail qu’une fois connecté.
            Personne ne peut parcourir la liste des habitants qui accueillent
            des vélos : c’est ce qui protège leur adresse, et ce qui rend le
            service acceptable pour eux.
          </p>
          <p className="discret">
            Chaque membre est recommandé par un autre, puis vérifié par nos
            soins. L’adresse exacte d’un emplacement n’est communiquée qu’une
            fois la demande acceptée.
          </p>
        </div>
      </div>

      <div className="bandeau-chiffres">
        <h2 className="visuellement-cache">Le réseau en chiffres</h2>
        <Chiffres chiffres={CHIFFRES_DU_RESEAU} />
      </div>

      <div className="page">
        <section className="bloc">
          <p className="surtitre">Le principe</p>
          <h2 className="titre-section">Trois gestes, et c’est réglé</h2>
          <p className="chapeau">
            Le service tient sur une idée simple : il y a déjà, derrière les
            façades, toute la place de stationnement dont les cyclistes ont
            besoin.
          </p>

          <ol className="etapes grille">
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>Ouvrez la carte</h3>
              <p className="discret">
                Cherchez votre destination. Les emplacements autour
                apparaissent, en zone approximative.
              </p>
            </li>
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>Écrivez au bike sitter</h3>
              <p className="discret">
                Vous convenez ensemble d’une heure d’arrivée et d’une heure de
                retour. Il accepte, ou non.
              </p>
            </li>
            <li className="carte">
              <span className="etape__numero" aria-hidden="true" />
              <h3>Déposez votre vélo</h3>
              <p className="discret">
                Il reste à l’abri, chez quelqu’un, le temps de votre journée.
              </p>
            </li>
          </ol>
        </section>

        <section className="bloc">
          <p className="surtitre">Pour qui</p>
          <h2 className="titre-section">Deux façons d’utiliser le service</h2>

          <div className="grille grille--deux">
            <article className="carte">
              <h3>En ville, pour la journée</h3>
              <p className="discret">
                Une course, un rendez-vous, un cinéma. Vous ne laissez plus
                votre vélo attaché dehors pendant des heures.
              </p>
            </article>
            <article className="carte">
              <h3>Pour aller travailler</h3>
              <p className="discret">
                Ni place au bureau, ni local à vélos. Un bike sitter proche de
                votre lieu de travail peut vous accueillir tous les jours, sur
                le même créneau.
              </p>
            </article>
          </div>
        </section>

        <section className="bloc">
          <p className="surtitre">Ce qu’en disent les bike sitters</p>
          <h2 className="titre-section">Ils ouvrent déjà leur porte</h2>

          <div className="grille grille--deux">
            <figure className="carte temoignage">
              <blockquote>
                Mon garage est vide toute la journée. Autant qu’il serve à
                quelqu’un plutôt qu’à rien.
              </blockquote>
              <figcaption>
                <span className="emplacement__initiale" aria-hidden="true">
                  T
                </span>
                <span>
                  <strong>Thomas</strong>
                  <span className="discret"> bike sitter à Bruxelles</span>
                </span>
              </figcaption>
            </figure>

            <figure className="carte temoignage">
              <blockquote>
                On a gardé le vélo de Yanis pendant ses vacances. Il est reparti
                avec, et on s’est revus depuis.
              </blockquote>
              <figcaption>
                <span className="emplacement__initiale" aria-hidden="true">
                  M
                </span>
                <span>
                  <strong>Manoelle</strong>
                  <span className="discret"> bike sitter à Ixelles</span>
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bloc">
          <div className="carte carte--aeree">
            <p className="surtitre">Proposer un emplacement</p>
            <h2 className="titre-section">
              Votre garage vide peut sauver un vélo
            </h2>
            <p className="discret">
              Un garage, une cave, une cour fermée suffisent. Accueillir ne
              coûte rien, ne vous engage à rien, et votre adresse reste masquée
              tant que vous n’avez pas accepté une demande.
            </p>
            <p className="discret">
              Chaque membre du réseau est recommandé par un autre, puis vérifié :
              pièce d’identité, e-mail et téléphone. Vous savez à qui vous ouvrez
              votre porte, comme il sait à qui il confie son vélo.
            </p>
            <div className="boutons">
              <Link
                href="/proposer-un-emplacement"
                className="bouton bouton--principal"
              >
                Proposer mon emplacement
              </Link>
              <Link href="/fonctionnement" className="bouton bouton--discret">
                Comment ça se passe
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
