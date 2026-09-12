import Link from 'next/link';

import CreneauxDuJour from '@/components/creneaux-du-jour';
import IconeCaracteristique, {
  type Pictogramme,
} from '@/components/icone-caracteristique';
import ZoneApproximative from '@/components/zone-approximative';
import type { AvisAffiche } from '@/lib/depot/avis';
import type {
  FicheDEmplacement,
  SignauxDeConfiance,
} from '@/lib/depot/emplacements';
import type { PhotoRangee } from '@/lib/depot/photos';
import type { Creneau } from '@/lib/regles/capacite';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';
import { SUJETS_DES_PHOTOS } from '@/lib/regles/photos';
import { typeVeloDansUnePhrase } from '@/lib/regles/velos';
import { enJour } from '@/lib/temps';

/**
 * La fiche d'un emplacement, telle que la maquette la pose.
 *
 * Une suite de panneaux, chacun avec son titre à pictogramme : qui accueille,
 * quand c'est libre, ce que c'est, où c'est à peu près, ce qu'en ont dit les
 * cyclistes. Et une barre d'action collée en bas, parce que l'écran est long
 * et que la seule chose qu'on vient y faire ne doit jamais sortir de vue.
 */
export default function Fiche({
  fiche,
  signaux,
  photos,
  avis,
  creneaux,
  jour,
  peutDemander,
}: {
  fiche: FicheDEmplacement;
  signaux: SignauxDeConfiance | null;
  photos: PhotoRangee[];
  avis: AvisAffiche[];
  creneaux: Creneau[];
  jour: Date;
  peutDemander: boolean;
}) {
  const jetons = [
    { pictogramme: 'prive' as const, texte: fiche.type },
    { pictogramme: 'abri' as const, texte: INTEMPERIES[fiche.intemperie] },
    {
      pictogramme: 'capacite' as const,
      texte:
        fiche.capacite > 1
          ? `Jusqu’à ${fiche.capacite} vélos`
          : 'Un vélo à la fois',
    },
  ];

  const caracteristiques: {
    pictogramme: Pictogramme;
    libelle: string;
    valeur: React.ReactNode;
  }[] = [
    {
      pictogramme: 'prive',
      libelle: 'Type de lieu',
      valeur: fiche.type,
    },
    {
      pictogramme: 'fermeture',
      libelle: 'Verrouillage',
      valeur: VERROUILLAGES[fiche.verrouillage],
    },
    {
      pictogramme: 'abri',
      libelle: 'Protection contre les intempéries',
      valeur: INTEMPERIES[fiche.intemperie],
    },
    { pictogramme: 'acces', libelle: 'Accès', valeur: fiche.acces },
    { pictogramme: 'ancrage', libelle: 'Ancrage', valeur: fiche.ancrage },
    {
      pictogramme: 'capacite',
      libelle: 'Vélos accueillis',
      valeur: (
        <ul className="mini-jetons">
          {fiche.velosAcceptes.map((velo) => (
            <li key={velo}>{velo}</li>
          ))}
        </ul>
      ),
    },
    ...(fiche.services.length > 0
      ? [
          {
            pictogramme: 'journal' as const,
            libelle: 'Services rendus sur place',
            valeur: (
              <ul className="mini-jetons">
                {fiche.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="fiche">
      {photos.length === 0 ? null : (
        <div className="galerie">
          <ul className="galerie__piste">
            {photos.map((photo) => (
              <li key={photo.rang} className="galerie__vue">
                {/* eslint-disable-next-line @next/next/no-img-element --
                    La photo est servie déjà redimensionnée et ré-encodée par le
                    dépôt, précisément pour n'avoir plus aucune métadonnée. La
                    repasser dans l'optimiseur n'apporterait rien. */}
                <img
                  src={`/emplacements/${fiche.reference}/photo/${photo.rang}`}
                  alt={
                    SUJETS_DES_PHOTOS[photo.rang] ?? 'Photo de l’emplacement'
                  }
                  width={photo.largeur}
                  height={photo.hauteur}
                />
                <span className="galerie__legende">
                  {SUJETS_DES_PHOTOS[photo.rang] ?? 'L’emplacement'}
                </span>
              </li>
            ))}
          </ul>
          {photos.length > 1 ? (
            <p className="galerie__compte">
              {photos.length} photos — faites défiler
            </p>
          ) : null}
        </div>
      )}

      <div className="fiche__colonnes">
        <div className="fiche__corps">
          <section className="panneau panneau--pose">
            <div className="panneau__corps">
              {signaux?.identiteVerifiee ? (
                <p className="pastille pastille--verifie">
                  Identité vérifiée par une personne de l’association
                </p>
              ) : (
                <p className="pastille pastille--attente">
                  Identité en cours de vérification
                </p>
              )}

              <p className="fiche__lieu">
                <IconeCaracteristique pictogramme="carte" />
                {fiche.quartier}
              </p>

              <h1 className="fiche__titre">
                {fiche.type} · quartier {fiche.quartier}
              </h1>

              <ul className="caracteres">
                {jetons.map((jeton) => (
                  <li key={jeton.texte} className="caractere">
                    <IconeCaracteristique pictogramme={jeton.pictogramme} />
                    {jeton.texte}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="panneau">
            <div className="panneau__corps fiche__hote">
              <span className="jeton-initiale" aria-hidden="true">
                {fiche.prenomDuBikeSitter.charAt(0)}
              </span>
              <div>
                <p className="fiche__hote-nom">
                  {fiche.prenomDuBikeSitter}
                  <span className="pastille pastille--neutre pastille--sans-puce">
                    Bike sitter
                  </span>
                </p>
                {/* Des faits, pas une réputation : ces nombres ne trient rien
                    et ne se comparent à ceux de personne (règle 3). */}
                {signaux ? (
                  <p className="discret">
                    Membre depuis {signaux.membreDepuis}
                    {signaux.gardesAccueillies > 0
                      ? ` · ${signaux.gardesAccueillies} vélo${signaux.gardesAccueillies > 1 ? 's' : ''} accueilli${signaux.gardesAccueillies > 1 ? 's' : ''}`
                      : ' · premier accueil à venir'}
                  </p>
                ) : null}
              </div>
            </div>

            {fiche.precisions ? (
              <div className="panneau__corps fiche__mot">
                <p className="fiche__mot-titre">
                  <IconeCaracteristique pictogramme="message" />
                  Mot d’accueil de {fiche.prenomDuBikeSitter}
                </p>
                <blockquote>{fiche.precisions}</blockquote>
              </div>
            ) : null}
          </section>

          <section className="panneau">
            <div className="panneau__entete">
              <h2>
                <IconeCaracteristique pictogramme="calendrier" />
                Disponibilités aujourd’hui
              </h2>
              <span className="discret">{enJour(jour)}</span>
            </div>
            <div className="panneau__corps">
              <CreneauxDuJour
                jour={jour}
                acceptes={creneaux}
                capacite={fiche.capacite}
              />
            </div>
          </section>

          <section className="panneau">
            <div className="panneau__entete">
              <h2>
                <IconeCaracteristique pictogramme="journal" />
                Caractéristiques de l’emplacement
              </h2>
            </div>
            <div className="panneau__corps">
              <ul className="caracteristiques">
                {caracteristiques.map((caracteristique) => (
                  <li key={caracteristique.libelle}>
                    <IconeCaracteristique
                      pictogramme={caracteristique.pictogramme}
                    />
                    <div>
                      <span className="caracteristiques__libelle">
                        {caracteristique.libelle}
                      </span>
                      <span className="caracteristiques__valeur">
                        {caracteristique.valeur}
                      </span>
                    </div>
                  </li>
                ))}
                <li>
                  <IconeCaracteristique pictogramme="identite" />
                  <div>
                    <span className="caracteristiques__libelle">
                      Nature du lieu
                    </span>
                    <span className="caracteristiques__valeur">
                      Emplacement privé, non partagé avec d’autres résidents
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="panneau">
            <div className="panneau__entete">
              <h2>
                <IconeCaracteristique pictogramme="carte" />
                Périmètre de localisation
              </h2>
              <span className="discret">
                rayon d’environ {fiche.rayonDeLaZone} m
              </span>
            </div>
            <div className="panneau__corps">
              <figure className="perimetre">
                <ZoneApproximative
                  taches={[
                    { latitude: fiche.latitude, longitude: fiche.longitude },
                  ]}
                />
                <figcaption>
                  Rayon indicatif de {fiche.rayonDeLaZone} mètres
                </figcaption>
              </figure>

              <p className="encart">
                Pour préserver la vie privée de {fiche.prenomDuBikeSitter},
                l’adresse exacte et les consignes d’accès vous sont transmises
                dès que votre demande est acceptée.
              </p>
            </div>
          </section>

          <section className="panneau">
            <div className="panneau__entete">
              <h2>
                <IconeCaracteristique pictogramme="message" />
                Mots de cyclistes accueillis
              </h2>
              {avis.length > 0 ? (
                <span className="discret">
                  {avis.length === 1 ? '1 récit' : `${avis.length} récits`}
                </span>
              ) : null}
            </div>

            {avis.length === 0 ? (
              <div className="vide">
                <IconeCaracteristique pictogramme="message" />
                <p>
                  Les premiers récits apparaîtront ici. Après chaque
                  stationnement, le cycliste peut partager quelques mots sur son
                  expérience.
                </p>
              </div>
            ) : (
              <div className="panneau__corps">
                <ul className="recits">
                  {avis.map((un) => (
                    <li key={un.id} className="recit">
                      <blockquote>{un.corps}</blockquote>
                      <p className="recit__signature">
                        <span
                          className="jeton-initiale jeton-initiale--petit"
                          aria-hidden="true"
                        >
                          {un.prenomDeLAuteur.charAt(0)}
                        </span>
                        <strong>{un.prenomDeLAuteur}</strong>
                        <span className="discret">
                          {typeVeloDansUnePhrase(un.typeVelo)} ·{' '}
                          {enJour(new Date(un.ecritLe))}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className="fiche__aside">
          <div className="panneau">
            <div className="panneau__corps">
              <p className="fiche__prix">Gratuit</p>
              <p className="discret">
                Le stationnement est entièrement gratuit, pour vous comme pour{' '}
                {fiche.prenomDuBikeSitter}. Bike Sitters est une association à
                but non lucratif.
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
                    Pour envoyer une demande, il vous faut un compte vérifié.
                    Cette vérification permet à {fiche.prenomDuBikeSitter}{' '}
                    d’accueillir votre vélo en toute confiance.
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
                    Rejoindre la liste d’attente
                  </Link>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* La barre collée en bas ne sert que sur un écran étroit, où l'aside est
          passé sous un mètre de contenu. */}
      <div className="barre-collee">
        <div>
          <strong>Gratuit</strong>
          <span className="discret"> — entraide entre voisins</span>
        </div>
        <Link
          href={
            peutDemander
              ? `/emplacements/${fiche.reference}/demande`
              : '/invitation'
          }
          className="bouton bouton--principal"
        >
          {peutDemander ? 'Demander' : 'Rejoindre'}
        </Link>
      </div>
    </div>
  );
}
