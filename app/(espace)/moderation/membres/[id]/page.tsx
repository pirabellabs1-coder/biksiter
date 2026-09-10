import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import EnteteDePage from '@/components/espace/entete-de-page';
import IconeCaracteristique from '@/components/icone-caracteristique';
import { dossier } from '@/lib/depot/moderation';
import { joursAvantSuppression } from '@/lib/regles/pieces';
import { exigerUnModerateur } from '@/lib/session';
import { enFrancais } from '@/lib/temps';

import FormulaireDeDecision from './formulaire';

export const metadata: Metadata = { title: 'Examiner une pièce' };
export const dynamic = 'force-dynamic';

/** Ce qu'on regarde, et rien d'autre. */
const A_VERIFIER = [
  'La photo est lisible, et le document n’est ni coupé ni flou.',
  'Le nom du document correspond à celui du compte.',
  'Le document a l’air authentique — pas une photo d’écran, pas un montage.',
];

/** Ce qu'on ne fait pas, et qui mérite d'être écrit noir sur blanc. */
const A_NE_PAS_FAIRE = [
  'Ne recopiez ni le numéro de pièce, ni la date de naissance, ni l’adresse.',
  'Ne jugez pas la personne : vous vérifiez un document, pas quelqu’un.',
  'N’enregistrez pas le fichier. Il disparaît dès que vous aurez tranché.',
];

export default async function ExaminerUnePiece({
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
    <>
      <EnteteDePage
        surtitre="Modération"
        titre={`${aVerifier.prenom} ${aVerifier.nom}`}
        phrase="Vous regardez une pièce d’identité. C’est ce que la règle 2 confie à une personne, et cette personne c’est vous."
        actions={
          <Link href="/moderation" className="bouton bouton--discret">
            Retour à la file
          </Link>
        }
      />

      <div className="panneaux panneaux--deux">
        <section className="panneau">
          <div className="panneau__entete">
            <h2>
              <IconeCaracteristique pictogramme="identite" />
              Le document
            </h2>
            <span
              className={
                restants === 0
                  ? 'pastille pastille--refus'
                  : 'pastille pastille--attente'
              }
            >
              {restants === 0
                ? 'supprimé d’un instant à l’autre'
                : `supprimé dans ${restants} jour${restants > 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="panneau__corps">
            {estUneImage ? (
              /* eslint-disable-next-line @next/next/no-img-element --
                 Le document est déchiffré à la volée et ne doit être ni mis en
                 cache, ni optimisé, ni recopié sur disque : `next/image` ferait
                 exactement l'inverse. */
              <img
                src={`/moderation/membres/${id}/piece`}
                alt={`Pièce d’identité déposée par ${aVerifier.prenom} ${aVerifier.nom}`}
                className="piece-examinee"
              />
            ) : (
              <div className="vide">
                <IconeCaracteristique pictogramme="journal" />
                <p>
                  Ce document est un PDF. Il s’ouvre dans un onglet, et ce
                  onglet-là non plus ne le met pas en cache.
                </p>
                <div className="boutons">
                  <a
                    href={`/moderation/membres/${id}/piece`}
                    className="bouton bouton--discret"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir le PDF
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="panneaux">
          <section className="panneau">
            <div className="panneau__entete">
              <h2>
                <IconeCaracteristique pictogramme="compte" />
                Le compte
              </h2>
            </div>
            <div className="panneau__corps">
              <dl className="details">
                <div>
                  <dt>Nom du compte</dt>
                  <dd>
                    {aVerifier.prenom} {aVerifier.nom}
                  </dd>
                </div>
                <div>
                  <dt>Adresse e-mail</dt>
                  <dd>{aVerifier.email}</dd>
                </div>
                <div>
                  <dt>Pièce déposée</dt>
                  <dd>{enFrancais(new Date(aVerifier.deposeeLe))}</dd>
                </div>
                <div>
                  <dt>Poids du fichier</dt>
                  <dd>{Math.round(aVerifier.tailleEnOctets / 1024)} Ko</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="panneau">
            <div className="panneau__entete">
              <h2>
                <IconeCaracteristique pictogramme="journal" />
                Ce que vous vérifiez
              </h2>
            </div>
            <div className="panneau__corps">
              <ul className="marques">
                {A_VERIFIER.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <p className="consigne">
                <strong>Et ce que vous ne faites pas.</strong>
              </p>
              <ul className="marques">
                {A_NE_PAS_FAIRE.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <section className="panneau panneau--decision">
        <div className="panneau__entete">
          <h2>
            <IconeCaracteristique pictogramme="identite" />
            Votre décision
          </h2>
        </div>
        <div className="panneau__corps">
          <FormulaireDeDecision membreId={id} prenom={aVerifier.prenom} />
        </div>
      </section>
    </>
  );
}
