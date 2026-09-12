import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BandeauDePage from '@/components/bandeau-de-page';
import BaseNonBranchee from '@/components/base-non-branchee';
import PageDeFormulaire from '@/components/page-de-formulaire';
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
      <>
        <BandeauDePage titre="Demander un stationnement." />
        <section className="section">
          <div className="section__interieur">
            <BaseNonBranchee />
          </div>
        </section>
      </>
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

  // Le rappel de la fiche est le même dans les deux cas : on écrit toujours à
  // quelqu'un, qu'on ait le droit d'envoyer ou non. Ce qui change, c'est ce
  // qu'on peut faire ensuite.
  const rappel = (
    <dl className="rappel-de-fiche">
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
        <dd className="discret">après acceptation</dd>
      </div>
    </dl>
  );

  if (!autorise) {
    return (
      <PageDeFormulaire
        surtitre="Demande de stationnement"
        titre={`Avant d’écrire à ${fiche.prenomDuBikeSitter}`}
        chapeau="Les demandes se font depuis un compte vérifié. Ce même compte vous permettra aussi, si vous le souhaitez, d’accueillir un vélo chez vous."
        retour={{
          href: `/emplacements/${fiche.reference}`,
          libelle: 'Revenir à l’emplacement',
        }}
        propos={rappel}
      >
        <p>
          <strong>
            {membre
              ? 'Votre identité est en cours de vérification.'
              : 'Une vérification d’identité est nécessaire pour envoyer une demande.'}
          </strong>
        </p>
        <p className="discret">
          Chaque membre est vérifié par une personne de l’association,
          généralement sous 24 heures. C’est ce qui permet aux bike sitters
          d’accueillir des vélos en toute confiance.
        </p>

        <div className="boutons">
          {membre ? (
            <Link
              href="/inscription/validation"
              className="bouton bouton--principal"
            >
              Suivre ma vérification
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
        </div>
      </PageDeFormulaire>
    );
  }

  return (
    <PageDeFormulaire
      surtitre="Demande de stationnement"
      titre={`Votre demande à ${fiche.prenomDuBikeSitter}`}
      chapeau={`${fiche.prenomDuBikeSitter} verra votre prénom et saura que votre identité a été vérifiée. Vous retrouverez sa réponse dans votre espace, rubrique « Mes stationnements ».`}
      retour={{
        href: `/emplacements/${fiche.reference}`,
        libelle: 'Revenir à l’emplacement',
      }}
      propos={rappel}
    >
      <FormulaireDeDemande
        reference={fiche.reference}
        prenomDuBikeSitter={fiche.prenomDuBikeSitter}
      />
    </PageDeFormulaire>
  );
}
