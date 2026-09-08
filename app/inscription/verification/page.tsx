import type { Metadata } from 'next';
import Link from 'next/link';

import BarreDuMembre from '@/components/barre-du-membre';
import BaseNonBranchee from '@/components/base-non-branchee';
import { baseConfiguree } from '@/lib/bd/client';
import { pieceDuMembre } from '@/lib/depot/pieces';
import {
  CONSERVATION_MAXIMALE_JOURS,
  joursAvantSuppression,
} from '@/lib/regles/pieces';
import { chiffrementDisponible } from '@/lib/securite/chiffrement';
import { exigerUnMembre } from '@/lib/session';

import { etatDuTelephone } from '@/lib/depot/telephone';

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
      <div className="page page--lecture">
        <h1 className="titre-page">Confirmer qui vous êtes</h1>
        <BaseNonBranchee />
      </div>
    );
  }

  const [piece, telephone] = await Promise.all([
    pieceDuMembre(membre.id),
    etatDuTelephone(membre.id),
  ]);
  const dejaVerifie = membre.verification === 'verifiee';
  const refuse = membre.verification === 'refusee';

  return (
    <div className="page page--lecture">
      <BarreDuMembre membre={membre} page="compte" />

      <p className="surtitre">Vérification</p>
      <h1 className="titre-page">Confirmer qui vous êtes</h1>
      <p className="chapeau">
        Trois vérifications, une seule fois. Elles valent autant pour vous que
        pour la personne qui vous ouvrira sa porte : vous saurez, vous aussi, à
        qui vous confiez votre vélo.
      </p>

      <ul className="etapes-verification">
        <li className="carte">
          <div>
            <h2>E-mail</h2>
            <p className="discret">{membre.email}</p>
          </div>
          <span className="pastille pastille--neutre">Confirmé</span>
        </li>

        <li className="carte">
          <div>
            <h2>Téléphone</h2>
            <p className="discret">
              {telephone.verifieLe
                ? telephone.telephone
                : 'Un code arrive par SMS. C’est le seul usage que nous faisons des SMS : ils coûtent trop cher pour servir aux rappels.'}
            </p>
          </div>
          <span
            className={
              telephone.verifieLe
                ? 'pastille pastille--verifie'
                : 'pastille pastille--neutre'
            }
          >
            {telephone.verifieLe ? 'Vérifié' : 'À faire'}
          </span>
        </li>

        <li className="carte">
          <div>
            <h2>Pièce d’identité</h2>
            <p className="discret">
              {dejaVerifie
                ? 'Relue par une personne, puis supprimée.'
                : piece
                  ? `Déposée, en attente de relecture. Supprimée dans ${joursAvantSuppression(new Date(piece.deposeeLe), new Date())} jour(s) au plus tard, même si personne ne l’a regardée.`
                  : 'Une personne la regarde, sous 24 heures.'}
            </p>
          </div>
          <span
            className={
              dejaVerifie
                ? 'pastille pastille--verifie'
                : refuse
                  ? 'pastille pastille--refus'
                  : 'pastille pastille--neutre'
            }
          >
            {dejaVerifie
              ? 'Vérifiée'
              : refuse
                ? 'Refusée'
                : piece
                  ? 'En cours'
                  : 'À faire'}
          </span>
        </li>
      </ul>

      {telephone.verifieLe ? null : (
        <>
          <h2 className="titre-section titre-section--aere">
            Vérifier votre téléphone
          </h2>
          <VerificationDuTelephone
            numeroConnu={telephone.telephone}
            codeEnAttente={telephone.codeEnvoyeLe !== null}
          />
        </>
      )}

      <h2 className="titre-section titre-section--aere">
        Vérifier votre identité
      </h2>

      {dejaVerifie ? (
        <>
          <div className="encart encart--verifie">
            <p>
              <strong>Votre identité est vérifiée.</strong> Votre pièce a été
              supprimée : nous ne gardons ni l’image, ni le numéro, seulement le
              fait que la vérification a eu lieu.
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
        </>
      ) : (
        <>
          {refuse ? (
            <div className="encart encart--refus">
              <p>
                <strong>Votre pièce n’a pas pu être validée.</strong> Le motif
                vous a été envoyé par e-mail. Vous pouvez en déposer une autre
                ci-dessous — il n’y a pas de limite au nombre d’essais.
              </p>
            </div>
          ) : null}

          <div className="encart">
            <p>
              <strong>Votre document n’est pas conservé.</strong> Il est chiffré
              dès son arrivée, supprimé dès la vérification, et au plus tard
              après {CONSERVATION_MAXIMALE_JOURS} jours même si personne ne l’a
              regardé. Ni l’image ni le numéro ne sont gardés — seul le résultat
              l’est.
            </p>
          </div>

          {chiffrementDisponible() ? (
            <FormulaireDePiece />
          ) : (
            <div className="encart">
              <p>
                <strong>Le dépôt est momentanément fermé.</strong> La clé de
                chiffrement des pièces n’est pas configurée sur ce serveur, et
                nous préférons fermer la porte plutôt que de stocker une pièce
                d’identité en clair en attendant.
              </p>
            </div>
          )}
        </>
      )}

      <h2 className="titre-section titre-section--aere">
        En attendant, vous pouvez déjà
      </h2>
      <div className="boutons">
        <Link href="/emplacements" className="bouton bouton--discret">
          Voir les emplacements
        </Link>
        <Link href="/fonctionnement" className="bouton bouton--discret">
          Comment ça marche
        </Link>
      </div>
    </div>
  );
}
