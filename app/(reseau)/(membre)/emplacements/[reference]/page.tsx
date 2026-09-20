import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { CarteDAvis } from '@/components/membre/avis';
import { derniereActivite, texteDuCreneau } from '@/components/membre/elements';
import { basculerUnFavori } from '@/app/(reseau)/(membre)/favoris/actions';
import { estEnFavori } from '@/lib/depot/favoris';
import { photosDeLEmplacement } from '@/lib/depot/photos';
import { ficheDuReseau } from '@/lib/depot/reseau';
import { textes } from '@/lib/i18n/langue';
import { INTEMPERIES, VERROUILLAGES } from '@/lib/regles/caracteristiques';
import {
  A_CONVENIR,
  DELAIS_DE_REPONSE,
  DUREES_MAX_JOURS,
  ecartEnJours,
  heureDe,
  jourAffiche,
  JOURS_ABREGES,
  libelleDesHoraires,
  minutesDe,
} from '@/lib/regles/creneau';
import { distanceEnMetres, libelleDeDistance } from '@/lib/regles/distance';
import {
  lireLaRecherche,
  parametresDeLaRecherche,
} from '@/lib/recherche-courante';
import { exigerUnMembre } from '@/lib/session';

type Parametres = {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

/** À partir de trois gardes menées, un bike sitter n'est plus nouveau. */
const GARDES_POUR_ETRE_CONFIRME = 3;

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  // La référence contient un prénom : elle n'a rien à faire dans l'historique.
  return { title: p('Bike Sitter') };
}

