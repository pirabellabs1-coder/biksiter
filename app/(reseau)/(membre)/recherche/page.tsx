import type { Metadata } from 'next';

import { ListeDesResultats } from '@/components/maquette/resultats/liste-des-resultats';
import {
  distanceEcrite,
  heuresEntamees,
  positionApproximative,
  tempsDeMarche,
  type BikeSitterAffiche,
} from '@/components/maquette/resultats/modele';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { emplacementsAutourDe } from '@/lib/depot/reseau';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { textes } from '@/lib/i18n/langue';
import {
  lireLaRecherche,
  parametresDeLaRecherche,
} from '@/lib/recherche-courante';
import { heureFrancaise, jourCourt } from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Rechercher un bike sitter') };
}

export default async function Rechercher({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const parametres = await searchParams;
  const recherche = lireLaRecherche(parametres);
  const query = parametresDeLaRecherche(recherche).toString();
  const creneauCache: Record<string, string> = {
    jour: recherche.creneau.jourDepot,
    de: recherche.creneau.heureDepot,
    jourFin: recherche.creneau.jourReprise,
    a: recherche.creneau.heureReprise,
  };

  const [trouves, _nonLues, _mesEmplacements] = await Promise.all([
    recherche.lieu
      ? emplacementsAutourDe(membre.id, recherche.lieu, recherche.creneau)
      : Promise.resolve([]),
    nombreDeNotificationsNonLues(membre.id),
    nombreDEmplacements(membre.id),
  ]);

  // L'adresse ne quitte pas le serveur : seuls une zone, une distance et un
  // temps de marche descendent jusqu'au navigateur.
  const sitters: BikeSitterAffiche[] = trouves.map((e, rang) => {
    const distanceKm = e.distance / 1000;
    return {
      reference: e.reference,
      nom: `${e.prenom} ${e.initialeDuNom}.`,
      titre: `${e.type} à ${e.quartier}`,
      espace: e.type,
      velosAcceptes: e.velosAcceptes,
      places: e.capacite,
      acces: e.acces,
      quartier: e.quartier,
      zone: `${distanceEcrite(distanceKm)} de votre destination`,
      distanceKm,
      marche: tempsDeMarche(distanceKm),
      note: e.noteMoyenne,
      nombreDAvis: e.nombreDAvis,
      gardesMenees: e.gardesMenees,
      identiteVerifiee: e.identiteVerifiee,
      aDeLaPlace: e.disponibilite.placesLibres > 0,
      disponibleMaintenant: e.disponibleMaintenant,
      // Aucun barème n'est encore enregistré : toutes les gardes sont gratuites.
      tarifs: null,
      photo:
        e.premierePhoto !== null
          ? `/emplacements/${e.reference}/photo/${e.premierePhoto}`
          : null,
      bikeSitterId: e.bikeSitterId,
      prenom: e.prenom,
      photoDuBikeSitter: e.photoDuBikeSitter,
      ...positionApproximative(rang, distanceKm),
      latitude: e.latitude,
      longitude: e.longitude,
      ferme: e.verrouillage !== 'aucun',
      abrite: e.intemperie === 'interieur' || e.intemperie === 'abri',
      ancrage: e.ancrage !== null,
    };
  });

  const depot = `${jourCourt(recherche.creneau.jourDepot)}, ${heureFrancaise(
    recherche.creneau.heureDepot,
  )}`;
  const reprise = `${jourCourt(recherche.creneau.jourReprise)}, ${heureFrancaise(
    recherche.creneau.heureReprise,
  )}`;

  return (
    <main id="contenu">
      <section className="app-screen active" id="results">
        {/* La maquette n'a pas de titre de niveau un sur cet écran : le compte
          de résultats est un h2. Une page sans h1 se parcourt mal au lecteur
          d'écran, on en pose donc un, masqué visuellement — le rendu ne
          change pas d'un pixel. */}
        <h1 className="vh">Rechercher un Bike Sitter</h1>
        <ListeDesResultats
          sitters={sitters}
          destination={
            recherche.lieu
              ? {
                  latitude: recherche.lieu.latitude,
                  longitude: recherche.lieu.longitude,
                }
              : null
          }
          lieu={recherche.texte}
          depot={depot}
          reprise={reprise}
          dureeHeures={heuresEntamees(recherche.creneau)}
          rechercheInitiale={{
            destination: recherche.texte,
            jour: recherche.creneau.jourDepot,
            depot: recherche.creneau.heureDepot,
            jourFin: recherche.creneau.jourReprise,
            reprise: recherche.creneau.heureReprise,
          }}
          requete={query}
          creneauCache={creneauCache}
        />
      </section>
    </main>
  );
}
