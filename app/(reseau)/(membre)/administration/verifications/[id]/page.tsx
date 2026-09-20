import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { FormulaireDeDecision } from '@/components/app/formulaire-de-decision';
import { Icone } from '@/components/app/icone';
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
  await exigerUnModerateur();
  const { p } = await textes();
  const { id } = await params;
  if (!IDENTIFIANT.test(id)) notFound();
  const aVerifier = await dossier(id);
  if (!aVerifier) notFound();

  const restants = joursAvantSuppression(new Date(aVerifier.deposeeLe), new Date());
  const lien = `/administration/verifications/${id}/piece`;

  const aVerifierPoints = [
    p('La photo est lisible, et le document n’est ni coupé ni flou.'),
    p('Le nom du document correspond à celui du compte.'),
    p('Le document semble authentique : ni capture d’écran, ni montage.'),
  ];

  return (
    <main id="contenu">
      <EnTete p={p} retour="/administration/verifications" cloche={false} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Vérifier une identité')}</h1>
        <p className="sous-titre">
          {p('La pièce d’identité doit être examinée avec attention. Elle sera supprimée dès que votre décision aura été enregistrée.')}
        </p>

        <div className="carte ligne ligne-info" style={{ alignItems: 'center' }}>
          <span className="avatar-app" aria-hidden="true">
            {aVerifier.prenom.charAt(0)}
          </span>
          <span className="ligne-texte">
            <strong>
              {aVerifier.prenom} {aVerifier.nom}
            </strong>
            <span>{aVerifier.email}</span>
          </span>
          <span className="pastille ambre">
            {restants === 0 ? p('Supprimée aujourd’hui') : p('Supprimée dans {n} j', { n: restants })}
          </span>
        </div>

        <h2 className="titre-section">{p('Pièce d’identité')}</h2>
        {aVerifier.typeMime.startsWith('image/') ? (
          // Le document est déchiffré à la volée, sans cache : `next/image` le
          // recopierait et le mettrait en cache.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lien}
            alt={p('Pièce d’identité déposée par {prenom}', { prenom: aVerifier.prenom })}
            style={{ width: '100%', borderRadius: 12, border: '1px solid var(--bord)' }}
          />
        ) : (
          <a href={lien} target="_blank" rel="noreferrer" className="bouton contour">
            <Icone nom="document" taille={20} />
            {p('Ouvrir le PDF')}
          </a>
        )}

        <div className="encart gris" style={{ marginTop: 12 }}>
          <Icone nom="info" taille={20} />
          <span>
            <strong>{p('À vérifier')}</strong>
            {aVerifierPoints.map((point) => (
              <span key={point} style={{ display: 'block' }}>
                · {point}
              </span>
            ))}
            <span style={{ display: 'block', marginTop: 6 }}>
              {p('Aucune donnée du document n’est à recopier : ni numéro, ni date de naissance, ni adresse.')}
            </span>
          </span>
        </div>

        <div style={{ marginTop: 12 }}>
          <FormulaireDeDecision
            action={deciderDeLIdentite.bind(null, id)}
            choix={[
              ['verifiee', p('Approuver'), p('L’identité est confirmée : le membre peut publier un lieu.'), false],
              ['refusee', p('Refuser'), p('La pièce ne permet pas de vérifier l’identité. Le motif est envoyé au membre.'), true],
            ]}
            textes={{
              legende: p('Décision'),
              motif: p('Motif (obligatoire en cas de refus)'),
              aideDuMotif: p('Écrivez-le pour le membre : ce qui manque, et comment renvoyer une pièce valide.'),
              confirmer: p('Enregistrer la décision'),
              envoi: p('Enregistrement…'),
            }}
          />
        </div>
      </div>
    </main>
  );
}
