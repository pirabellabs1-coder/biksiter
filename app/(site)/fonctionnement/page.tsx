import type { Metadata } from 'next';
import Link from 'next/link';

import {
  SEUIL_DESISTEMENT_TARDIF_HEURES,
} from '@/lib/regles/annulation';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { ESSAIS_PAR_CODE, VALIDITE_CODE_HEURES } from '@/lib/regles/remise';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description:
    'Deux côtés, une seule idée : rapprocher un cycliste qui cherche un abri d’un habitant qui en a un. Le détail du service, du dépôt à la reprise.',
};

export default function Fonctionnement() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Comment ça marche</p>
      <h1 className="titre-page">Le service en détail</h1>
      <p className="chapeau">
        Deux côtés, une seule idée : rapprocher un cycliste qui cherche un abri
        d’un habitant qui en a un. Personne ne paie, personne n’est classé.
      </p>

      <h2 className="titre-section titre-section--aere">
        Si vous cherchez une place pour votre vélo
      </h2>
      <ol className="etapes">
        <li className="etape">
          <span className="etape__numero" aria-hidden="true" />
          <div>
            <h3>Vous ouvrez la carte</h3>
            <p>
              Les emplacements apparaissent en zone approximative autour de
              votre destination. Aucune adresse n’y figure.
            </p>
          </div>
        </li>
        <li className="etape">
          <span className="etape__numero" aria-hidden="true" />
          <div>
            <h3>Vous écrivez au bike sitter</h3>
            <p>
              Vous proposez un jour, une heure de dépôt et une heure de reprise,
              et vous dites quel vélo vous déposez.
            </p>
          </div>
        </li>
        <li className="etape">
          <span className="etape__numero" aria-hidden="true" />
          <div>
            <h3>Il répond</h3>
            <p>
              S’il accepte, il vous donne l’adresse exacte et vous convenez des
              détails. S’il refuse, il n’a pas à se justifier.
            </p>
          </div>
        </li>
        <li className="etape">
          <span className="etape__numero" aria-hidden="true" />
          <div>
            <h3>Vous vous remettez le vélo avec un code</h3>
            <p>
              Celui qui remet le vélo détient un code à quatre chiffres, celui
              qui le reçoit le saisit. Il se dicte à voix haute, fonctionne dans
              une cave sans réseau, vaut {VALIDITE_CODE_HEURES} heures et
              accepte {ESSAIS_PAR_CODE} essais.
            </p>
          </div>
        </li>
      </ol>

      <h2 className="titre-section titre-section--aere">
        Si vous proposez un emplacement
      </h2>
      <ol className="etapes">
        <li className="etape">
          <span className="etape__numero" aria-hidden="true" />
          <div>
            <h3>Vous décrivez le lieu</h3>
            <p>
              Type d’emplacement, capacité, fermeture, accès, ancrage. Vous
              pouvez en proposer {EMPLACEMENTS_PAR_MEMBRE} au maximum.
            </p>
          </div>
        </li>
        <li className="etape">
          <span className="etape__numero" aria-hidden="true" />
          <div>
            <h3>Une personne vérifie</h3>
            <p>
              Chaque candidature est relue par un humain, et l’identité est
              contrôlée avant toute publication. C’est ce qui rend acceptable
              d’ouvrir sa porte.
            </p>
          </div>
        </li>
        <li className="etape">
          <span className="etape__numero" aria-hidden="true" />
          <div>
            <h3>Vous choisissez</h3>
            <p>
              Chaque demande est une proposition. Vous acceptez ou vous refusez,
              sans justification et sans conséquence.
            </p>
          </div>
        </li>
      </ol>

      <h2 className="titre-section titre-section--aere">
        Ce qui n’existe pas, et pourquoi
      </h2>
      <dl className="questions">
        <div>
          <dt>Aucune note, aucun classement</dt>
          <dd>
            Ni palmarès, ni tri par popularité, ni filtre par étoiles. Un
            classement entre bénévoles crée des perdants et pousse à accepter
            des gardes qu’on aurait dû refuser.
          </dd>
        </div>
        <div>
          <dt>Aucun paiement</dt>
          <dd>
            Le service est gratuit des deux côtés. Les bike sitters ne sont pas
            rémunérés et aucune commission n’est prélevée.
          </dd>
        </div>
        <div>
          <dt>Aucune adresse publique</dt>
          <dd>
            L’adresse exacte n’apparaît ni sur la carte, ni sur la fiche. Elle
            est communiquée par le bike sitter lui-même, après acceptation.
          </dd>
        </div>
        <div>
          <dt>Aucune messagerie instantanée</dt>
          <dd>
            Le chat en temps réel crée une attente de réponse que des bénévoles
            ne tiennent pas. Les échanges se font par message, sans compteur.
          </dd>
        </div>
      </dl>

      <div className="encart">
        <p>
          <strong>Un désistement se dit.</strong> Une annulation à moins de{' '}
          {SEUIL_DESISTEMENT_TARDIF_HEURES} heures du dépôt laisse quelqu’un qui
          s’était organisé pour rien. Elle n’entraîne aucune pénalité — il n’y a
          pas de score ici — mais elle mérite un mot d’excuse.
        </p>
      </div>

      <div className="encart">
        <p>
          <strong>Ce que le service ne fait pas.</strong> Il ne conserve pas
          votre vélo, ne le transporte pas et ne l’assure pas. C’est une mise en
          relation entre deux personnes, gratuite des deux côtés. Le partage des
          responsabilités est décrit dans les{' '}
          <Link href="/conditions-generales" className="lien">
            conditions générales
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
