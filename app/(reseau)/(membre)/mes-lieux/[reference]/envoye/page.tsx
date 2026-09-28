import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { lieuDuMembre, mesLieux } from '@/lib/depot/lieux';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { exigerUnMembre } from '@/lib/session';

export const metadata: Metadata = { title: 'Emplacement en ligne' };

/** La fin du parcours : ce qui est fait, ce qui s'examine, ce qui vient. */
export default async function EmplacementEnLigne({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const membre = await exigerUnMembre();
  const { reference } = await params;
  const [lieu, _lieux, _nonLues] = await Promise.all([
    lieuDuMembre(membre.id, reference),
    mesLieux(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);
  if (!lieu) notFound();

  const classeDeLEtape = (fait: boolean, enCours: boolean) =>
    fait ? 'fait' : enCours ? 'encours' : undefined;

  return (
    <main id="contenu">
      <div className="dashboard-wrap" id="bsenvoye">
        <h1>
          {lieu.publie ? 'Votre emplacement est en ligne' : 'Votre emplacement est prêt'}
        </h1>
        <p className="bs-intro">
          {lieu.publie
            ? 'Les cyclistes du quartier peuvent maintenant vous envoyer une demande. Vous restez libre d’accepter ou de refuser chacune, et vous pouvez mettre l’accueil en pause à tout moment.'
            : 'Il sera publié dès que les étapes ci-dessous seront terminées. Rien d’autre ne vous est demandé.'}
        </p>

        {/* Ce qui se passe réellement : l'identité vérifiée par une personne
            (règle 2) est la seule validation humaine ; ensuite, la
            publication est immédiate. */}
        <ol className="suivi">
          <li className={classeDeLEtape(lieu.identiteVerifiee, true)}>
            <b>
              {lieu.identiteVerifiee
                ? 'Identité vérifiée'
                : 'Identité en cours de vérification'}
            </b>
            <span>
              {lieu.identiteVerifiee
                ? 'Votre pièce a été regardée par une personne, puis supprimée.'
                : 'Une personne de l’association regarde votre pièce, puis la supprime. Vous recevez une notification dès que c’est fait.'}
            </span>
          </li>
          {/* Les photos ne conditionnent pas la publication : l'étape est
              faite, et l'invitation à en ajouter vient sous la liste. */}
          <li className="fait">
            <b>Emplacement décrit</b>
            <span>
              {lieu.nombreDePhotos > 0
                ? 'Le lieu, ses accès et ses photos sont enregistrés.'
                : 'Le lieu et ses accès sont enregistrés.'}
            </span>
          </li>
          <li className={classeDeLEtape(lieu.publie, lieu.identiteVerifiee)}>
            <b>{lieu.publie ? 'Publié' : 'Publication'}</b>
            <span>
              {lieu.publie
                ? 'Votre emplacement apparaît dans les recherches, dans une zone approximative.'
                : 'Automatique dès que votre identité est vérifiée.'}
            </span>
          </li>
        </ol>

        {lieu.nombreDePhotos === 0 ? (
          <p className="prog-note">
            Ajoutez quelques photos de l’emplacement : les cyclistes
            choisissent plus volontiers un lieu qu’ils peuvent voir.
          </p>
        ) : null}
        {lieu.nombreDePhotos === 0 ? (
          <Link className="primary bs-cta" href={`/mes-lieux/${reference}/photos`}>
            Ajouter les photos
          </Link>
        ) : !lieu.identiteVerifiee ? (
          <Link className="primary bs-cta" href="/profil/verifications">
            Suivre ma vérification
          </Link>
        ) : (
          <Link className="primary bs-cta" href="/accueil">
            Aller à mon espace Bike Sitter
          </Link>
        )}
        {lieu.publie ? (
          <Link className="outline bs-cta" href={`/emplacements/${reference}`}>
            Voir ma fiche telle que la voient les cyclistes
          </Link>
        ) : null}
      </div>
    </main>
  );
}
