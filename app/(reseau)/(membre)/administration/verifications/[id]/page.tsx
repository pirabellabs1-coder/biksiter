import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { FormulaireDeDecision } from '@/components/app/formulaire-de-decision';
import { PhotoAgrandissable } from '@/components/app/photo-agrandissable';
import { dossier } from '@/lib/depot/moderation';
import { textes } from '@/lib/i18n/langue';
import { joursAvantSuppression } from '@/lib/regles/pieces';
import { exigerUnModerateur } from '@/lib/session';

import { deciderDeLIdentite } from '../../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Examiner une pièce') };
}

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ExaminerUnePiece({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const { id } = await params;
  if (!IDENTIFIANT.test(id)) notFound();
  const aVerifier = await dossier(id);
  if (!aVerifier) notFound();

  const restants = joursAvantSuppression(new Date(aVerifier.deposeeLe), new Date());
  const lien = `/administration/verifications/${id}/piece`;
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  const aVerifierPoints = [
    p('La photo est lisible et le document n’est ni coupé, ni flou.'),
    p('Le nom du document correspond à celui du compte.'),
    p(
      'Le document paraît authentique et ne présente ni signe de capture d’écran, ni signe de montage.',
    ),
  ];

  return (
    <main id="contenu">
      <EnTeteDeModeration
        retour="/administration/verifications"
        initiales={initiales}
      />
      <div className="page page-etroite">
        <header className="page-tete">
          <span className="kicker">DOSSIER D’IDENTITÉ</span>
          <h1>{p('Vérifier une identité')}</h1>
          <p>
            {p(
              'La pièce est examinée avec attention. Elle sera supprimée dès que la décision aura été enregistrée.',
            )}
          </p>
        </header>

        <article className="mod-carte">
          <div className="mod-tete">
            <span className="mod-etat attente">
              {restants === 0
                ? p('Supprimée aujourd’hui')
                : p('Supprimée dans {n} j', { n: restants })}
            </span>
            <span className="gris">{aVerifier.email}</span>
          </div>
          <h3>
            {aVerifier.prenom} {aVerifier.nom}
          </h3>
          <p className="gris">
            {p(
              'La pièce n’est visible ici que le temps de la décision. Elle est déchiffrée à la volée et n’est mise en cache nulle part.',
            )}
          </p>

          {aVerifier.typeMime.startsWith('image/') ? (
            // La pièce s'ouvre en grand : un nom ou une date se lisent mal
            // sur une vignette.
            <PhotoAgrandissable
              src={lien}
              alt={p('Pièce d’identité déposée par {prenom}', {
                prenom: aVerifier.prenom,
              })}
              fermer={p('Fermer la photo')}
              classe="photo-dossier photo-piece"
            />
          ) : (
            <div className="actions-fin">
              <a
                href={lien}
                target="_blank"
                rel="noreferrer"
                className="outline"
              >
                {p('Ouvrir le PDF')}
              </a>
            </div>
          )}
        </article>

        <article className="mod-carte">
          <div className="mod-tete">
            <span className="mod-etat">{p('À vérifier')}</span>
          </div>
          <ul className="liste-nette">
            {aVerifierPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="gris" style={{ marginTop: 12 }}>
            {p(
              'Aucune information du document ne doit être recopiée : ni le numéro, ni la date de naissance, ni l’adresse.',
            )}
          </p>
        </article>

        <section className="bloc">
          <h2>{p('Décision')}</h2>
          <FormulaireDeDecision
            action={deciderDeLIdentite.bind(null, id)}
            choix={[
              [
                'verifiee',
                p('Approuver'),
                p('L’identité est confirmée : le membre peut publier un lieu.'),
                false,
              ],
              [
                'refusee',
                p('Refuser'),
                p(
                  'La pièce ne permet pas de vérifier l’identité. Le motif est envoyé au membre.',
                ),
                true,
              ],
            ]}
            textes={{
              motif: p('Motif (obligatoire en cas de refus)'),
              aideDuMotif: p(
                'Ce motif est communiqué au membre. Il est utile d’y préciser ce qui manque et la façon de renvoyer une pièce valide.',
              ),
              confirmer: p('Enregistrer la décision'),
              envoi: p('Enregistrement…'),
            }}
          />
        </section>
      </div>
    </main>
  );
}
