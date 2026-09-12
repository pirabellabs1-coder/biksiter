import type { Metadata } from 'next';
import Link from 'next/link';

import Appel from '@/components/appel';
import BandeauDePage from '@/components/bandeau-de-page';
import Chiffres from '@/components/chiffres';
import SectionEditoriale from '@/components/section-editoriale';
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
    <>
      <BandeauDePage
        surtitre="À propos"
        titre="Pourquoi Bike Sitters existe."
        chapeau="Bike Sitters relie des cyclistes qui cherchent un abri et des habitants qui en ont un. Association sans but lucratif, à Bruxelles."
        scene="la-rue"
      />

      <SectionEditoriale
        id="constat"
        surtitre="Le constat"
        titre="La place existe déjà, derrière les façades."
        scene="la-cave"
      >
        <p>
          Le vol de vélo ne coûte pas seulement de l’argent : il fait aussi
          renoncer à des trajets. Trouver où garer son vélo en sécurité reste
          l’une des principales difficultés des cyclistes en ville.
        </p>
        <p>
          Pendant ce temps, de nombreux garages, caves et cours restent vides
          une grande partie de la journée. Cette place existe déjà, elle est
          sûre, et elle se trouve souvent tout près des destinations des
          cyclistes.
        </p>
        <p className="exergue">
          Bike Sitters rapproche les uns et les autres, simplement.
        </p>
      </SectionEditoriale>

      <SectionEditoriale
        id="reseau"
        claire
        surtitre="Le réseau"
        titre="Où nous en sommes"
        chapeau="Les chiffres réels du réseau, mis à jour en continu."
      >
        {chiffres.length === 0 ? (
          <p>
            Les premiers emplacements seront bientôt publiés. Les chiffres du
            réseau s’afficheront ici dès leur arrivée.
          </p>
        ) : (
          <Chiffres chiffres={chiffres} />
        )}
      </SectionEditoriale>

      <SectionEditoriale id="refus" surtitre="Nos principes" titre="Nos choix">
        <p>
          Nous voulons que chacun participe à son rythme, sans pression. C’est
          pourquoi le réseau n’utilise ni notes, ni points, ni badges, et ne
          classe pas ses membres : chaque bike sitter accueille quand cela lui
          convient.
        </p>
        <p>
          Le service ne prélève aucune commission et ne revend aucune donnée. Il
          est hébergé dans l’Union européenne.
        </p>
      </SectionEditoriale>

      <SectionEditoriale
        id="financement"
        claire
        surtitre="L’association"
        titre="Comment le service est financé"
      >
        <p>
          Le service est gratuit et le restera. Il vit de dons et de
          partenariats avec des acteurs qui partagent l’objectif : communes,
          associations cyclistes, commerces de quartier.
        </p>
        <div className="encart">
          <p>
            {ASSOCIATION.nom}, {ASSOCIATION.forme} en cours de constitution à{' '}
            {ASSOCIATION.ville}.{' '}
            {ASSOCIATION.numeroDEntreprise === null
              ? 'Le numéro d’entreprise sera publié ici dès l’enregistrement de l’association.'
              : `Numéro d’entreprise ${ASSOCIATION.numeroDEntreprise}.`}
            {ASSOCIATION.contact === null ? null : (
              <>
                {' '}
                Écrivez-nous à{' '}
                <a href={`mailto:${ASSOCIATION.contact}`} className="lien">
                  {ASSOCIATION.contact}
                </a>
                .
              </>
            )}
          </p>
        </div>
      </SectionEditoriale>

      <Appel
        surtitre="Nous soutenir"
        titre="Soutenir le réseau."
        chapeau="Vos dons financent l’hébergement du site, la carte et la vérification des identités."
        actions={
          <>
            <Link href="/soutenir" className="bouton bouton--principal">
              Nous soutenir
            </Link>
            {ASSOCIATION.contact === null ? (
              <Link href="/fonctionnement" className="bouton bouton--discret">
                Comment ça marche
              </Link>
            ) : (
              <a
                href={`mailto:${ASSOCIATION.contact}`}
                className="bouton bouton--discret"
              >
                Nous écrire
              </a>
            )}
          </>
        }
      />
    </>
  );
}
