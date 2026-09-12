import Link from 'next/link';

import Illustration, { type Scene } from '@/components/illustration';

/**
 * La mise en page des écrans qui demandent quelque chose.
 *
 * S'inscrire, se connecter, entrer par invitation, écrire à un bike sitter :
 * ce sont des écrans où l'on remplit, pas des écrans où l'on lit. Ils prennent
 * la bande d'ouverture de l'accueil, sur toute la largeur, et le formulaire y
 * tient la place du dessin — c'est lui qu'on est venu chercher. Le propos
 * reste à gauche, lisible pendant qu'on remplit, au lieu d'être poussé hors de
 * l'écran au-dessus d'une colonne étroite.
 */
export default function PageDeFormulaire({
  surtitre,
  titre,
  chapeau,
  retour,
  propos,
  scene,
  collant = true,
  children,
  apres,
}: {
  surtitre?: string;
  titre: string;
  chapeau?: React.ReactNode;
  retour?: { href: string; libelle: string };
  /** Ce qui accompagne le formulaire dans la colonne de gauche. */
  propos?: React.ReactNode;
  /** Un dessin sous le propos, sur écran large seulement. */
  scene?: Scene;
  /**
   * Le propos reste à l'écran pendant qu'on remplit. À désactiver quand il est
   * lui-même plus haut que la fenêtre : un élément collant plus grand que
   * l'écran garde son bas coupé pendant tout le défilement, et ce qu'on y a
   * écrit n'apparaît qu'une fois le formulaire rempli.
   */
  collant?: boolean;
  children: React.ReactNode;
  /** Ce qui se lit après avoir rempli — une note, un autre chemin. */
  apres?: React.ReactNode;
}) {
  return (
    <section className="page-formulaire">
      <div className="page-formulaire__interieur">
        <div
          className={
            collant
              ? 'page-formulaire__propos page-formulaire__propos--collant'
              : 'page-formulaire__propos'
          }
        >
          {retour ? (
            <Link href={retour.href} className="lien-retour">
              <span aria-hidden="true">←</span> {retour.libelle}
            </Link>
          ) : null}
          {surtitre ? <p className="surtitre">{surtitre}</p> : null}
          <h1 className="titre-page titre-page--phrase">{titre}</h1>
          {chapeau ? <p className="chapeau">{chapeau}</p> : null}
          {propos}
          {scene ? (
            <div className="page-formulaire__scene">
              <Illustration scene={scene} />
            </div>
          ) : null}
        </div>

        <div className="page-formulaire__corps">
          <div className="panneau">
            <div className="panneau__corps">{children}</div>
          </div>
          {apres ? <div className="page-formulaire__apres">{apres}</div> : null}
        </div>
      </div>
    </section>
  );
}
