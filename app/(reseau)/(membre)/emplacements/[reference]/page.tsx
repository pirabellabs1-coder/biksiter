import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Avatar } from '@/components/app/avatar';
import { Icone } from '@/components/app/icone';
import { DemandeDeGarde } from '@/components/maquette/resultats/demande-de-garde';
import { Galerie } from '@/components/maquette/resultats/galerie';
import {
  distanceEcrite,
  photoDeLEspace,
} from '@/components/maquette/resultats/modele';
import { estEnFavori } from '@/lib/depot/favoris';
import { velosDuMembre } from '@/lib/depot/membre-espace';
import { photosDeLEmplacement } from '@/lib/depot/photos';
import { ficheDuReseau, horairesDe } from '@/lib/depot/reseau';
import { textes } from '@/lib/i18n/langue';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import {
  ajouterJours,
  horairesDuJour,
  jourAffiche,
  minutesDe,
} from '@/lib/regles/creneau';
import { distanceEnMetres } from '@/lib/regles/distance';
import { TYPES_VELO } from '@/lib/regles/velos';
import {
  avecLesHeuresChoisies,
  heuresDansLAccueil,
  plagesDAccueil,
} from '@/lib/regles/heures-proposees';
import {
  lireLaRecherche,
  parametresDeLaRecherche,
  HEURES,
} from '@/lib/recherche-courante';
import { exigerUnMembre } from '@/lib/session';

import { basculerUnFavori } from '../../favoris/actions';

/*
 * La note suit le même seuil partout (liste, fiche, demande) : celui de la
 * règle des avis. Pas de badge « Top » ici : on n'apparaît dans un classement
 * que si on l'a choisi (règle 3), et la fiche ne le sait pas.
 */
const AVIS_POUR_UNE_NOTE = AVIS_POUR_AFFICHER_UNE_NOTE;

const JOURS_DE_LA_SEMAINE = [
  ['Lundi', 'Lu', 1],
  ['Mardi', 'Ma', 2],
  ['Mercredi', 'Me', 3],
  ['Jeudi', 'Je', 4],
  ['Vendredi', 'Ve', 5],
  ['Samedi', 'Sa', 6],
  ['Dimanche', 'Di', 0],
] as const;

/** Trois tranches, bornées en minutes : matin, après-midi, soirée. */
const TRANCHES_DU_JOUR = [
  ['Matin', 6 * 60, 12 * 60],
  ['Après-midi', 12 * 60, 18 * 60],
  ['Soirée', 18 * 60, 24 * 60],
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  // La référence contient un prénom : elle n'a rien à faire dans l'historique.
  return { title: p('Bike Sitter') };
}

