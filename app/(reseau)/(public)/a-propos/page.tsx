import type { Metadata } from 'next';

import { textes } from '@/lib/i18n/langue';
export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Qui nous sommes') };
}

export default async function APropos() {
  return (
    <>
      <main className="page" id="contenu">
        <header className="page-tete">
          <span className="kicker">L&apos;ASSOCIATION</span>
          <h1>Un réseau de voisins, pas une entreprise de consigne.</h1>
          <p>
            Bike Sitters est une association sans but lucratif. Le stationnement
            est entièrement gratuit : le Bike Sitter est bénévole, il reçoit
            des points, jamais un salaire.
          </p>
        </header>

        <div className="page-grille">
          <section className="bloc">
            <h2>Pourquoi</h2>
            <p>
              À Bruxelles, on renonce au vélo pour un trajet sur trois faute
              d&apos;un endroit sûr où le laisser. Les arceaux sont pleins, les
              box sont loin, et un vélo attaché dans la rue reste un vélo
              exposé. Il existe pourtant, à quelques minutes de chaque
              destination, des garages, des caves et des cours qui ne servent à
              rien pendant la journée.
            </p>
          </section>

          <section className="bloc">
            <h2>Ce que nous ne faisons pas</h2>
            <ul className="liste-nette">
              <li>
                <b>Pas de consigne automatique.</b> Une garde suppose une
                personne présente, pas un boîtier.
              </li>
              <li>
                <b>Pas de paiement sur la plateforme.</b> Rien ne transite par
                nous.
              </li>
              <li>
                <b>Pas de revente de données.</b> L&apos;adresse d&apos;un
                membre n&apos;est jamais publique, et n&apos;est communiquée
                qu&apos;après acceptation.
              </li>
            </ul>
          </section>

          <section className="bloc">
            <h2>Comment c&apos;est financé</h2>
            <dl className="infos">
              <div className="info">
                <dt>Subventions</dt>
                <dd>
                  <b>Mobilité et communes</b>
                  <span>
                    Dossiers déposés auprès des communes de la zone de
                    lancement.
                  </span>
                </dd>
              </div>
              <div className="info">
                <dt>Commerces partenaires</dt>
                <dd>
                  <b>Catalogue de points</b>
                  <span>
                    Un commerce offre un geste, le réseau lui amène des
                    cyclistes.
                  </span>
                </dd>
              </div>
              <div className="info">
                <dt>Adhésion</dt>
                <dd>
                  <b>Après la bêta</b>
                  <span>
                    Une cotisation annuelle financera l&apos;assurance, une
                    fois la police signée.
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="bloc">
            <h2>Après la bêta</h2>
            <dl className="infos">
              <div className="info">
                <dt>Frais d’inscription</dt>
                <dd>
                  <b>Une fois, à l’entrée</b>
                  <span>
                    Ils financent la vérification d’identité et la modération.
                  </span>
                </dd>
              </div>
              <div className="info">
                <dt>Assurance annuelle</dt>
                <dd>
                  <b>Une cotisation par membre</b>
                  <span>
                    Mise en place une fois la police signée, pas avant.
                  </span>
                </dd>
              </div>
              <div className="info">
                <dt>Fonds de garantie</dt>
                <dd>
                  <b>Plafonné, avant l’assurance</b>
                  <span>
                    Financé par les cotisations, il couvre les cas tranchés en
                    faveur du cycliste tant qu’aucune police n’est signée.
                  </span>
                </dd>
              </div>
              <div className="info">
                <dt>Les commerces</dt>
                <dd>
                  <b>Lieux d’accueil, plus tard</b>
                  <span>La bêta se limite aux particuliers bénévoles.</span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="bloc">
            <h2>Et ensuite</h2>
            <p>
              Le service est pensé pour plusieurs pays dès la première version
              : pays, devise, fuseau horaire et langue sont des réglages, pas
              des constantes. Les marchés visés sont les Pays-Bas, la Belgique,
              la France et l’Allemagne.
            </p>
            <div className="etiquettes">
              <span className="etiquette">Pays-Bas</span>
              <span className="etiquette">Belgique</span>
              <span className="etiquette">France</span>
              <span className="etiquette">Allemagne</span>
            </div>
          </section>

          <section className="bloc">
            <h2>Où nous en sommes</h2>
            <p>
              Le réseau ouvre en bêta fermée sur Bruxelles-Ville, Ixelles et
              Saint-Gilles. On entre par invitation d&apos;un membre, le temps
              de constituer un premier noyau de Bike Sitters rencontrés un par
              un.
            </p>
            <div className="etiquettes">
              <span className="etiquette">Bruxelles-Ville</span>
              <span className="etiquette">Ixelles</span>
              <span className="etiquette">Saint-Gilles</span>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
