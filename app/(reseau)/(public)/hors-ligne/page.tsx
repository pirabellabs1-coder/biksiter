import type { Metadata } from 'next';
import Link from 'next/link';

import { ReessayerLaConnexion } from '@/components/maquette/gardes-difficiles/reessayer-la-connexion';

export const metadata: Metadata = { title: 'Hors connexion' };

export default function HorsLigne() {
  return (
    <div className="page page-etroite" id="contenu">
      <div className="bandeau-horsligne" role="status">
        <span className="bh-pastille" aria-hidden="true" />
        Vous êtes hors connexion
      </div>

      <header className="page-tete">
        <span className="kicker kicker-rouge">PAS DE RÉSEAU</span>
        <h1>La garde continue sans le réseau.</h1>
        <p>
          Une garde se passe entre deux personnes, dans un garage. Le réseau
          sert à la préparer, pas à la vivre. Voici ce qui marche quand même.
        </p>
      </header>

      <section className="bloc">
        <h2>Ce qui fonctionne hors connexion</h2>
        <ul className="verifs">
          <li>
            <span className="vi" aria-hidden="true">
              ⌂
            </span>
            <div>
              <b>Votre garde en cours</b>
              <span>
                Adresse, horaires et téléphone du Bike Sitter restent lisibles
              </span>
            </div>
            <span className="v-ok" aria-hidden="true">
              ✓
            </span>
          </li>
          <li>
            <span className="vi" aria-hidden="true">
              ▦
            </span>
            <div>
              <b>Votre code de retrait</b>
              <span>Il est gardé sur l’appareil, pas demandé au serveur</span>
            </div>
            <span className="v-ok" aria-hidden="true">
              ✓
            </span>
          </li>
          <li>
            <span className="vi" aria-hidden="true">
              ◉
            </span>
            <div>
              <b>Les photos de constat</b>
              <span>Prises maintenant, envoyées dès le retour du réseau</span>
            </div>
            <span className="v-ok" aria-hidden="true">
              ✓
            </span>
          </li>
          <li>
            <span className="vi" aria-hidden="true">
              ☰
            </span>
            <div>
              <b>Les pages lues récemment</b>
              <span>Règles, mentions légales, fiche du Bike Sitter</span>
            </div>
            <span className="v-ok" aria-hidden="true">
              ✓
            </span>
          </li>
        </ul>
      </section>

      <section className="bloc">
        <h2>Ce qui attend le réseau</h2>
        <ul className="liste-nette">
          <li>
            <b>Chercher un Bike Sitter</b> et voir la carte : les résultats
            dépendent des disponibilités du moment.
          </li>
          <li>
            <b>Envoyer une demande</b> ou répondre à une demande reçue.
          </li>
          <li>
            <b>Écrire un message.</b> Ce que vous tapez est gardé et part tout
            seul au retour du réseau.
          </li>
        </ul>
        {/* La maquette chiffrait ici la file d'attente — « 2 éléments, 4
            photos, 1 message ». Aucun de ces nombres n'existe : rien ne
            compte encore ce qui attend d'être envoyé. Les afficher
            reviendrait à inventer un état de l'appareil. On dit donc ce qui
            est vrai, sans chiffre. */}
        <div className="file-attente">
          <b>Ce que vous faites hors connexion est gardé</b>
          <span>
            Photos et messages partent d’eux-mêmes au retour du réseau. Rien
            ne se perd, rien n’est à refaire.
          </span>
        </div>
      </section>

      <section className="bloc">
        <h2>Si vous êtes devant la porte</h2>
        <p>
          Le numéro du Bike Sitter est dans la garde, et il fonctionne sans
          réseau de données. Appelez-le plutôt que d’attendre que l’application
          revienne.
        </p>
        <div className="actions-fin">
          <Link className="bleu" href="/gardes">
            Voir ma garde en cours
          </Link>
          <ReessayerLaConnexion />
        </div>
      </section>
    </div>
  );
}
