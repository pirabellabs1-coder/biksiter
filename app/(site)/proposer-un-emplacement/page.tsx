import type { Metadata } from 'next';

import FormulaireDEmplacement from '@/components/formulaire-d-emplacement';
import PageDeFormulaire from '@/components/page-de-formulaire';
import { membreConnecte } from '@/lib/session';

import { proposerUnEmplacement } from './actions';

export const metadata: Metadata = {
  title: 'Proposer un emplacement',
  description:
    'Un garage, une cave ou une cour fermée suffisent. Accueillir un vélo est gratuit et sans engagement, et votre adresse reste confidentielle jusqu’à ce que vous acceptiez une demande.',
};

export const dynamic = 'force-dynamic';

/** Les trois choses qu'on veut savoir avant de décrire sa cave. */
const CE_QUI_EST_GARANTI = [
  {
    titre: 'Votre adresse reste confidentielle',
    detail:
      'La carte n’affiche qu’une zone d’au moins 250 mètres. L’adresse exacte n’est transmise qu’au cycliste dont vous acceptez la demande, et elle lui est retirée si le stationnement est annulé.',
  },
  {
    titre: 'Seuls des membres vérifiés peuvent vous écrire',
    detail:
      'Leur e-mail, leur téléphone et leur pièce d’identité ont été vérifiés par l’association.',
  },
  {
    titre: 'Vous restez libre de vos choix',
    detail:
      'Vous répondez librement à chaque demande. Les membres ne sont ni notés ni classés.',
  },
];

export default async function ProposerUnEmplacement() {
  const membre = await membreConnecte();
  const publiera = membre?.verification === 'verifiee';

  return (
    <PageDeFormulaire
      surtitre="Proposer un emplacement"
      collant={false}
      titre="Un peu de place chez vous peut rendre un grand service."
      chapeau="Un garage, une cave, une cour ou une véranda suffisent, dès lors que le lieu est fermé et réservé à votre usage. Vous accueillez un vélo quelques heures ou quelques jours, quand cela vous convient."
      propos={
        <>
          <ol className="etapes">
            <li className="etape">
              <span className="etape__numero" aria-hidden="true" />
              <div>
                <h2>Vous décrivez le lieu</h2>
                <p>
                  Type d’emplacement, nombre de vélos, fermeture, accès : ces
                  précisions permettent aux cyclistes de vous envoyer des
                  demandes adaptées.
                </p>
              </div>
            </li>
            <li className="etape">
              <span className="etape__numero" aria-hidden="true" />
              <div>
                <h2>Une personne vérifie</h2>
                <p>
                  Une personne de l’association vérifie votre identité avant la
                  publication, généralement sous 24 heures.
                </p>
              </div>
            </li>
            <li className="etape">
              <span className="etape__numero" aria-hidden="true" />
              <div>
                <h2>Vous recevez des demandes</h2>
                <p>
                  Les cyclistes vous écrivent, et vous acceptez les demandes qui
                  vous conviennent.
                </p>
              </div>
            </li>
          </ol>

          {/* Trois encarts empilés se lisaient comme trois alertes. C'est une
              seule promesse en trois points, et elle se lit comme telle. */}
          <dl className="garanties">
            {CE_QUI_EST_GARANTI.map(({ titre, detail }) => (
              <div key={titre}>
                <dt>{titre}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </>
      }
    >
      <h2 className="titre-section">Décrire mon emplacement</h2>
      <p className="discret">
        {publiera
          ? 'Votre identité est vérifiée : votre emplacement sera publié dès que vous l’aurez décrit. Vous pouvez en proposer jusqu’à deux.'
          : 'Décrivez votre emplacement : il sera publié une fois votre identité vérifiée par l’association, et nous vous répondons par e-mail.'}
      </p>
      <FormulaireDEmplacement
        action={proposerUnEmplacement}
        membreDejaConnu={membre !== null}
        libelleDuBouton={
          publiera ? 'Publier mon emplacement' : 'Envoyer ma candidature'
        }
      />
    </PageDeFormulaire>
  );
}
