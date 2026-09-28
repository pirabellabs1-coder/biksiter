import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Icone } from '@/components/app/icone';
import { photosDeLEmplacement } from '@/lib/depot/photos';
import { lieuDuMembre } from '@/lib/depot/lieux';
import { textes } from '@/lib/i18n/langue';
import { exigerUnMembre } from '@/lib/session';

import { envoyerLesPhotosDuLieu, retirerUnePhotoDuLieu } from '../../actions';
import { RetirerLaPhoto } from './retirer';
import { FormulaireDePhotos } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Photos du lieu') };
}

/** Ce que montre chaque photo, dans l'ordre des cases du formulaire. */
const TITRES_DES_PHOTOS = ['Entrée du lieu', 'Intérieur du lieu', 'Point d’attache'];

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
          {p('Les photos de votre emplacement aident les cyclistes à voir où leur vélo sera accueilli.')}
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
            sansPhoto: nouveau
              ? {
                  bouton: p('Continuer sans photo'),
                  note: p('Les photos sont facultatives : vous pourrez les ajouter plus tard depuis votre espace.'),
                }
              : undefined,
          }}
        />

        {photos.length > 0 ? (
          <div className="pile" style={{ marginTop: 12 }}>
            {photos.map((photo) => {
              const titre = TITRES_DES_PHOTOS[photo.rang] ?? p('Photo {n}', { n: photo.rang + 1 });
              return (
                <RetirerLaPhoto
                  key={photo.rang}
                  action={retirerUnePhotoDuLieu}
                  reference={reference}
                  rang={photo.rang}
                  libelle={p('Retirer « {titre} »', { titre: p(titre) })}
                  confirmation={p('Retirer cette photo ? Elle disparaît aussitôt de votre fiche.')}
                />
              );
            })}
          </div>
        ) : null}

        <div className="encart gris" style={{ marginTop: 12 }}>
          <Icone nom="info" taille={22} />
          <span>
            <strong>{p('Protéger votre adresse')}</strong>
            {p('Cadrez l’emplacement lui-même : un numéro de rue, une plaque ou un visage n’apportent rien aux cyclistes. Les coordonnées GPS des photos sont retirées automatiquement.')}
          </span>
        </div>
      </div>
    </main>
  );
}