export default async function FicheDUnBikeSitter({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { reference } = await params;
  const recherche = lireLaRecherche(await searchParams);
  const query = parametresDeLaRecherche(recherche).toString();

  const fiche = await ficheDuReseau(membre.id, reference, recherche.creneau);
  if (!fiche) notFound();

  const [photos, velos, enFavori] = await Promise.all([
    photosDeLEmplacement(reference),
    velosDuMembre(membre.id),
    estEnFavori(membre.id, reference),
  ]);

  const nom = `${fiche.prenom} ${fiche.initialeDuNom}.`;
  // La distance se dit en toutes lettres ; les coordonnées, elles, restent au
  // serveur tant que la demande n'a pas été acceptée.
  const distance = recherche.lieu
    ? distanceEcrite(distanceEnMetres(recherche.lieu, fiche) / 1000)
    : null;

  const vues =
    photos.length > 0
      ? photos.map((photo) => ({
          titre: fiche.type,
          src: `/emplacements/${reference}/photo/${photo.rang}`,
        }))
      : [{ titre: fiche.type, src: photoDeLEspace(0) }];

  const horaires = horairesDe(fiche);
  const ouvertLe = (jourDeLaSemaine: number, debut: number, fin: number) => {
    // Un jour de la semaine se lit sur une date réelle : les fermetures
    // ponctuelles comptent autant que les jours d'accueil déclarés.
    for (let rang = 0; rang < 7; rang += 1) {
      const jour = ajouterJours(recherche.aujourdhui, rang);
      const date = new Date(`${jour}T12:00:00Z`);
      if (date.getUTCDay() !== jourDeLaSemaine) continue;
      const heures = horairesDuJour(horaires, jour);
      if (!heures) return false;
      return minutesDe(heures.de) < fin && minutesDe(heures.a) > debut;
    }
    return false;
  };

  const jours = Array.from({ length: 7 }, (_, rang) => {
    const valeur = ajouterJours(recherche.aujourdhui, rang);
    return { valeur, libelle: jourAffiche(valeur) };
  });

  const equipements: string[] = [
    ...(fiche.ancrage ? ['Point d’ancrage'] : []),
    ...(fiche.intemperie === 'interieur' || fiche.intemperie === 'abri'
      ? ['À l’abri de la pluie']
      : []),
    ...(fiche.priseElectrique ? ['Prise électrique'] : []),
    ...fiche.securiteEnPlus,
    ...fiche.services,
  ];

  return (
    <main id="contenu">
      <section className="app-screen active" id="profile">
        <div className="profile-wrap" id="profileContent">
          <div className="fp2">
            <nav className="fil" aria-label="Fil d’Ariane">
              <Link href="/mon-espace">Accueil</Link>
              <span>›</span>
              <Link href={`/recherche?${query}`}>Résultats</Link>
              <span>›</span>
              <b>{nom}</b>
            </nav>

            <div className="fp2-grille">
              <div className="fp2-main">
                <Galerie vues={vues} espace={fiche.type} />

                <section className="fp2-bloc">
                  <header className="fp2-ident">
                    {/* Son visage s'il a mis une photo, sinon son initiale. La
                      photo du lieu, elle, a sa galerie juste au-dessus. */}
                    <Avatar
                      membreId={fiche.bikeSitterId}
                      prenom={fiche.prenom}
                      version={fiche.photoDuBikeSitter}
                      taille={72}
                      className="fp2-photo"
                    />
                    {!fiche.estLeSien ? (
                      <form action={basculerUnFavori} className="fp2-favori">
                        <input
                          type="hidden"
                          name="reference"
                          value={reference}
                        />
                        <input
                          type="hidden"
                          name="voulu"
                          value={enFavori ? 'retirer' : 'ajouter'}
                        />
                        <input
                          type="hidden"
                          name="retour"
                          value={`/emplacements/${reference}?${query}`}
                        />
                        <button
                          type="submit"
                          className={
                            enFavori ? 'bouton-coeur actif' : 'bouton-coeur'
                          }
                          aria-pressed={enFavori}
                          aria-label={
                            enFavori
                              ? `Retirer ${nom} de vos favoris`
                              : `Ajouter ${nom} à vos favoris`
                          }
                        >
                          <Icone nom="coeur" taille={20} plein={enFavori} />
                        </button>
                      </form>
                    ) : null}
                    <div>
                      <h1>
                        {nom}{' '}
                        {fiche.identiteVerifiee ? (
                          <span className="v-check" aria-label="Vérifié">
                            ✓
                          </span>
                        ) : null}
                      </h1>
                      <p className="fp2-role">Bike Sitter vérifié</p>
                      <p className="fp2-titre">
                        {fiche.type} à {fiche.quartier}
                      </p>
                      <p className="fp2-chiffres">
                        {fiche.nombreDAvis >= AVIS_POUR_UNE_NOTE &&
                        fiche.noteMoyenne !== null ? (
                          <>
                            <span className="etoiles">★</span>{' '}
                            <b>
                              {fiche.noteMoyenne.toFixed(1).replace('.', ',')}
                            </b>{' '}
                            <span className="gris">
                              ({fiche.nombreDAvis} avis)
                            </span>
                          </>
                        ) : fiche.nombreDAvis === 0 ? (
                          <span className="etiq-neuf">Nouveau</span>
                        ) : (
                          <span className="gris">{fiche.nombreDAvis} avis</span>
                        )}
                        <span className="gris">
                          {' '}
                          · {fiche.gardesMenees} garde
                          {fiche.gardesMenees > 1 ? 's' : ''}
                        </span>
                      </p>
                      <p className="fp2-dist">
                        <Icone nom="position" taille={14} strokeWidth={2} />
                        {distance
                          ? `${distance} de votre destination`
                          : fiche.quartier}
                      </p>
                    </div>
                  </header>

                  <ul className="groupe fp2-faits-liste" role="list">
                    <li className="rangee">
                      <span className="rangee-icone" aria-hidden="true">
                        <Icone nom="maison" taille={18} strokeWidth={2} />
                      </span>
                      <span className="rangee-texte">
                        <strong>{fiche.type}</strong>
                        <span>Un emplacement privé, fermé au public</span>
                      </span>
                    </li>
                    <li className="rangee">
                      <span className="rangee-icone" aria-hidden="true">
                        <Icone nom="cle" taille={18} strokeWidth={2} />
                      </span>
                      <span className="rangee-texte">
                        <strong>Accès</strong>
                        <span>{fiche.acces}</span>
                      </span>
                    </li>
                    <li className="rangee">
                      <span className="rangee-icone" aria-hidden="true">
                        <Icone nom="velo" taille={18} strokeWidth={2} />
                      </span>
                      <span className="rangee-texte">
                        <strong>
                          {fiche.capacite}{' '}
                          {fiche.capacite > 1 ? 'places' : 'place'}
                        </strong>
                        <span>Remise en main propre, avec un code</span>
                      </span>
                    </li>
                  </ul>

                  <div className="fp2-sect">
                    <h2>À propos de {fiche.prenom}</h2>
                    <p>
                      {fiche.description ??
                        `${fiche.prenom} accueille votre vélo dans un emplacement privé, et vous le remet en main propre.`}
                    </p>
                    {fiche.precisionDAcces ? (
                      <div className="etiquettes">
                        <span className="etiquette">
                          {fiche.precisionDAcces}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="fp2-sect">
                    <h2>Vélos acceptés</h2>
                    <ul className="puces velos-acceptes" role="list">
                      {TYPES_VELO.filter((velo) =>
                        fiche.velosAcceptes.includes(velo),
                      ).map((velo) => (
                        <li key={velo} className="puce ok">
                          {velo}
                        </li>
                      ))}
                    </ul>
                    {TYPES_VELO.some(
                      (velo) => !fiche.velosAcceptes.includes(velo),
                    ) ? (
                      <p className="gris petite">
                        Pas de place pour :{' '}
                        {TYPES_VELO.filter(
                          (velo) => !fiche.velosAcceptes.includes(velo),
                        )
                          .map((velo) =>
                            velo === velo.toUpperCase()
                              ? velo
                              : velo.toLowerCase(),
                          )
                          .join(', ')}
                        .
                      </p>
                    ) : null}
                  </div>

                  {equipements.length > 0 ? (
                    <div className="fp2-sect">
                      <h2>Équipements du local</h2>
                      <div className="puces">
                        {equipements.map((equipement) => (
                          <span key={equipement} className="puce ok">
                            {equipement}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="fp2-sect">
                    <h2>Disponibilités</h2>
                    <table className="dispo">
                      <thead>
                        <tr>
                          <th>
                            <span className="vh">Tranche</span>
                          </th>
                          {JOURS_DE_LA_SEMAINE.map(([long, court]) => (
                            <th key={long}>
                              <abbr title={long}>{court}</abbr>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TRANCHES_DU_JOUR.map(([tranche, debut, fin]) => (
                          <tr key={tranche}>
                            <th>{tranche}</th>
                            {JOURS_DE_LA_SEMAINE.map(([long, , numero]) => {
                              const ouvert = ouvertLe(numero, debut, fin);
                              return (
                                <td key={long}>
                                  <span className={ouvert ? 'pt ok' : 'pt'}>
                                    <span className="vh">
                                      {ouvert ? 'disponible' : 'indisponible'}{' '}
                                      {long}
                                    </span>
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="fp2-sect">
                    <h2>
                      Avis des cyclistes{' '}
                      {fiche.nombreDAvis >= AVIS_POUR_UNE_NOTE &&
                      fiche.noteMoyenne !== null ? (
                        <span className="note-inline">
                          <span className="etoiles">★</span>{' '}
                          {fiche.noteMoyenne.toFixed(1).replace('.', ',')}/5
                        </span>
                      ) : fiche.nombreDAvis === 0 ? (
                        <span className="etiq-neuf">Nouveau</span>
                      ) : null}
                    </h2>
                    {fiche.avis.length > 0 ? (
                      <div className="avis2">
                        {fiche.avis.map((avis) => (
                          <article key={avis.id}>
                            <p className="a2-tete">
                              <Avatar
                                membreId={avis.auteurId}
                                prenom={avis.auteurPrenom}
                                version={avis.auteurPhoto}
                                taille={32}
                              />
                              <b>
                                {avis.auteurPrenom} {avis.auteurInitiale}.
                              </b>
                              <span className="etoiles">
                                {'★'.repeat(Math.round(avis.note))}
                                <span className="vh">{avis.note} sur 5</span>
                              </span>
                              <span className="gris">
                                {avis.ecritLe.toLocaleDateString('fr-BE', {
                                  month: 'long',
                                  year: 'numeric',
                                  timeZone: 'Europe/Brussels',
                                })}
                              </span>
                            </p>
                            {avis.texte ? <p>« {avis.texte} »</p> : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="gris">Pas encore d’avis.</p>
                    )}
                  </div>
                </section>
              </div>

              <aside className="fp2-cote">
                <DemandeDeGarde
                  reference={reference}
                  lieu={recherche.texte}
                  jours={jours}
                  heures={avecLesHeuresChoisies(
                    heuresDansLAccueil(
                      HEURES.filter((heure) => minutesDe(heure) % 30 === 0),
                      plagesDAccueil(fiche),
                    ),
                    recherche.creneau.heureDepot,
                    recherche.creneau.heureReprise,
                  )}
                  creneau={{
                    jour: recherche.creneau.jourDepot,
                    de: recherche.creneau.heureDepot,
                    a: recherche.creneau.heureReprise,
                  }}
                  velosAcceptes={fiche.velosAcceptes}
                  tousLesVelos={TYPES_VELO}
                  monVelo={velos[0]?.type ?? null}
                />

                <div className="carte-cote">
                  <h2>Emplacement approximatif</h2>
                  <div
                    className="zone-hachure"
                    role="img"
                    aria-label="Zone approximative"
                  >
                    <span>{fiche.quartier}</span>
                  </div>
                  <p className="gris petite">
                    L’adresse exacte vous est communiquée dès que {fiche.prenom}{' '}
                    accepte votre demande.
                  </p>
                </div>

                <div className="carte-cote">
                  <h2>Vérifications</h2>
                  <ul className="verifs">
                    {(
                      [
                        [
                          'bouclier',
                          'Pièce d’identité',
                          fiche.identiteVerifiee,
                          'vérifiée',
                        ],
                        [
                          'telephone',
                          'Téléphone',
                          fiche.telephoneVerifie,
                          'vérifié',
                        ],
                        ['enveloppe', 'E-mail', fiche.emailVerifie, 'vérifié'],
                      ] as const
                    ).map(([icone, libelle, verifie, accord]) => (
                      <li key={libelle}>
                        <span className="vi" aria-hidden="true">
                          <Icone nom={icone} taille={18} strokeWidth={2} />
                        </span>
                        <div>
                          <b>{libelle}</b>
                        </div>
                        <span className={verifie ? 'v-ok' : 'v-ok v-non'}>
                          {verifie
                            ? `${accord[0]?.toUpperCase()}${accord.slice(1)}`
                            : 'Pas encore'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
