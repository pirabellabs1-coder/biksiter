import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { emplacementParReference } from '@/lib/donnees/emplacements-de-demonstration';
import { ficheVisible } from '@/lib/regles/adresse';
import { peutDemanderUnStationnement } from '@/lib/regles/publication';
import { membreCourant } from '@/lib/session';

import FormulaireDeDemande from './formulaire';

export const metadata: Metadata = {
  title: 'Demander un stationnement',
};

export default async function DemandeDeStationnement({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const complet = emplacementParReference(reference);

  if (!complet) {
    notFound();
  }

  const fiche = ficheVisible(complet);
  const membre = membreCourant();

  if (!peutDemanderUnStationnement(membre)) {
    return (
      <div className="page page--lecture">
        <p className="surtitre">Demande de stationnement</p>
        <h1 className="titre-page">Avant d’écrire à {fiche.prenomDuBikeSitter}</h1>
        <p className="chapeau">
          Un compte unique, vérifié. Vous serez cycliste quand vous cherchez une
          place, bike sitter si vous décidez d’en proposer une — c’est la même
          personne, le même compte.
        </p>

        <div className="encart">
          <p>
            <strong>
              Votre identité doit être vérifiée avant d’envoyer une demande.
            </strong>{' '}
            Ouvrir sa porte à quelqu’un suppose de savoir qui c’est ; c’est ce
            que nous demandons aussi de votre côté. On entre aujourd’hui sur
            invitation d’un membre.
          </p>
        </div>

        <div className="boutons">
          <Link href="/invitation" className="bouton bouton--principal">
            J’ai une invitation
          </Link>
          <Link href="/liste-attente" className="bouton bouton--discret">
            Rejoindre la liste d’attente
          </Link>
          <Link
            href={`/emplacements/${fiche.reference}`}
            className="bouton bouton--discret"
          >
            Revenir à l’emplacement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--lecture">
      <p className="surtitre">Demande de stationnement</p>
      <h1 className="titre-page">
        Votre demande à {fiche.prenomDuBikeSitter}
      </h1>

      <div className="encart encart--verifie">
        <p>
          <strong>Votre profil est vérifié.</strong> {fiche.prenomDuBikeSitter}{' '}
          verra votre prénom et le fait que votre identité a été contrôlée —
          c’est ce qui lui permet d’accepter en confiance.
        </p>
      </div>

      <dl className="details carte">
        <div>
          <dt>Chez</dt>
          <dd>{fiche.prenomDuBikeSitter}</dd>
        </div>
        <div>
          <dt>Emplacement</dt>
          <dd>{complet.type}</dd>
        </div>
        <div>
          <dt>Quartier</dt>
          <dd>{fiche.quartier}</dd>
        </div>
        <div>
          <dt>Adresse exacte</dt>
          <dd>après acceptation</dd>
        </div>
      </dl>

      <h2 className="titre-section titre-section--aere">Votre demande</h2>
      <FormulaireDeDemande prenomDuBikeSitter={fiche.prenomDuBikeSitter} />
    </div>
  );
}
