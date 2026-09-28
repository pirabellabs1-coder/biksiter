import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Actualité, conseils et portraits du réseau Bike Sitters à Bruxelles.',
};

/**
 * Le blog du réseau.
 *
 * Pendant la bêta, quelques billets rédigés par l'équipe pour poser les
 * intentions et donner à voir ce qui se passe. Les billets sont posés en dur
 * ici : quand un vrai module éditorial sera branché, ils viendront de là.
 */

const RUBRIQUES = [
  { cle: 'vie-du-reseau', libelle: 'Vie du réseau', pastille: '✦' },
  { cle: 'conseils', libelle: 'Conseils', pastille: '✿' },
  { cle: 'portraits', libelle: 'Portraits', pastille: '☺' },
  { cle: 'bruxelles-a-velo', libelle: 'Bruxelles à vélo', pastille: '⌂' },
] as const;

type Rubrique = (typeof RUBRIQUES)[number]['cle'];

const ARTICLES: readonly {
  slug: string;
  titre: string;
  chapeau: string;
  rubrique: Rubrique;
  auteur: string;
  duree: string;
  publieLe: string;
  couleur: string;
  glyphe: string;
}[] = [
  {
    slug: 'manifeste',
    titre:
      'Pourquoi un réseau plutôt qu’une application de plus.',
    chapeau:
      'Ce qu’on construit et ce qu’on refuse de construire. Cinq minutes de lecture pour comprendre la logique du projet.',
    rubrique: 'vie-du-reseau',
    auteur: 'L’équipe',
    duree: '5 min',
    publieLe: '2026-09-14',
    couleur: 'linear-gradient(160deg,#087333,#17a453)',
    glyphe: 'Bs',
  },
  {
    slug: 'premiere-garde-a-flagey',
    titre: 'Une première garde place Flagey.',
    chapeau:
      'Manoelle a accueilli le vélo de Yanis pendant un rendez-vous. Ce qu’on apprend d’une garde de deux heures.',
    rubrique: 'portraits',
    auteur: 'Manoelle D.',
    duree: '3 min',
    publieLe: '2026-09-07',
    couleur: 'linear-gradient(160deg,#c85f4a,#e8614d)',
    glyphe: 'Fl',
  },
  {
    slug: 'preparer-son-velo',
    titre: 'Préparer son vélo avant une garde.',
    chapeau:
      'Cinq minutes de contrôle, une photo bien prise, un cadenas de rechange. Rien de compliqué, tout ce qui protège.',
    rubrique: 'conseils',
    auteur: 'L’équipe',
    duree: '4 min',
    publieLe: '2026-08-30',
    couleur: 'linear-gradient(160deg,#c97a12,#e2a04d)',
    glyphe: 'Vc',
  },
  {
    slug: 'dix-quartiers',
    titre: 'Dix quartiers, dix accueils différents.',
    chapeau:
      'De Saint-Josse à Uccle, ce que la géographie de Bruxelles change à la façon d’accueillir un vélo.',
    rubrique: 'vie-du-reseau',
    auteur: 'L’équipe',
    duree: '6 min',
    publieLe: '2026-08-16',
    couleur: 'linear-gradient(160deg,#1688ed,#3a68a4)',
    glyphe: 'Bx',
  },
  {
    slug: 'cadenas',
    titre: 'Le bon cadenas ne suffit jamais tout seul.',
    chapeau:
      'Pourquoi la sécurité d’un vélo tient d’abord au lieu, au voisinage et au regard des autres — pas à l’acier du U.',
    rubrique: 'conseils',
    auteur: 'L’équipe',
    duree: '3 min',
    publieLe: '2026-08-02',
    couleur: 'linear-gradient(160deg,#4d8d6c,#6ba884)',
    glyphe: 'Ca',
  },
  {
    slug: 'itineraire-canal',
    titre: 'Suivre le canal de Bruxelles, sans stress.',
    chapeau:
      'Un itinéraire familial, quatorze kilomètres, huit relais Bike Sitters possibles. À faire un dimanche matin.',
    rubrique: 'bruxelles-a-velo',
    auteur: 'L’équipe',
    duree: '4 min',
    publieLe: '2026-07-18',
    couleur: 'linear-gradient(160deg,#315e79,#4884a0)',
    glyphe: 'Ca',
  },
];

