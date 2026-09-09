import type { Metadata } from 'next';

import { ASSOCIATION } from '@/lib/contenu/association';

export const metadata: Metadata = {
  title: 'Conditions générales',
  description:
    'Objet du service, gratuité, responsabilité, données personnelles et modération.',
};

export default function ConditionsGenerales() {
  return (
    <div className="page page--lecture">
      <p className="surtitre">Conditions générales</p>
      <h1 className="titre-page">Conditions générales d’utilisation</h1>

      {/* Encart neutre, et non rouge : le rouge signale un refus ou une erreur
          (règle 6). Un avertissement adressé à l'équipe n'est ni l'un ni
          l'autre — c'est le texte qui doit porter l'alerte, pas la couleur. */}
      <div className="encart">
        <p>
          <strong>Version de travail — ne pas mettre en ligne en l’état.</strong>{' '}
          Ce texte doit être rédigé et validé par un juriste. La clause de
          responsabilité, en particulier, détermine ce que le service peut
          promettre : c’est la première question que posent les bike sitters
          comme les cyclistes.
        </p>
      </div>

      <h2 className="titre-section titre-section--aere">Objet du service</h2>
      <p>
        {ASSOCIATION.nom} met en relation des personnes cherchant un
        stationnement pour leur vélo et des personnes disposant d’un emplacement
        privé. Le service ne prend pas en charge la garde du vélo, ne le
        transporte pas et ne l’assure pas.
      </p>

      <h2 className="titre-section titre-section--aere">Gratuité</h2>
      <p>
        L’utilisation est gratuite pour les deux parties. Aucune rémunération
        n’est versée aux bike sitters et aucune commission n’est prélevée.
      </p>

      <h2 className="titre-section titre-section--aere">Responsabilité</h2>
      <p>
        À compléter avec le conseil juridique. Le partage des responsabilités
        entre le cycliste, le bike sitter et l’association doit y être écrit
        sans ambiguïté, ainsi que le rôle des assurances habitation et vélo de
        chacun.
      </p>

      <h2 className="titre-section titre-section--aere">
        Données personnelles
      </h2>
      <p>
        L’adresse d’un emplacement n’est jamais publiée : la carte n’affiche
        qu’une zone approximative, et l’adresse exacte est communiquée par le
        bike sitter lui-même après acceptation d’une demande.
      </p>
      <p>
        La pièce d’identité transmise lors de l’inscription est vérifiée par une
        personne, puis supprimée — au plus tard après sept jours. Ni l’image ni
        le numéro ne sont conservés : seul le résultat de la vérification l’est.
      </p>
      <p>L’hébergement des données est situé dans l’Union européenne.</p>

      <h2 className="titre-section titre-section--aere">Modération</h2>
      <p>
        Tout emplacement ou tout compte peut être retiré en cas de manquement.
        Les décisions de modération sont journalisées et motivées.
      </p>
    </div>
  );
}
