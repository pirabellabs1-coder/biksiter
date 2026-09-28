import Link from 'next/link';

/**
 * Le pied de page des maquettes définitives.
 *
 * Six colonnes : la marque, le service, l'association, le côté cycliste, le
 * côté bike sitter, et l'aide en cas de problème pendant une garde.
 *
 * Les colonnes personnelles — mes gardes, mon compte, mon espace — supposent
 * un compte : un visiteur se voit proposer de se connecter ou de s'inscrire,
 * plutôt que des portes qui ne s'ouvriraient pas.
 */
export function Pied({
  membre,
}: {
  membre?: { prenom: string; nom: string } | null;
}) {
  const connecte = Boolean(membre);

  return (
    <footer className="pied">
      <div className="pied-grille">
        <div className="pied-marque">
          <Link className="brand" href="/" aria-label="Bike Sitters accueil">
            <span className="brand-mark" aria-hidden="true" />
            <span>
              <b>BIKE</b> SITTERS
            </span>
          </Link>
          <p>
            Un réseau de voisins qui gardent les vélos chez eux, le temps d’un
            rendez-vous. Association sans but lucratif.
          </p>
        </div>
        <nav aria-label="Le service">
          <h2>Le service</h2>
          <Link href="/comment-ca-marche">Comment ça marche</Link>
          <Link href="/securite">Sécurité</Link>
          {/* Un visiteur va vers les pages publiques qui en parlent : les
              écrans du compte le renverraient vers l'accueil des membres. */}
          <Link href={connecte ? '/progression/regles' : '/#points'}>
            Système de points
          </Link>
          <Link
            href={connecte ? '/devenir-bike-sitter' : '/comment-ca-marche#bike-sitter'}
          >
            Devenir Bike Sitter
          </Link>
          <Link href="/faq">Questions fréquentes</Link>
        </nav>
        <nav aria-label="L’association">
          <h2>L’association</h2>
          <Link href="/a-propos">Qui nous sommes</Link>
          <Link href={connecte ? '/regles' : '/conditions-generales'}>
            Nos règles
          </Link>
          <Link href="/contact">Nous écrire</Link>
          <Link href="/plan-du-site">Plan du site</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
        </nav>
        {connecte ? (
          <>
            <nav aria-label="Côté cycliste">
              <h2>Côté cycliste</h2>
              <Link href="/gardes">Mes gardes</Link>
              <Link href="/profil/velos">Mon vélo</Link>
              <Link href="/favoris">Bike Sitters enregistrés</Link>
              <Link href="/profil">Mon compte</Link>
            </nav>
            <nav aria-label="Côté Bike Sitter">
              <h2>Côté Bike Sitter</h2>
              <Link href="/devenir-bike-sitter">Devenir Bike Sitter</Link>
              <Link href="/mon-espace">Mon espace</Link>
              <Link href="/progression">Progression et points</Link>
              <Link href="/catalogue">Catalogue de récompenses</Link>
            </nav>
          </>
        ) : (
          <nav aria-label="Votre espace">
            <h2>Votre espace</h2>
            <Link href="/connexion">Se connecter</Link>
            <Link href="/inscription">S’inscrire</Link>
            <Link href="/comment-ca-marche#bike-sitter">Devenir Bike Sitter</Link>
          </nav>
        )}
        <div className="pied-aide">
          <h2>Un problème pendant une garde ?</h2>
          <p>
            En cas de danger immédiat, appelez le 112. Sinon, écrivez-nous : un
            modérateur regarde les constats des deux côtés.
          </p>
        </div>
      </div>
      <div className="pied-bas">
        <p>Bruxelles · Association sans but lucratif</p>
        <p>
          <Link href="/conditions-generales">Conditions</Link> ·{' '}
          <Link href="/confidentialite">Confidentialité</Link> ·{' '}
          <Link href="/mentions-legales">Mentions légales</Link>
        </p>
      </div>
    </footer>
  );
}
