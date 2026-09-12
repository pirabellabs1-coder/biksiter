/**
 * La bande qui ferme une page : une phrase, deux boutons, un dégradé qui
 * remonte vers la couleur de la marque.
 *
 * Elle ferme l'accueil, et elle ferme désormais les pages qui se lisent — celui
 * qui arrive au bas de « Comment ça marche » a répondu à sa question et se
 * demande quoi faire ensuite ; lui laisser un pied de page pour seule réponse,
 * c'est le laisser chercher.
 */
export default function Appel({
  surtitre,
  titre,
  chapeau,
  actions,
  note,
}: {
  surtitre?: string;
  titre: string;
  chapeau?: React.ReactNode;
  actions: React.ReactNode;
  note?: React.ReactNode;
}) {
  return (
    <section className="appel">
      <div className="appel__interieur apparait">
        {surtitre ? <p className="surtitre">{surtitre}</p> : null}
        <h2 className="titre-page titre-page--phrase">{titre}</h2>
        {chapeau ? <p className="chapeau">{chapeau}</p> : null}
        <div className="boutons boutons--centres">{actions}</div>
        {note ? <p className="appel__note discret">{note}</p> : null}
      </div>
    </section>
  );
}
