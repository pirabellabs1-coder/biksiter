/**
 * L'en-tête d'une page de l'espace.
 *
 * Toujours la même forme, sur toutes les pages : surtitre, titre, une phrase,
 * et les actions à droite. C'est ce qui fait qu'on se repère sans lire — dans
 * une application, savoir où l'on est doit coûter un coup d'œil, pas une
 * lecture.
 */
export default function EnteteDePage({
  surtitre,
  titre,
  phrase,
  actions,
}: {
  surtitre: string;
  titre: string;
  phrase?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="entete-de-page">
      <div className="entete-de-page__propos">
        <p className="surtitre">{surtitre}</p>
        <h1 className="entete-de-page__titre">{titre}</h1>
        {phrase ? <p className="discret">{phrase}</p> : null}
      </div>
      {actions ? <div className="entete-de-page__actions">{actions}</div> : null}
    </header>
  );
}
