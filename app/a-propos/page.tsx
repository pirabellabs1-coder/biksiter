import type { Metadata } from 'next';
import Link from 'next/link';

import Chiffres from '@/components/chiffres';
import { baseConfiguree } from '@/lib/bd/client';
import { ASSOCIATION } from '@/lib/contenu/association';
import { mesuresDuReseau } from '@/lib/depot/chiffres';
import { chiffresAAfficher } from '@/lib/regles/chiffres';

export const metadata: Metadata = {
  title: 'Qui sommes-nous',
  description:
    'Bike Sitters relie des cyclistes qui cherchent un abri et des habitants qui en ont un. Association sans but lucratif, à Bruxelles.',
};

export default async function APropos() {
  const chiffres = baseConfiguree()
    ? chiffresAAfficher(await mesuresDuReseau())
    : [];

  return (
    <div className="page page--lecture">
      <p className="surtitre">À propos</p>
      <h1 className="titre-page">Pourquoi nous faisons ça</h1>

      <p>
        Se faire voler son vélo, ce n’est pas seulement perdre de l’argent :
        c’est changer d’habitude. On sort moins son vélo, on en achète un moins
        beau, on renonce à des trajets. Le stationnement est la première raison
        qu’on donne pour ne pas y aller à vélo.
      </p>
      <p>
        Pendant ce temps, derrière les façades de nos villes, il y a des
        milliers de garages, de caves et de cours vides une grande partie de la
        journée. Cette place existe déjà, elle est sûre, et elle se trouve
        exactement là où les cyclistes vont.
      </p>
      <p>Bike Sitters relie les deux. Rien de plus, rien de moins.</p>

      <h2 className="titre-section titre-section--aere">Où nous en sommes</h2>
      {chiffres.length === 0 ? (
        <p className="discret">
          Rien à compter pour l’instant : le premier emplacement n’est pas
          encore publié. Ce paragraphe affichera les chiffres du réseau, tels
          qu’ils sortent de la base — pas des chiffres d’annonce.
        </p>
      ) : (
        <Chiffres chiffres={chiffres} />
      )}

      <h2 className="titre-section titre-section--aere">
        Ce que nous refusons de faire
      </h2>
      <p>
        Un réseau d’entraide se casse par petits ajouts qui semblent tous
        raisonnables. Nous avons écarté les notes en étoiles, les points, les
        badges et les niveaux : cela fonctionne entre inconnus, pas entre
        voisins. Nous avons écarté le classement des membres, parce qu’il crée
        des perdants et pousse à accepter des gardes qu’on aurait dû refuser.
      </p>
      <p>
        Nous ne vendons rien, ne prenons aucune commission et ne revendons
        aucune donnée. L’hébergement est situé dans l’Union européenne.
      </p>

      <h2 className="titre-section titre-section--aere">
        Comment le service est financé
      </h2>
      <p>
        Le service est gratuit et le restera. Il vit de dons et de partenariats
        avec des acteurs qui partagent l’objectif : communes, associations
        cyclistes, commerces de quartier.
      </p>

      <div className="boutons">
        <Link href="/soutenir" className="bouton bouton--principal">
          Nous soutenir
        </Link>
        <a href={`mailto:${ASSOCIATION.contact}`} className="bouton bouton--discret">
          Nous écrire
        </a>
      </div>

      <div className="encart">
        <p>
          {ASSOCIATION.nom}, {ASSOCIATION.forme} établie à {ASSOCIATION.ville}.
          Numéro d’entreprise {ASSOCIATION.numeroDEntreprise}. Écrivez-nous à{' '}
          <a href={`mailto:${ASSOCIATION.contact}`} className="lien">
            {ASSOCIATION.contact}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
