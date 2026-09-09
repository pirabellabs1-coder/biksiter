import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BaseNonBranchee from '@/components/base-non-branchee';
import FriseDeDisponibilite from '@/components/frise-de-disponibilite';
import IconeCaracteristique, {
  type Pictogramme,
} from '@/components/icone-caracteristique';
import ZoneApproximative from '@/components/zone-approximative';
import { baseConfiguree } from '@/lib/bd/client';
import { avisDeLEmplacement } from '@/lib/depot/avis';
import {
  creneauxAcceptesDuJour,
  ficheParReference,
  signauxDeLEmplacement,
} from '@/lib/depot/emplacements';
import { photosDeLEmplacement } from '@/lib/depot/photos';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';
import { SUJETS_DES_PHOTOS } from '@/lib/regles/photos';
import { peutDemanderUnStationnement } from '@/lib/regles/publication';
import { membrePourLesRegles } from '@/lib/session';
import { enJour } from '@/lib/temps';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  if (!baseConfiguree()) {
    return { title: 'Emplacement' };
  }

  const { reference } = await params;
  const fiche = await ficheParReference(reference);

  if (!fiche) {
    return { title: 'Emplacement introuvable' };
  }

  return {
    title: `${fiche.type} à ${fiche.quartier}`,
    description: `${fiche.type} chez ${fiche.prenomDuBikeSitter}, à quelques centaines de mètres de ${fiche.quartier}. Gratuit, entre membres vérifiés.`,
  };
}

export default async function FicheEmplacement({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  if (!baseConfiguree()) {
    return (
      <div className="page page--lecture">
        <h1 className="titre-page">Emplacement</h1>
        <BaseNonBranchee />
      </div>
    );
  }

  const { reference } = await params;

  // La fiche vient de la vue `emplacement_visible` : ni adresse exacte, ni
  // position exacte n'existent dans cet objet (règle 4).
  const fiche = await ficheParReference(reference);
  if (!fiche) {
    notFound();
  }

  const aujourdhui = new Date();

  const [signaux, photos, avis, creneaux, membre] = await Promise.all([
    signauxDeLEmplacement(reference),
    photosDeLEmplacement(reference),
    avisDeLEmplacement(reference),
    creneauxAcceptesDuJour(reference, aujourdhui),
    membrePourLesRegles(),
  ]);

  const peutDemander = peutDemanderUnStationnement(membre);

  const caracteristiques: { pictogramme: Pictogramme; texte: string }[] = [
    { pictogramme: 'fermeture', texte: VERROUILLAGES[fiche.verrouillage] },
    { pictogramme: 'abri', texte: INTEMPERIES[fiche.intemperie] },
    { pictogramme: 'ancrage', texte: fiche.ancrage },
    { pictogramme: 'acces', texte: fiche.acces },
    {
      pictogramme: 'capacite',
      texte: `${fiche.capacite} vélo${fiche.capacite > 1 ? 's' : ''} · ${fiche.velosAcceptes.join(', ').toLowerCase()}`,
    },
    {
      pictogramme: 'prive',
      texte: 'Emplacement privé, non partagé avec d’autres résidents',
    },
  ];

  return (
    <div className="page">
      <nav aria-label="Fil d’Ariane" className="fil-ariane">
        <Link href="/emplacements">Emplacements</Link>
        <span aria-hidden="true"> › </span>
        <span>{fiche.quartier}</span>
        <span aria-hidden="true"> › </span>
        <span>{fiche.type}</span>
      </nav>

      {photos.length > 0 ? (
        <div className="photos">
          {photos.map((photo) => (
            /* eslint-disable-next-line @next/next/no-img-element --
               La photo est servie déjà redimensionnée et ré-encodée par le
               dépôt, précisément pour n'avoir plus aucune métadonnée. La
               repasser dans l'optimiseur d'images n'apporterait rien. */
            <img
              key={photo.rang}
              src={`/emplacements/${reference}/photo/${photo.rang}`}
              alt={SUJETS_DES_PHOTOS[photo.rang] ?? 'Photo de l’emplacement'}
              width={photo.largeur}
              height={photo.hauteur}
            />
          ))}
        </div>
      ) : null}

      <div className="fiche">
        <div>
          <h1 className="titre-page">
            {fiche.type} à {fiche.quartier}
          </h1>

          {/* Les signaux tiennent sur une ligne de texte gris. Ce sont des
              compteurs : rien dans le produit ne trie les emplacements par
              ces nombres (règle 3). */}
          {signaux ? (
            <p className="signaux">
              {signaux.identiteVerifiee ? 'Identité vérifiée' : 'En vérification'}
              {signaux.gardesAccueillies > 0
                ? ` · ${signaux.gardesAccueillies} garde${signaux.gardesAccueillies > 1 ? 's' : ''}`
                : ''}
              {signaux.nombreDAvis > 0
                ? ` · ${signaux.nombreDAvis} avis`
                : ''}
              {` · membre depuis ${signaux.membreDepuis}`}
            </p>
          ) : null}

          {fiche.precisions ? (
            <blockquote className="mot">{fiche.precisions}</blockquote>
          ) : null}

          <FriseDeDisponibilite
            jour={aujourdhui}
            acceptes={creneaux}
            capacite={fiche.capacite}
          />

          <ul className="caracteristiques">
            {caracteristiques.map((caracteristique) => (
              <li key={caracteristique.pictogramme}>
                <IconeCaracteristique
                  pictogramme={caracteristique.pictogramme}
                />
                {caracteristique.texte}
              </li>
            ))}
          </ul>

          <h2 className="titre-section titre-section--aere">
            Où se trouve l’emplacement
          </h2>
          <p className="discret">
            La carte montre une zone d’environ {fiche.rayonDeLaZone} mètres.
            L’adresse exacte vous sera donnée par {fiche.prenomDuBikeSitter} si
            votre demande est acceptée.
          </p>
          <ZoneApproximative
            taches={[{ latitude: fiche.latitude, longitude: fiche.longitude }]}
          />

          {avis.length > 0 ? (
            <>
              <h2 className="titre-section titre-section--aere">
                Ce qu’en disent les membres
              </h2>
              <ul className="avis">
                {avis.map((un) => (
                  <li key={un.id}>
                    <p>{un.corps}</p>
                    <p className="discret">
                      {un.prenomDeLAuteur} · {un.typeVelo.toLowerCase()} ·{' '}
                      {enJour(new Date(un.ecritLe))}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <aside className="carte fiche__aside">
          <p className="fiche__prix">Gratuit</p>
          <p className="discret">
            Aucun paiement, ni sur le site ni en direct. C’est une association.
          </p>

          {peutDemander ? (
            <Link
              href={`/emplacements/${fiche.reference}/demande`}
              className="bouton bouton--principal bouton--large"
            >
              Demander un stationnement
            </Link>
          ) : (
            <>
              <p className="discret">
                Demander suppose un compte dont l’identité a été vérifiée :
                c’est la contrepartie de ce qu’on demande à{' '}
                {fiche.prenomDuBikeSitter}.
              </p>
              <Link
                href="/invitation"
                className="bouton bouton--principal bouton--large"
              >
                J’ai une invitation
              </Link>
              <Link
                href="/liste-attente"
                className="bouton bouton--discret bouton--large fiche__second"
              >
                Je n’en ai pas
              </Link>
            </>
          )}

          <hr className="fiche__separateur" />

          <p className="discret">
            <strong>{fiche.quartier}</strong>
            <br />
            L’adresse exacte vous est communiquée une fois votre demande
            acceptée — et elle n’apparaît nulle part avant.
          </p>
        </aside>
      </div>
    </div>
  );
}
