import type { Metadata } from 'next';

import BaseNonBranchee from '@/components/base-non-branchee';
import { baseConfiguree } from '@/lib/bd/client';
import { ASSOCIATION } from '@/lib/contenu/association';
import { CE_QUE_COUVRE_UN_DON } from '@/lib/regles/dons';

import FormulaireDeDon from './formulaire';

export const metadata: Metadata = {
  title: 'Nous soutenir',
  description:
    'Le service est gratuit, pas sans coût. Hébergement, cartographie, envois d’e-mails et vérification des candidatures : ce que couvre un don.',
};

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
            <p className="chiffre__valeur">{montant} €</p>
            <p className="discret">{usage}</p>
          </li>
        ))}
      </ul>

      <h2 className="titre-section titre-section--aere">
        Par virement, pas par carte
      </h2>
      <p className="discret">
        Un prestataire de paiement prend deux à trois pour cent de chaque don.
        Sur les petits montants qui nous font vivre, cela représente un mois de
        fonctionnement par an. Un virement, lui, ne coûte rien — ni à vous, ni à
        nous.
      </p>
      <p className="discret">
        Le formulaire ci-dessous ne fait qu’une chose : produire une
        communication structurée, ce numéro que votre banque sait recopier et
        qui nous permet de reconnaître votre virement. Aucune donnée bancaire ne
        passe par ce site, et il n’y en aura jamais.
      </p>

      {baseConfiguree() ? <FormulaireDeDon /> : <BaseNonBranchee />}

      <div className="encart">
        <p>
          Vous pouvez aussi virer directement à {ASSOCIATION.nom}, IBAN{' '}
          <strong>{ASSOCIATION.iban}</strong>, en mentionnant simplement
          « don ». La communication structurée nous aide seulement à vous
          remercier nommément.
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
