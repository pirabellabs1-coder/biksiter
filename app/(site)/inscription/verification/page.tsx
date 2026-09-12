import type { Metadata } from 'next';
import Link from 'next/link';

import { Avancement, Jalon } from '@/components/avancement';
import BandeauDePage from '@/components/bandeau-de-page';
import BaseNonBranchee from '@/components/base-non-branchee';
import SectionEditoriale from '@/components/section-editoriale';
import { baseConfiguree } from '@/lib/bd/client';
import { pieceDuMembre } from '@/lib/depot/pieces';
import { etatDuTelephone } from '@/lib/depot/telephone';
import {
  CONSERVATION_MAXIMALE_JOURS,
  joursAvantSuppression,
} from '@/lib/regles/pieces';
import { chiffrementDisponible } from '@/lib/securite/chiffrement';
import { exigerUnMembre } from '@/lib/session';

import FormulaireDePiece from './formulaire';
import VerificationDuTelephone from './telephone';

export const metadata: Metadata = {
  title: 'Vérifier mon identité',
  description:
    'Trois vérifications, une seule fois : e-mail, téléphone et pièce d’identité. Le document est supprimé après contrôle.',
};

export const dynamic = 'force-dynamic';

export default async function Verification() {
  const membre = await exigerUnMembre();

  if (!baseConfiguree()) {
    return (
      <>
        <BandeauDePage
          surtitre="Vérification"
          titre="Confirmer qui vous êtes."
        />
        <section className="section">
          <div className="section__interieur">
            <BaseNonBranchee />
          </div>
        </section>
      </>
    );
  }

  const [piece, telephone] = await Promise.all([
    pieceDuMembre(membre.id),
    etatDuTelephone(membre.id),
  ]);
  const dejaVerifie = membre.verification === 'verifiee';
  const refuse = membre.verification === 'refusee';

  return (
    <>
      <BandeauDePage
        surtitre="Vérification"
        titre="Confirmer qui vous êtes."
        chapeau="Trois vérifications à faire une seule fois : votre e-mail, votre téléphone et votre pièce d’identité. Elles assurent la confiance entre tous les membres du réseau."
        retour={{ href: '/mon-compte', libelle: 'Mon tableau de bord' }}
      />

      <SectionEditoriale
        id="verifications"
        surtitre="Vos vérifications"
        titre="Où vous en êtes"
        chapeau="Votre pièce d’identité est chiffrée à son arrivée et supprimée dès qu’une personne l’a relue."
        scene="confier"
      >
        <Avancement>
          <Jalon
            etat="faite"
            titre="E-mail"
            mention="Confirmé"
            resume={membre.email}
          />

          <Jalon
            etat={telephone.verifieLe ? 'faite' : 'a-faire'}
            titre="Téléphone"
            mention={telephone.verifieLe ? 'Vérifié' : undefined}
            resume={
              telephone.verifieLe
                ? telephone.telephone
                : 'Nous vous envoyons un code par SMS. C’est le seul SMS que vous recevrez de notre part : les rappels arrivent par e-mail.'
            }
          >
            {telephone.verifieLe ? null : (
              <VerificationDuTelephone
                numeroConnu={telephone.telephone}
                codeEnAttente={telephone.codeEnvoyeLe !== null}
              />
            )}
          </Jalon>

          <Jalon
            etat={
              dejaVerifie
                ? 'faite'
                : refuse
                  ? 'refusee'
                  : piece
                    ? 'en-cours'
                    : 'a-faire'
            }
            titre="Pièce d’identité"
            mention={dejaVerifie ? 'Vérifiée' : refuse ? 'Refusée' : undefined}
            resume={
              dejaVerifie
                ? 'Relue par une personne, puis supprimée.'
                : refuse
                  ? 'Votre pièce n’a pas pu être validée. Le motif vous a été envoyé par e-mail ; vous pouvez en déposer une autre, sans limite d’essais.'
                  : piece
                    ? `Déposée, en cours de vérification. Elle sera supprimée dans ${joursAvantSuppression(new Date(piece.deposeeLe), new Date())} jour(s) au plus tard.`
                    : 'Une personne de l’association l’examine, généralement sous 24 heures.'
            }
          >
            {dejaVerifie ? null : (
              <>
                <div className="encart">
                  <p>
                    <strong>Votre document est protégé.</strong> Il est chiffré
                    dès son envoi et supprimé juste après la vérification, au
                    plus tard après {CONSERVATION_MAXIMALE_JOURS} jours. Nous ne
                    conservons que le résultat.
                  </p>
                </div>

                {chiffrementDisponible() ? (
                  <FormulaireDePiece />
                ) : (
                  <div className="encart">
                    <p>
                      <strong>Le dépôt est momentanément indisponible.</strong>{' '}
                      Nous finalisons la protection des documents ; merci de
                      réessayer un peu plus tard.
                    </p>
                  </div>
                )}
              </>
            )}
          </Jalon>
        </Avancement>
      </SectionEditoriale>

      <section className="section section--claire">
        <div className="section__interieur">
          {dejaVerifie ? (
            <div>
              <div className="encart encart--verifie">
                <p>
                  <strong>Votre identité est vérifiée.</strong> Merci ! Votre
                  pièce d’identité a été supprimée ; seul le résultat de la
                  vérification est conservé.
                </p>
              </div>
              <div className="boutons">
                <Link href="/emplacements" className="bouton bouton--principal">
                  Trouver un emplacement
                </Link>
                <Link
                  href="/proposer-un-emplacement"
                  className="bouton bouton--discret"
                >
                  Proposer le mien
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="entete-de-section">
                <h2 className="titre-section">
                  En attendant, vous pouvez déjà
                </h2>
              </div>
              <div className="boutons">
                <Link href="/emplacements" className="bouton bouton--discret">
                  Voir les emplacements
                </Link>
                <Link href="/fonctionnement" className="bouton bouton--discret">
                  Comment ça marche
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
