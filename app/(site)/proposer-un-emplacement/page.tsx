import type { Metadata } from 'next';

import FormulaireDEmplacement from '@/components/formulaire-d-emplacement';
import { membreConnecte } from '@/lib/session';

import { proposerUnEmplacement } from './actions';

export const metadata: Metadata = {
  title: 'Proposer un emplacement',
  description:
    'Un garage, une cave, une cour fermée suffisent. Accueillir un vélo ne coûte rien, n’engage à rien, et votre adresse reste masquée tant que vous n’avez pas accepté une demande.',
};

export const dynamic = 'force-dynamic';

export default async function ProposerUnEmplacement() {
  const membre = await membreConnecte();
  const publiera = membre?.verification === 'verifiee';

  return (
    <div className="page">
      <div className="deux-colonnes">
        <div>
          <p className="surtitre">Proposer un emplacement</p>
          <h1 className="titre-page">
            Votre garage vide peut sauver un vélo
          </h1>
          <p className="chapeau">
            Un garage, une cave, une cour, une véranda. Si un vélo peut y tenir
            quelques heures à l’abri et que personne d’autre que vous n’y entre,
            vous pouvez accueillir.
          </p>

          <ol className="etapes">
            <li className="etape">
              <span className="etape__numero" aria-hidden="true" />
              <div>
                <h2>Vous décrivez le lieu</h2>
                <p>
                  Type d’emplacement, nombre de vélos, fermeture, accès. C’est
                  ce qui évite les demandes impossibles.
                </p>
              </div>
            </li>
            <li className="etape">
              <span className="etape__numero" aria-hidden="true" />
              <div>
                <h2>Une personne vérifie</h2>
                <p>
                  Nous contrôlons votre identité avant toute publication.
                  Personne n’apparaît sur la carte sans être passé par là.
                </p>
              </div>
            </li>
            <li className="etape">
              <span className="etape__numero" aria-hidden="true" />
              <div>
                <h2>Vous recevez des demandes</h2>
                <p>
                  Vous répondez à celles qui vous conviennent. Chaque demande
                  est une proposition, jamais une obligation.
                </p>
              </div>
            </li>
          </ol>

          <div className="encart encart--verifie">
            <p>
              <strong>
                Vous ne recevez que des demandes de membres vérifiés.
              </strong>{' '}
              Prénom, e-mail, téléphone et pièce d’identité sont contrôlés avant
              qu’une personne puisse vous écrire.
            </p>
          </div>

          <div className="encart">
            <p>
              <strong>Votre adresse n’est jamais publique.</strong> La carte
              affiche une zone d’au moins 250 mètres, pas un point. Vous
              communiquez l’adresse vous-même, uniquement à la personne dont
              vous avez accepté la demande — et elle la reperd si la garde est
              annulée.
            </p>
          </div>

          <div className="encart">
            <p>
              <strong>Il n’y a ni note, ni classement, ni palmarès.</strong> Un
              classement entre bénévoles crée des perdants et pousse à accepter
              des gardes qu’on aurait dû refuser. Refuser une demande ne vous
              coûte rien.
            </p>
          </div>
        </div>

        <div className="carte carte--aeree">
          <h2 className="titre-section">Décrire mon emplacement</h2>
          <p className="discret">
            {publiera
              ? 'Votre identité est vérifiée : cet emplacement sera publié dès que vous l’aurez décrit. Vous pouvez en proposer deux au maximum.'
              : 'Rien n’est visible tant qu’une personne n’a pas vérifié votre identité. Vous décrivez le lieu, nous vous répondons.'}
          </p>
          <FormulaireDEmplacement
            action={proposerUnEmplacement}
            membreDejaConnu={membre !== null}
            libelleDuBouton={
              publiera ? 'Publier mon emplacement' : 'Envoyer ma candidature'
            }
          />
        </div>
      </div>
    </div>
  );
}
