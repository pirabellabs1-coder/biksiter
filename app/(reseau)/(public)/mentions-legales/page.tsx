import type { Metadata } from 'next';

import { textes } from '@/lib/i18n/langue';
export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mentions légales') };
}

export default async function MentionsLegales() {
  return (
    <>
      <main className="page page-etroite" id="contenu">
        <header className="page-tete">
          <span className="kicker">MENTIONS LÉGALES</span>
          <h1>Conditions, données et cookies.</h1>
          <p>
            Trois textes courts, écrits pour être lus. Ils seront relus par un
            juriste avant l’ouverture du réseau.
          </p>
        </header>

        <nav className="ancres" aria-label="Sur cette page">
          <a href="#conditions">Conditions</a>
          <a href="#donnees">Données personnelles</a>
          <a href="#cookies">Cookies</a>
        </nav>

        <section className="bloc" id="conditions">
          <h2>Conditions d’utilisation</h2>
          <ul className="liste-nette">
            <li>
              <b>Bike Sitters met en relation, ne garde pas.</b> L’association
              n’est ni dépositaire ni gardienne du vélo. La garde se passe
              entre deux membres, chez l’un d’eux.
            </li>
            <li>
              <b>Le stationnement est entièrement gratuit.</b> Aucun paiement
              n’est demandé, ni sur le site, ni entre les membres.
              L’association n’encaisse rien, ne prend aucune commission et
              n’arbitre aucun litige de paiement.
            </li>
            <li>
              <b>Chacun reste responsable de ses actes.</b> Un Bike Sitter qui
              accepte une garde s’engage à être présent ; un cycliste qui
              dépose s’engage à revenir dans le créneau.
            </li>
            <li>
              <b>Le compte est personnel.</b> Il ne se prête pas, ne se revend
              pas, et l’identité déclarée doit être la vraie.
            </li>
            <li>
              <b>Exclusion.</b> Un manquement aux six règles du réseau entraîne
              la fermeture du compte, sans remboursement puisqu’il n’y a rien à
              rembourser.
            </li>
          </ul>
        </section>

        <section className="bloc" id="donnees">
          <h2>Données personnelles</h2>
          <dl className="infos">
            <div className="info">
              <dt>Ce qui est collecté</dt>
              <dd>
                <b>Prénom, initiale, e-mail, téléphone, adresse</b>
                <span>
                  Et une pièce d’identité au moment de la vérification.
                </span>
              </dd>
            </div>
            <div className="info">
              <dt>Ce qui est public</dt>
              <dd>
                <b>Prénom, initiale, quartier approximatif</b>
                <span>Jamais l’adresse exacte, jamais le numéro.</span>
              </dd>
            </div>
            <div className="info">
              <dt>La pièce d’identité</dt>
              <dd>
                <b>Supprimée après vérification</b>
                <span>Seul le statut « vérifié » est conservé.</span>
              </dd>
            </div>
            <div className="info">
              <dt>Les photos de garde</dt>
              <dd>
                <b>Conservées trois mois</b>
                <span>
                  Le temps qu’un litige puisse être instruit, puis effacées.
                </span>
              </dd>
            </div>
            <div className="info">
              <dt>Vos droits</dt>
              <dd>
                <b>Accès, correction, effacement</b>
                <span>Par écrit ; réponse sous trente jours.</span>
              </dd>
            </div>
          </dl>
          <p className="mention">
            Aucune donnée n’est vendue ni cédée à un tiers. Les échanges de
            messagerie ne sont lus qu’en cas de litige ouvert, et uniquement
            ceux liés à la garde concernée.
          </p>
        </section>

        <section className="bloc" id="cookies">
          <h2>Cookies</h2>
          <p>
            Le service fonctionne sans cookie publicitaire ni traceur tiers.
          </p>
          <ul className="liste-nette">
            <li>
              <b>Cookie de session.</b> Il garde votre connexion ouverte. Sans
              lui, il faudrait se reconnecter à chaque page.
            </li>
            <li>
              <b>Préférence de langue.</b> Pour ne pas redemander à chaque
              visite.
            </li>
            <li>
              <b>Rien d’autre.</b> Pas de mesure d’audience tierce, pas de
              pixel, pas de réseau social embarqué.
            </li>
          </ul>
          <p className="mention">
            C’est pour cette raison qu’aucune bannière ne vous demande
            d’accepter quoi que ce soit : il n’y a rien à accepter.
          </p>
        </section>
      </main>
    </>
  );
}
