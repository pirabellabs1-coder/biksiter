import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone, type NomDIcone } from '@/components/app/icone';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Le journal du réseau Bike Sitters à Bruxelles : vie du réseau, conseils et portraits, bientôt en ligne.',
};

/**
 * Le journal du réseau.
 *
 * Aucun billet n'est encore publié. La page le dit, présente les rubriques et
 * les premiers sujets en préparation, et propose d'être prévenu : afficher des
 * articles datés, signés et qu'on ne peut pas ouvrir ferait croire à un
 * contenu qui n'existe pas.
 */

const RUBRIQUES: readonly {
  cle: string;
  libelle: string;
  icone: NomDIcone;
  texte: string;
}[] = [
  {
    cle: 'vie-du-reseau',
    libelle: 'Vie du réseau',
    icone: 'utilisateurs',
    texte: 'Les quartiers qui ouvrent, les nouveautés, ce que les membres nous disent.',
  },
  {
    cle: 'conseils',
    libelle: 'Conseils',
    icone: 'cadenas',
    texte: 'Préparer une garde, photographier son vélo, choisir un antivol.',
  },
  {
    cle: 'portraits',
    libelle: 'Portraits',
    icone: 'profil',
    texte: 'Des cyclistes et des bike sitters racontent leurs gardes.',
  },
  {
    cle: 'bruxelles-a-velo',
    libelle: 'Bruxelles à vélo',
    icone: 'velo',
    texte: 'Itinéraires, saisons et bonnes adresses pour rouler en ville.',
  },
];

const SUJETS: readonly { titre: string; chapeau: string; rubrique: string }[] = [
  {
    titre: 'Pourquoi un réseau d’entraide pour garder les vélos.',
    chapeau: 'Ce que Bike Sitters construit, et comment le projet fonctionne.',
    rubrique: 'Vie du réseau',
  },
  {
    titre: 'Préparer son vélo avant une garde.',
    chapeau: 'Quelques minutes de contrôle et des photos bien prises.',
    rubrique: 'Conseils',
  },
  {
    titre: 'Une première garde, racontée par un bike sitter.',
    chapeau: 'Recevoir un vélo chez soi, du premier message à la reprise.',
    rubrique: 'Portraits',
  },
];

export default function Blog() {
  return (
    <>
      <span id="contenu" tabIndex={-1} />

      <main className="page-blog">
        <header className="blog-tete">
          <div className="blog-tete-int">
            <p className="parcours-pastille">
              <span>Le journal</span>
            </p>
            <h1>Le journal du réseau, bientôt en ligne.</h1>
            <p className="blog-intro">
              Nous préparons une chronique du réseau, des conseils pratiques et
              des portraits de cyclistes et de bike sitters. Les premiers
              billets paraîtront ici.
            </p>
          </div>
        </header>

        <section className="blog-grille" aria-labelledby="titre-rubriques">
          <h2 id="titre-rubriques" className="lecteur">
            Les rubriques
          </h2>
          {RUBRIQUES.map((rubrique) => (
            <article key={rubrique.cle} id={rubrique.cle} className="blog-carte">
              <div className="blog-carte-int">
                <span className="blog-rubrique-icone" aria-hidden="true">
                  <Icone nom={rubrique.icone} taille={22} strokeWidth={2} />
                </span>
                <h3>{rubrique.libelle}</h3>
                <p>{rubrique.texte}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="blog-sujets" aria-labelledby="titre-sujets">
          <h2 id="titre-sujets">Les premiers sujets en préparation</h2>
          <ul>
            {SUJETS.map((sujet) => (
              <li key={sujet.titre}>
                <span className="blog-etiquette">{sujet.rubrique}</span>
                <strong>{sujet.titre}</strong>
                <span>{sujet.chapeau}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="blog-lettre">
          <div className="blog-lettre-int">
            <div>
              <span className="parcours-pastille">
                <span>La lettre</span>
              </span>
              <h2>Un mot dès la parution.</h2>
              <p>
                Écrivez-nous : nous vous prévenons dès que les premiers
                billets sont en ligne.
              </p>
            </div>
            <Link href="/contact" className="primary">
              Me prévenir
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
