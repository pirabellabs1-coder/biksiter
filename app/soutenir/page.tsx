import type { Metadata } from 'next';

import { ASSOCIATION } from '@/lib/contenu/association';

export const metadata: Metadata = {
  title: 'Nous soutenir',
  description:
    'Le service est gratuit, pas sans coût. Hébergement, cartographie, envois d’e-mails et vérification des candidatures : ce que couvre un don.',
};

const CE_QUE_COUVRE_UN_DON = [
  { montant: '5 €', usage: 'un mois de carte pour un quartier' },
  { montant: '20 €', usage: 'la vérification de vingt candidatures' },
  { montant: '50 €', usage: 'un mois de fonctionnement complet' },
];

export default function Soutenir() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Nous soutenir</p>
      <h1 className="titre-page">Le service est gratuit, pas sans coût</h1>
      <p className="chapeau">
        Hébergement, cartographie, envois d’e-mails, vérification des
        candidatures par une personne : chaque nouvel emplacement a un coût
        réel, même modeste. Aucun de ces coûts n’est répercuté sur les membres.
      </p>

      <ul className="grille dons">
        {CE_QUE_COUVRE_UN_DON.map(({ montant, usage }) => (
          <li className="carte" key={montant}>
            <p className="chiffre__valeur">{montant}</p>
            <p className="discret">{usage}</p>
          </li>
        ))}
      </ul>

      <div className="encart">
        <p>
          <strong>Le don en ligne n’est pas encore ouvert.</strong> Nous
          préférons le dire plutôt qu’afficher un formulaire qui ne mène nulle
          part. En attendant, écrivez-nous à{' '}
          <a href={`mailto:${ASSOCIATION.contact}`} className="lien">
            {ASSOCIATION.contact}
          </a>{' '}
          : nous vous répondons avec les coordonnées bancaires de
          l’association.
        </p>
      </div>

      <h2 className="titre-section titre-section--aere">
        Ce qu’un don ne donne pas
      </h2>
      <p className="discret">
        Aucun avantage sur le service. Un membre qui donne et un membre qui ne
        donne pas sont traités exactement pareil : pas de priorité sur les
        demandes, pas de visibilité supplémentaire, pas de mention nulle part.
        Le contraire créerait un classement, et il n’y en a pas ici.
      </p>
    </div>
  );
}