function libelleDeRubrique(cle: Rubrique): string {
  return RUBRIQUES.find((r) => r.cle === cle)?.libelle ?? cle;
}

function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.split('-').map(Number);
  const nomMois = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ][(mois ?? 1) - 1];
  return `${jour} ${nomMois} ${annee}`;
}

export default function Blog() {
  const [aLaUne, ...suite] = ARTICLES;
  if (!aLaUne) return null;

  return (
    <>
      <span id="contenu" tabIndex={-1} />

      <main className="page-blog">
        <header className="blog-tete">
          <div className="blog-tete-int">
            <p className="parcours-pastille">
              <span>Le journal</span>
            </p>
            <h1>Ce qu’on écrit, en attendant que vous écriviez aussi.</h1>
            <p className="blog-intro">
              Une chronique du réseau, des conseils pratiques, des portraits de
              cyclistes et de bike sitters. Un billet par semaine, rédigé par
              l’équipe — jusqu’à ce que la parole passe aux membres.
            </p>
            <nav aria-label="Rubriques du blog" className="blog-rubriques">
              {RUBRIQUES.map((rubrique) => (
                <span key={rubrique.cle} className="blog-rubrique">
                  <span aria-hidden="true">{rubrique.pastille}</span>
                  {rubrique.libelle}
                </span>
              ))}
            </nav>
          </div>
        </header>

        <section className="blog-alaune" aria-labelledby="alaune-titre">
          <article className="blog-alaune-carte">
            <div
              className="blog-alaune-visuel"
              style={{ background: aLaUne.couleur }}
              aria-hidden="true"
            >
              <span>{aLaUne.glyphe}</span>
            </div>
            <div className="blog-alaune-texte">
              <span className="blog-etiquette">
                À la une · {libelleDeRubrique(aLaUne.rubrique)}
              </span>
              <h2 id="alaune-titre">{aLaUne.titre}</h2>
              <p>{aLaUne.chapeau}</p>
              <div className="blog-meta">
                <span>{aLaUne.auteur}</span>
                <span aria-hidden="true">·</span>
                <span>{formaterDate(aLaUne.publieLe)}</span>
                <span aria-hidden="true">·</span>
                <span>{aLaUne.duree} de lecture</span>
              </div>
              <span className="blog-lire">Lire l’article →</span>
            </div>
          </article>
        </section>

        <section className="blog-grille" aria-label="Tous les billets">
          {suite.map((article) => (
            <article key={article.slug} className="blog-carte">
              <div
                className="blog-carte-visuel"
                style={{ background: article.couleur }}
                aria-hidden="true"
              >
                <span>{article.glyphe}</span>
              </div>
              <div className="blog-carte-int">
                <span className="blog-etiquette">
                  {libelleDeRubrique(article.rubrique)}
                </span>
                <h3>{article.titre}</h3>
                <p>{article.chapeau}</p>
                <div className="blog-meta">
                  <span>{formaterDate(article.publieLe)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.duree}</span>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="blog-lettre">
          <div className="blog-lettre-int">
            <div>
              <span className="parcours-pastille">
                <span>La lettre</span>
              </span>
              <h2>Un billet par semaine, dans votre boîte.</h2>
              <p>
                Rien d’autre. Aucun tracker, aucune revente d’adresse, un
                désabonnement en un clic. C’est prévu pour bientôt, dès qu’une
                douzaine d’articles seront en ligne.
              </p>
            </div>
            <Link href="/contact" className="primary">
              Me prévenir du lancement
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
