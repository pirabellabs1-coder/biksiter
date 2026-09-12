import type { Metadata } from 'next';

import BandeauDePage from '@/components/bandeau-de-page';
import { ASSOCIATION } from '@/lib/contenu/association';

export const metadata: Metadata = {
  title: 'Conditions générales',
  description:
    'Objet du service, gratuité, responsabilité, données personnelles et modération.',
};

/**
 * Les articles, chacun avec son ancre, son titre et son texte au même endroit.
 * Le sommaire et le corps sont tirés de cette seule liste : on ne peut pas en
 * réordonner l'un sans l'autre, ni lier un titre au texte d'un autre article.
 */
const ARTICLES: { ancre: string; titre: string; corps: React.ReactNode }[] = [
  {
    ancre: 'objet',
    titre: 'Objet du service',
    corps: (
      <p>
        {ASSOCIATION.nom} met en relation des personnes cherchant un
        stationnement pour leur vélo et des personnes disposant d’un emplacement
        privé. Le service ne prend pas en charge la garde du vélo, ne le
        transporte pas et ne l’assure pas.
      </p>
    ),
  },
  {
    ancre: 'gratuite',
    titre: 'Gratuité',
    corps: (
      <p>
        L’utilisation est gratuite pour les deux parties. Aucune rémunération
        n’est versée aux bike sitters et aucune commission n’est prélevée.
      </p>
    ),
  },
  {
    ancre: 'responsabilite',
    titre: 'Responsabilité',
    corps: (
      <p>
        À compléter avec le conseil juridique. Le partage des responsabilités
        entre le cycliste, le bike sitter et l’association doit y être écrit
        sans ambiguïté, ainsi que le rôle des assurances habitation et vélo de
        chacun.
      </p>
    ),
  },
  {
    ancre: 'donnees',
    titre: 'Données personnelles',
    corps: (
      <>
        <p>
          L’adresse d’un emplacement n’est jamais publiée : la carte n’affiche
          qu’une zone approximative, et l’adresse exacte est communiquée par le
          bike sitter lui-même après acceptation d’une demande.
        </p>
        <p>
          La pièce d’identité transmise lors de l’inscription est vérifiée par
          une personne, puis supprimée — au plus tard après sept jours. Ni
          l’image ni le numéro ne sont conservés : seul le résultat de la
          vérification l’est.
        </p>
        <p>L’hébergement des données est situé dans l’Union européenne.</p>
      </>
    ),
  },
  {
    ancre: 'moderation',
    titre: 'Modération',
    corps: (
      <p>
        Tout emplacement ou tout compte peut être retiré en cas de manquement.
        Les décisions de modération sont journalisées et motivées.
      </p>
    ),
  },
];

export default function ConditionsGenerales() {
  return (
    <>
      {/* Pas de dessin : un texte juridique n'a rien à illustrer, et un dessin
          qui ne dit rien de la page serait de la décoration. */}
      <BandeauDePage
        surtitre="Conditions générales"
        titre="Conditions générales d’utilisation."
      >
        {/* Encart neutre, et non rouge : le rouge signale un refus ou une
            erreur (règle 6). Un avertissement adressé à l'équipe n'est ni l'un
            ni l'autre — c'est le texte qui doit porter l'alerte, pas la
            couleur. */}
        <div className="encart">
          <p>
            <strong>
              Version de travail — ne pas mettre en ligne en l’état.
            </strong>{' '}
            Ce texte doit être rédigé et validé par un juriste. La clause de
            responsabilité, en particulier, détermine ce que le service peut
            promettre : c’est la première question que posent les bike sitters
            comme les cyclistes.
          </p>
        </div>
      </BandeauDePage>

      <section className="section section--claire">
        <div className="section__interieur colonnes-editoriales">
          <nav
            className="colonnes-editoriales__titre sommaire"
            aria-label="Sommaire des conditions générales"
          >
            <p className="surtitre">Sommaire</p>
            <ol>
              {ARTICLES.map(({ ancre, titre }) => (
                <li key={ancre}>
                  <a href={`#${ancre}`}>{titre}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="colonnes-editoriales__corps articles">
            {ARTICLES.map(({ ancre, titre, corps }) => (
              <article key={ancre} aria-labelledby={ancre}>
                <h2 id={ancre}>{titre}</h2>
                {corps}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
