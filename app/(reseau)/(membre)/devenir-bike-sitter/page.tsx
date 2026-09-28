import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { mesLieux } from '@/lib/depot/lieux';
import { monProfil } from '@/lib/depot/membre-espace';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { exigerUnMembre } from '@/lib/session';

export const metadata: Metadata = { title: 'Devenir Bike Sitter' };

/**
 * Devenir bike sitter n'est pas un statut qu'on demande : c'est proposer un
 * emplacement depuis le même compte. Cet écran dit ce qu'il faut, puis ouvre
 * le parcours.
 */
export default async function DevenirBikeSitter() {
  const membre = await exigerUnMembre();
  const [profil, lieux, _nonLues] = await Promise.all([
    monProfil(membre.id),
    mesLieux(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);
  if (lieux.length > 0) redirect('/mes-lieux');

  return (
    <main id="contenu">
      <div className="dashboard-wrap" id="devenirbs">
        <div className="bs-hero">
          <div>
            <span className="kicker">DEVENIR BIKE SITTER</span>
            <h1>Accueillez les vélos du quartier chez vous</h1>
            <p className="bs-intro">
              Vous recevez le vélo, vous le rangez chez vous, vous le rendez en
              main propre. Entre les deux, il attend à l’abri et vous vivez
              votre journée.
            </p>
          </div>
          <div className="bs-carte-visuel">
            <div className="bs-chiffre">
              <b>15 min</b>
              <span>par garde, en tout</span>
            </div>
            <div className="bs-chiffre">
              <b>Gratuit</b>
              <span>pour vous comme pour le cycliste</span>
            </div>
            <div className="bs-chiffre">
              <b>Au choix</b>
              <span>vous acceptez les demandes qui vous conviennent</span>
            </div>
          </div>
        </div>

        <h2 className="prog-titre">Ce qu’il faut</h2>
        <ul className="bs-liste">
          <li>
            <b>Un emplacement privé et fermé</b> — garage, cave, cour ou pièce
            dédiée, non accessible à d’autres résidents.
          </li>
          <li>
            <b>Être majeur</b> et faire vérifier votre identité, une fois.
          </li>
          <li>
            <b>Recevoir le vélo et le rendre en personne</b>, aux horaires que
            vous déclarez.
          </li>
          <li>
            <b>Être joignable</b> pendant la garde.
          </li>
        </ul>

        <div className="bs-non">
          <b>Ce qui reste libre</b>
          <ul>
            <li>Vous sortez comme d’habitude pendant la garde</li>
            <li>Vous répondez oui aux demandes qui vous arrangent</li>
            <li>Vous choisissez vos jours et vos heures</li>
            <li>Vous mettez l’accueil en pause quand vous le voulez</li>
          </ul>
        </div>

        {profil?.identiteVerifiee ? null : (
          <p className="prog-note">
            Avant la publication, une personne de l’association vérifie votre
            identité. Les cyclistes savent ainsi à qui ils confient leur vélo.{' '}
            <Link href="/profil/verifications">Vérifier mon identité</Link>
          </p>
        )}

        <Link className="primary bs-cta" href="/mes-lieux">
          Proposer mon emplacement
        </Link>
      </div>
    </main>
  );
}
