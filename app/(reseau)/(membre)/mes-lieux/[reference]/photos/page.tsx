import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { photosDeLEmplacement } from '@/lib/depot/photos';
import { lieuDuMembre } from '@/lib/depot/lieux';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { envoyerLesPhotosDuLieu, retirerUnePhotoDuLieu } from '../../actions';
import { FormulaireDePhotos } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Photos du lieu') };
}

export default async function PhotosDuLieu({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { reference } = await params;
  const nouveau = (await searchParams).nouveau === '1';
  const lieu = await lieuDuMembre(membre.id, reference);
  if (!lieu) notFound();
  const photos = await photosDeLEmplacement(reference);

  return (
    <main id="contenu">
      <EnTete p={p} retour={nouveau ? '/mes-lieux' : `/mes-lieux/${reference}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        {nouveau ? (
          <div className="etapes-app">
            <span>{p('Photos')}</span>
            <span className="barre" aria-hidden="true">
              <span style={{ width: '66%' }} />
            </span>
            <span>2 / 3</span>
          </div>
        ) : null}
        <h1 className="titre-ecran">{p('Photos du lieu')}</h1>
        <p className="sous-titre">
          {p('Ajoutez des photos claires pour rassurer les cyclistes. Évitez toute information sensible.')}
        </p>

        <FormulaireDePhotos
          action={envoyerLesPhotosDuLieu.bind(null, reference, nouveau)}
          reference={reference}
          existantes={photos.map((photo) => photo.rang)}
          textes={{
            cases: [
              [p('Entrée du lieu'), p('Montrez l’accès depuis la rue ou la cour.')],
              [p('Intérieur du lieu'), p('Montrez l’espace disponible et son état général.')],
              [p('Point d’attache'), p('Montrez où les vélos peuvent être attachés.')],
            ],
            choisir: p('Ajouter'),
            remplacer: p('Remplacer'),
            envoyer: nouveau ? p('Étape suivante') : p('Enregistrer les photos'),
            envoi: p('Envoi…'),
          }}
        />

        {photos.length > 0 ? (
          <div className="pile" style={{ marginTop: 12 }}>
            {photos.map((photo) => (
              <form key={photo.rang} action={retirerUnePhotoDuLieu}>
                <input type="hidden" name="reference" value={reference} />
                <input type="hidden" name="rang" value={photo.rang} />
                <button type="submit" className="bouton discret texte-rouge">
                  <Icone nom="corbeille" taille={18} />
                  {p('Retirer la photo {n}', { n: photo.rang + 1 })}
                </button>
              </form>
            ))}
          </div>
        ) : null}

        <div className="encart bleu" style={{ marginTop: 12 }}>
          <Icone nom="info" taille={22} />
          <span>
            <strong>{p('Conseils de confidentialité')}</strong>
            {p('Ne montrez ni numéro de rue, ni plaque d’immatriculation, ni visage. Les coordonnées GPS des photos sont retirées automatiquement.')}
          </span>
        </div>

        {nouveau ? (
          <Link href={`/mes-lieux/${reference}/disponibilites?nouveau=1`} className="bouton discret">
            {p('Passer cette étape')}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
