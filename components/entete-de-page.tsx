/**
 * L'en-tête d'une page de l'espace membre.
 *
 * Toujours la même forme : surtitre, titre, une phrase, et les actions à
 * droite. Dans une application, savoir où l'on est doit coûter un coup d'œil,
 * pas une lecture — c'est ce que cette constance achète.
 *
 * Les pages du site public ne passent pas par ici : elles s'ouvrent sur la
 * bande de l'accueil (`BandeauDePage`). L'espace n'a pas de bande, parce qu'on
 * y revient dix fois par jour et qu'une ouverture illustrée à chaque passage
 * deviendrait du bruit.
 */
export default function EnteteDePage({
  surtitre,
  titre,
  chapeau,
  actions,
}: {
  surtitre?: string;
  titre: React.ReactNode;
  chapeau?: React.ReactNode;
  /** Ce qu'on peut faire depuis l'en-tête, à droite du titre. */
  actions?: React.ReactNode;
}) {
  return (
    <header className="entete-de-page">
      <div className="entete-de-page__ligne">
        <div className="entete-de-page__propos">
          {surtitre ? <p className="surtitre">{surtitre}</p> : null}
          <h1 className="titre-page">{titre}</h1>
          {chapeau ? <p className="chapeau">{chapeau}</p> : null}
        </div>
        {actions ? (
          <div className="entete-de-page__actions">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
