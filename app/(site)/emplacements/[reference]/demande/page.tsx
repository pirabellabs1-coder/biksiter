import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BaseNonBranchee from '@/components/base-non-branchee';
import { baseConfiguree } from '@/lib/bd/client';
import { ficheParReference } from '@/lib/depot/emplacements';
import { peutDemanderUnStationnement } from '@/lib/regles/publication';
import { membreConnecte, membrePourLesRegles } from '@/lib/session';

import FormulaireDeDemande from './formulaire';

export const metadata: Metadata = {
  title: 'Demander un stationnement',
};

export const dynamic = 'force-dynamic';

export default async function DemandeDeStationnement({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  if (!baseConfiguree()) {
    return (
      <div className="page page--lecture">
        <h1 className="titre-page">Demander un stationnement</h1>
        <BaseNonBranchee />
      </div>
    );
  }

  const { reference } = await params;
  const fiche = await ficheParReference(reference);

  if (!fiche) {
    notFound();
  }

  const membre = await membreConnecte();
  const autorise =
    membre !== null && peutDemanderUnStationnement(await membrePourLesRegles());

  if (!autorise) {
    return (
      <div className="page page--lecture">
        <p className="surtitre">Demande de stationnement</p>
        <h1 className="titre-page">
          Avant d’écrire à {fiche.prenomDuBikeSitter}
        </h1>
        <p className="chapeau">
          Un compte unique, vérifié. Vous serez cycliste quand vous cherchez une
          place, bike sitter si vous décidez d’en proposer une — c’est la même
          personne, le même compte.
        </p>

        <div className="encart">
          <p>
            <strong>
              {membre
                ? 'Votre identité est en cours de vérification.'
                : 'Votre identité doit être vérifiée avant d’envoyer une demande.'}
            </strong>{' '}
            Ouvrir sa porte à quelqu’un suppose de savoir qui c’est ; c’est ce
            que nous demandons aussi de votre côté.
          </p>
        </div>

        <div className="boutons">
          {membre ? (
            <Link
              href="/inscription/validation"
              className="bouton bouton--principal"
            >
              Où en est ma vérification
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="bouton bouton--principal">
                Me connecter
              </Link>
              <Link href="/invitation" className="bouton bouton--discret">
                J’ai une invitation
              </Link>
            </>
          )}
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
      <h1 className="titre-page">Votre demande à {fiche.prenomDuBikeSitter}</h1>

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
          <dd>{fiche.type}</dd>
        </div>
        <div>
          <dt>Quartier</dt>
          <dd>{fiche.quartier}</dd>
        </div>
        <div>
          <dt>Vélos acceptés</dt>
          <dd>{fiche.velosAcceptes.join(', ')}</dd>
        </div>
        <div>
          <dt>Adresse exacte</dt>
          <dd>après acceptation</dd>
        </div>
      </dl>

      <h2 className="titre-section titre-section--aere">Votre demande</h2>
      <FormulaireDeDemande
        reference={fiche.reference}
        prenomDuBikeSitter={fiche.prenomDuBikeSitter}
      />
    </div>
  );
}
