import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { dossier } from '@/lib/depot/moderation';
import { joursAvantSuppression } from '@/lib/regles/pieces';
import { exigerUnModerateur } from '@/lib/session';
import { enFrancais } from '@/lib/temps';

import FormulaireDeDecision from './formulaire';

export const metadata: Metadata = { title: 'Examiner une pièce' };
export const dynamic = 'force-dynamic';

export default async function ExaminerUneePiece({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigerUnModerateur();

  const { id } = await params;
  const aVerifier = await dossier(id);

  if (!aVerifier) {
    notFound();
  }

  const restants = joursAvantSuppression(
    new Date(aVerifier.deposeeLe),
    new Date(),
  );
  const estUneImage = aVerifier.typeMime.startsWith('image/');

  return (
    <div className="page page--lecture">
      <p className="surtitre">
        <Link href="/moderation" className="lien">
          Retour à la file
        </Link>
      </p>

      <h1 className="titre-page">
        {aVerifier.prenom} {aVerifier.nom}
      </h1>

      <dl className="details carte">
        <div>
          <dt>Compte</dt>
          <dd>{aVerifier.email}</dd>
        </div>
        <div>
          <dt>Pièce déposée</dt>
          <dd>{enFrancais(new Date(aVerifier.deposeeLe))}</dd>
        </div>
        <div>
          <dt>Suppression automatique</dt>
          <dd>
            {restants === 0 ? 'imminente' : `dans ${restants} jour(s)`}
          </dd>
        </div>
      </dl>

      <h2 className="titre-section titre-section--aere">Le document</h2>

      {estUneImage ? (
        /* eslint-disable-next-line @next/next/no-img-element --
           Le document est déchiffré à la volée et ne doit être ni mis en cache,
           ni optimisé, ni recopié sur disque : `next/image` ferait exactement
           l'inverse. */
        <img
          src={`/moderation/membres/${id}/piece`}
          alt={`Pièce d’identité déposée par ${aVerifier.prenom} ${aVerifier.nom}`}
          className="piece-examinee"
        />
      ) : (
        <p>
          <a
            href={`/moderation/membres/${id}/piece`}
            className="bouton bouton--discret"
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir le PDF dans un onglet
          </a>
        </p>
      )}

      <div className="encart">
        <p>
          <strong>Ne recopiez rien.</strong> Ni le numéro de pièce, ni la date
          de naissance, ni l’adresse qui y figure. On ne conserve que le fait
          que la vérification a eu lieu — c’est ce qui est promis sur le site,
          et le document disparaît dès que vous aurez tranché.
        </p>
      </div>

      <h2 className="titre-section titre-section--aere">Votre décision</h2>
      <FormulaireDeDecision membreId={id} prenom={aVerifier.prenom} />
    </div>
  );
}
