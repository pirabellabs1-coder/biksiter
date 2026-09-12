import Link from 'next/link';

import Illustration, { type Scene } from '@/components/illustration';

/**
 * L'ouverture d'une page du site : la même bande que l'accueil, en plus court.
 *
 * Les pages intérieures s'ouvraient sur un titre posé au milieu d'un fond gris,
 * dans une colonne étroite — une page de document, pas une page du même site
 * que l'accueil. Elles reprennent désormais sa construction : sur toute la
 * largeur, le fond d'ouverture de l'accueil (la couleur de la marque, très
 * diluée), le propos à gauche, un dessin à droite. On sait qu'on n'a pas
 * quitté le site en passant d'une page à l'autre.
 *
 * Le dessin est facultatif. Une page de conditions générales n'a rien à
 * illustrer, et un dessin qui ne dit rien de la page serait de la décoration.
 */
export default function BandeauDePage({
  surtitre,
  titre,
  chapeau,
  retour,
  actions,
  scene,
  children,
}: {
  surtitre?: string;
  titre: React.ReactNode;
  chapeau?: React.ReactNode;
  /** Le chemin d'où l'on vient, quand la page est un détour. */
  retour?: { href: string; libelle: string };
  /** Les boutons qui suivent le chapeau. */
  actions?: React.ReactNode;
  scene?: Scene;
  /** Ce qui se lit sous les boutons — un rappel, un avertissement. */
  children?: React.ReactNode;
}) {
  return (
    <section className={scene ? 'bandeau' : 'bandeau bandeau--sans-dessin'}>
      <div className="bandeau__interieur">
        <div className="bandeau__propos">
          {retour ? (
            <Link href={retour.href} className="lien-retour">
              <span aria-hidden="true">←</span> {retour.libelle}
            </Link>
          ) : null}
          {surtitre ? <p className="surtitre">{surtitre}</p> : null}
          <h1 className="titre-page titre-page--phrase">{titre}</h1>
          {chapeau ? <p className="chapeau">{chapeau}</p> : null}
          {actions ? <div className="boutons">{actions}</div> : null}
          {children}
        </div>

        {scene ? (
          <div className="bandeau__scene">
            <Illustration scene={scene} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
