import Illustration, { type Scene } from '@/components/illustration';

/**
 * Une section qui se lit en deux colonnes : de quoi on parle à gauche, le
 * détail à droite.
 *
 * C'est la construction de la presse et des bons rapports annuels, et c'est
 * celle de l'accueil. Le titre reste accroché en haut de l'écran pendant qu'on
 * lit sa colonne : on sait toujours dans quelle partie on se trouve, sans
 * remonter.
 *
 * Les sections alternent deux fonds, comme sur l'accueil. C'est la page qui
 * décide de l'alternance, pas la section : elle seule sait ce qui précède.
 */
export default function SectionEditoriale({
  id,
  surtitre,
  titre,
  chapeau,
  scene,
  claire = false,
  children,
}: {
  /**
   * Obligatoire : c'est lui qui nomme la section pour un lecteur d'écran, par
   * son titre. Une section sans nom n'est qu'un bloc de plus dans la liste
   * des régions de la page.
   */
  id: string;
  surtitre?: string;
  titre: string;
  chapeau?: React.ReactNode;
  /** Un petit dessin sous le titre, quand la section en mérite un. */
  scene?: Scene;
  claire?: boolean;
  children: React.ReactNode;
}) {
  const identifiantDuTitre = `${id}-titre`;

  return (
    <section
      id={id}
      className={claire ? 'section section--claire' : 'section'}
      aria-labelledby={identifiantDuTitre}
    >
      <div className="section__interieur colonnes-editoriales">
        <div className="colonnes-editoriales__titre">
          {surtitre ? <p className="surtitre">{surtitre}</p> : null}
          <h2
            id={identifiantDuTitre}
            className="titre-section titre-section--large"
          >
            {titre}
          </h2>
          {chapeau ? <p className="chapeau">{chapeau}</p> : null}
          {scene ? (
            <div className="colonnes-editoriales__scene">
              <Illustration scene={scene} />
            </div>
          ) : null}
        </div>

        <div className="colonnes-editoriales__corps">{children}</div>
      </div>
    </section>
  );
}