export default async function FicheDUnBikeSitter({
  params,
  searchParams,
}: Parametres) {
  const membre = await exigerUnMembre();
  const { t, p } = await textes();
  const { reference } = await params;
  const recherche = lireLaRecherche(await searchParams);
  const query = parametresDeLaRecherche(recherche).toString();

  const fiche = await ficheDuReseau(membre.id, reference, recherche.creneau);
  if (!fiche) notFound();
  const [photos, favori] = await Promise.all([
    photosDeLEmplacement(reference),
    estEnFavori(membre.id, reference),
  ]);
  const { favoris: indicationFavoris } = await searchParams;

  const dispo = fiche.disponibilite;
  const reservable =
    dispo.dansLesHoraires &&
    dispo.dureeAcceptee &&
    dispo.placesLibres > 0 &&
    !dispo.occupeAilleurs;
  const horaires = {
    jours: fiche.jours,
    ouverture: fiche.ouverture,
    fermeture: fiche.fermeture,
    parJour: fiche.parJour ?? {},
    fermetures: fiche.fermetures,
  };
  const distance = recherche.lieu
    ? libelleDeDistance(distanceEnMetres(recherche.lieu, fiche))
    : null;
  const fermeturesAVenir = fiche.fermetures.filter(
    (jour) => ecartEnJours(recherche.aujourdhui, jour) >= 0,
  );
  const suivante = dispo.prochaineHeureLibre;
  const essai = suivante
    ? parametresDeLaRecherche(recherche, {
        creneau: {
          ...recherche.creneau,
          heureDepot: suivante,
          heureReprise: heureDe(
            minutesDe(suivante) +
              minutesDe(recherche.creneau.heureReprise) -
              minutesDe(recherche.creneau.heureDepot),
          ),
        },
      }).toString()
    : null;
  const confirme = fiche.gardesMenees >= GARDES_POUR_ETRE_CONFIRME;

  const faits: [NomDIcone, string][] = [
    ['maison', p(fiche.type)],
    [
      'velo',
      fiche.capacite > 1
        ? p('{n} vélos maximum', { n: fiche.capacite })
        : p('Un vélo à la fois'),
    ],
    ['profil', p('Présent pendant toute la garde')],
    ...(fiche.velosAcceptes.includes('Électrique')
      ? [['batterie', p('VAE accepté')] as [NomDIcone, string]]
      : []),
    [
      'cadenas',
      p(
        VERROUILLAGES[fiche.verrouillage as keyof typeof VERROUILLAGES] ??
          fiche.verrouillage,
      ),
    ],
    [
      'bouclier',
      p(
        INTEMPERIES[fiche.intemperie as keyof typeof INTEMPERIES] ??
          fiche.intemperie,
      ),
    ],
    ['document', p('Accès : {acces}', { acces: p(fiche.acces).toLowerCase() })],
    ...(fiche.ancrage
      ? [['cle', p(fiche.ancrage)] as [NomDIcone, string]]
      : []),
    ...(fiche.accesDifficile && fiche.precisionDAcces
      ? [['alerte', fiche.precisionDAcces] as [NomDIcone, string]]
      : []),
    ...(fiche.services.length
      ? [['reglages', fiche.services.map((s) => p(s)).join(', ')] as [NomDIcone, string]]
      : []),
  ];

  return (
    <main id="contenu" className="avec-barre-d-action">
      <EnTete p={p} retour={`/recherche?${query}`}>
        {fiche.estLeSien ? null : (
          <form action={basculerUnFavori}>
            <input type="hidden" name="reference" value={reference} />
            <input type="hidden" name="voulu" value={favori ? 'retirer' : 'ajouter'} />
            <input type="hidden" name="retour" value={`/emplacements/${reference}?${query}`} />
            <button
              type="submit"
              className="entete-bouton"
              aria-pressed={favori}
              aria-label={favori ? p('Retirer de mes favoris') : p('Ajouter à mes favoris')}
            >
              <Icone nom="coeur" taille={24} plein={favori} className={favori ? 'texte-vert' : undefined} />
            </button>
          </form>
        )}
      </EnTete>
      <div className="ecran-app ecran-large fiche-detail">
        <h1 className="titre-ecran">
          {fiche.prenom} {fiche.initialeDuNom}.
        </h1>
        <p className="sous-titre">
          {distance
            ? p('{type} à environ {distance} de {lieu}.', {
                type: p(fiche.type),
                distance,
                lieu: recherche.texte,
              })
            : p('{type} · {quartier}', { type: p(fiche.type), quartier: fiche.quartier })}
        </p>

        {indicationFavoris === 'complet' ? (
          <div className="encart ambre" role="status" style={{ marginBottom: 10 }}>
            <Icone nom="coeur" taille={22} />
            <span>{p('Votre liste de favoris est pleine : retirez-en un pour ajouter ce Bike Sitter.')}</span>
          </div>
        ) : null}

        <div className="galerie" aria-label={p('Photos de l’espace')}>
          {photos.length > 0 ? (
            photos.map((photo, rang) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.rang}
                src={`/emplacements/${reference}/photo/${photo.rang}`}
                alt={p('Photo {n} sur {total} de l’espace', {
                  n: rang + 1,
                  total: photos.length,
                })}
              />
            ))
          ) : (
            <div className="galerie-vide">
              <Icone nom="maison" taille={48} />
            </div>
          )}
          {photos.length > 1 ? (
            <span className="galerie-compteur">
              {p('{n} photos', { n: photos.length })}
            </span>
          ) : null}
        </div>

        <div className="tuiles badges-fiche">
          <span className="tuile">
            <Icone nom="profil" taille={22} className="texte-verifie" />
            <span>{fiche.identiteVerifiee ? p('Identité vérifiée') : p('Identité en cours')}</span>
          </span>
          <span className="tuile">
            <Icone nom="verifie" taille={22} className="texte-verifie" />
            <span>{p('Espace vérifié')}</span>
          </span>
          <span className="tuile">
            <Icone nom="etoile" taille={22} plein />
            <span>{confirme ? p('Bike Sitter confirmé') : p('Nouveau Bike Sitter')}</span>
          </span>
        </div>

        <ul className="liste faits-fiche">
          {faits.map(([icone, texte]) => (
            <li key={texte} className="ligne">
              <span className="ligne-icone">
                <Icone nom={icone} taille={20} />
              </span>
              <span className="ligne-texte">{texte}</span>
            </li>
          ))}
        </ul>

        <div className="pile" style={{ marginTop: 10 }}>
          <Link href={`/membres/${fiche.bikeSitterId}`} className="ligne carte">
            <span className="ligne-icone note-fiche">
              <Icone nom="etoile" taille={22} plein />
            </span>
            <span className="ligne-texte">
              <strong>
                {fiche.noteMoyenne !== null
                  ? p('{note} · {n} avis', {
                      note: fiche.noteMoyenne.toFixed(1).replace('.', ','),
                      n: fiche.nombreDAvis,
                    })
                  : p('Pas encore de note')}
              </strong>
              <span>
                {p('Membre depuis {annee} · {n} gardes', {
                  annee: fiche.membreDepuis,
                  n: fiche.gardesMenees,
                })}
              </span>
            </span>
            <Icone nom="chevron" taille={20} className="texte-leger" />
          </Link>

          <Link href={`/recherche?${query}&modifier=1`} className="ligne carte">
            <span className="ligne-icone">
              <Icone nom="calendrier" taille={22} />
            </span>
            <span className="ligne-texte">
              <strong>{texteDuCreneau(p, recherche.creneau)}</strong>
              <span>{p('Changer de créneau')}</span>
            </span>
            <Icone nom="chevron" taille={20} className="texte-leger" />
          </Link>
        </div>

        {!fiche.estLeSien ? (
          reservable ? (
            <div className="encart" style={{ marginTop: 12 }}>
              <Icone nom="coche" taille={22} />
              <span>
                <strong>{p('Disponible sur votre créneau')}</strong>
                {dispo.placesLibres > 1
                  ? p('{n} places libres sur {capacite}.', {
                      n: dispo.placesLibres,
                      capacite: fiche.capacite,
                    })
                  : p('Une place libre sur {capacite}.', { capacite: fiche.capacite })}
              </span>
            </div>
          ) : (
            <div className="encart rouge" style={{ marginTop: 12 }}>
              <Icone nom="horloge" taille={22} />
              <span>
                <strong>{p('Indisponible sur votre créneau')}</strong>
                {!dispo.dansLesHoraires
                  ? p('Le bike sitter accueille {horaires}.', {
                      horaires: libelleDesHoraires(horaires, (jour) =>
                        p(JOURS_ABREGES[jour] ?? ''),
                      ),
                    })
                  : essai
                    ? p('Cet emplacement se libère à partir de {heure}.', {
                        heure: suivante ?? '',
                      })
                    : p('Aucun créneau libre ce jour-là. Essayez une autre date.')}
                {essai ? (
                  <>
                    {' '}
                    <Link href={`/emplacements/${reference}?${essai}`} className="lien-souligne">
                      {p('Essayer cet horaire')}
                    </Link>
                  </>
                ) : null}
              </span>
            </div>
          )
        ) : null}

        {fiche.description ? (
          <>
            <h2 className="titre-section">{p('Le mot de {prenom}', { prenom: fiche.prenom })}</h2>
            <p className="texte-fiche">{fiche.description}</p>
          </>
        ) : null}

        <h2 className="titre-section">{p('Vélos acceptés')}</h2>
        <div className="pastilles">
          {fiche.velosAcceptes.map((velo) => (
            <span key={velo} className="pastille">
              {p(velo)}
            </span>
          ))}
        </div>

        <h2 className="titre-section">{p('Horaires d’accueil')}</h2>
        <div className="liste">
          <div className="ligne">
            <span className="ligne-icone">
              <Icone nom="horloge" taille={20} />
            </span>
            <span className="ligne-texte">
              <strong>
                {libelleDesHoraires(horaires, (jour) => p(JOURS_ABREGES[jour] ?? ''))}
              </strong>
              {fermeturesAVenir.length > 0 ? (
                <span>
                  {p('Fermé : {jours}', { jours: fermeturesAVenir.map(jourAffiche).join(', ') })}
                </span>
              ) : null}
            </span>
          </div>
          <div className="ligne">
            <span className="ligne-icone">
              <Icone nom="calendrier" taille={20} />
            </span>
            <span className="ligne-texte">
              <strong>{p(DUREES_MAX_JOURS[fiche.dureeMaxJours] ?? '')}</strong>
              {fiche.dureeMaxJours === A_CONVENIR ? (
                <span>
                  {p('Précisez la durée souhaitée dans votre message : elle se convient entre vous.')}
                </span>
              ) : null}
            </span>
          </div>
          <div className="ligne">
            <span className="ligne-icone">
              <Icone nom="messages" taille={20} />
            </span>
            <span className="ligne-texte">
              <strong>{p(DELAIS_DE_REPONSE[fiche.delaiDeReponse] ?? '')}</strong>
              <span>{derniereActivite(p, fiche.derniereGarde, true)}</span>
            </span>
          </div>
        </div>

        <div className="encart bleu" style={{ marginTop: 12 }}>
          <Icone nom="cadenas" taille={22} />
          <span>{t('sp.private')}</span>
        </div>

        {fiche.avis.length > 0 ? (
          <>
            <h2 className="titre-section">
              {p('Avis')}
              <Link href={`/membres/${fiche.bikeSitterId}`} aria-label={p('Tous les avis')}>
                <Icone nom="chevron" taille={20} />
              </Link>
            </h2>
            {fiche.avis.slice(0, 3).map((avis) => (
              <CarteDAvis key={avis.id} p={p} avis={avis} />
            ))}
          </>
        ) : null}

        {!fiche.estLeSien ? (
          <Link href={`/signaler/emplacement/${reference}`} className="bouton discret">
            <Icone nom="drapeau" taille={18} />
            {p('Signaler cette annonce')}
          </Link>
        ) : null}
      </div>

      <div className="barre-d-action">
        {fiche.estLeSien ? (
          <Link href="/mes-lieux" className="bouton contour">
            {p('Gérer mon lieu')}
          </Link>
        ) : reservable ? (
          <Link href={`/demande/${reference}?${query}`} className="bouton plein">
            {p('Envoyer la demande')}
            <Icone nom="chevron" taille={20} />
          </Link>
        ) : (
          <button type="button" className="bouton plein" disabled>
            {p('Envoyer la demande')}
          </button>
        )}
      </div>
    </main>
  );
}
