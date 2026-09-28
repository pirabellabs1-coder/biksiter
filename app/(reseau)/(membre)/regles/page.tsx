import type { Metadata } from 'next';

import { statistiquesDuBikeSitter } from '@/lib/depot/lieux';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import { CHIFFRES_DU_CODE_DE_REMISE } from '@/lib/regles/remise';
import { DUREE_MAXIMALE_EN_BETA_HEURES } from '@/lib/regles/tarifs';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Nos règles') };
}

export default async function NosRegles() {
  const membre = await exigerUnMembre();
  const _mode = await modeCourant();
  const [_nonLues, _stats] = await Promise.all([
    nombreDeNotificationsNonLues(membre.id),
    statistiquesDuBikeSitter(membre.id),
  ]);
  return (
    <>
      <div className="page" id="contenu">
        <header className="page-tete">
          <span className="kicker">NOS RÈGLES</span>
          <h1>Six règles, et elles ne se négocient pas.</h1>
          <p>
            Elles tiennent en une page parce qu&apos;elles doivent être lues.
            Un membre qui en écarte une quitte le réseau, quelle que soit son
            ancienneté.
          </p>
        </header>

        <div className="page-grille">
          <ol className="regles">
            <li>
              <b>Le Bike Sitter est présent pendant toute la garde.</b> Il
              ouvre, il referme, et il rend le vélo en main propre. Personne
              d&apos;autre ne s&apos;en charge à sa place.
            </li>
            <li>
              <b>L&apos;emplacement est fermé et non partagé.</b> Un garage, une
              cave, une cour à soi. Pas de local vélo d&apos;immeuble, pas de
              hall commun, pas de jardin ouvert.
            </li>
            <li>
              <b>La remise se fait de la main à la main, avec un code.</b>{' '}
              {CHIFFRES_DU_CODE_DE_REMISE} chiffres au dépôt,{' '}
              {CHIFFRES_DU_CODE_DE_REMISE} au retrait, et des photos du vélo
              aux deux moments.
            </li>
            <li>
              <b>L&apos;adresse exacte n&apos;apparaît qu&apos;après
              acceptation.</b> Avant, on ne voit qu&apos;une zone approximative.
              Les photos d&apos;emplacement ne montrent ni numéro de rue ni
              boîte aux lettres.
            </li>
            <li>
              <b>
                Une garde dure d&apos;une à {DUREE_MAXIMALE_EN_BETA_HEURES}{' '}
                heures.
              </b>{' '}
              Chaque Bike Sitter peut abaisser son propre maximum, jamais le
              dépasser.
            </li>
            <li>
              <b>Le stationnement est entièrement gratuit.</b> Aucun paiement
              n&apos;est demandé, ni sur le site, ni entre les membres. Le Bike
              Sitter est bénévole ; il reçoit des points, jamais de l&apos;argent.
            </li>
          </ol>

          <section className="bloc">
            <h2>Ce qui fait sortir du réseau</h2>
            <ul className="liste-nette">
              <li>
                Confier le vélo à un tiers ou laisser l&apos;emplacement sans
                surveillance.
              </li>
              <li>
                Communiquer l&apos;adresse ou le numéro d&apos;un membre à
                quelqu&apos;un d&apos;autre.
              </li>
              <li>
                Demander ou accepter un paiement pour une garde, quelle
                qu&apos;en soit la forme.
              </li>
              <li>
                Refuser la visite de l&apos;emplacement par un modérateur.
              </li>
            </ul>
            <p className="mention">
              Un désaccord se signale depuis la messagerie de la garde. Un
              modérateur répond dans les vingt-quatre heures.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
