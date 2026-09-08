import 'server-only';

import {
  BORNES_DE_BRUXELLES,
  estDansLaZoneCouverte,
  type PointGeographique,
} from '@/lib/regles/territoire';

/**
 * Transformer une adresse en coordonnées.
 *
 * ATTENTION — VIE PRIVÉE. Géocoder, c'est envoyer l'adresse du domicile d'un
 * membre à un tiers. C'est le seul moment où elle sort de nos serveurs, et
 * c'est pour cela que :
 *   - le service est configurable (GEOCODEUR_URL) : une association qui le
 *     souhaite peut héberger sa propre instance Nominatim et ne rien envoyer
 *     à personne ;
 *   - seule l'adresse est transmise, jamais le nom du membre ni son e-mail ;
 *   - le résultat n'est pas conservé chez le tiers, et nous ne gardons que le
 *     point, que la vue `emplacement_visible` arrondit ensuite (règle 4).
 *
 * Par défaut on utilise Nominatim, dont la politique d'usage impose un
 * en-tête User-Agent identifiant et au plus une requête par seconde. Le volume
 * attendu — un géocodage par emplacement créé — tient très largement dedans.
 */

const SERVICE_PAR_DEFAUT = 'https://nominatim.openstreetmap.org/search';

/** Exigé par la politique d'usage de Nominatim : un contact joignable. */
const IDENTIFICATION =
  process.env.GEOCODEUR_CONTACT ?? 'BikeSitters (association, Bruxelles)';

const DELAI_MAXIMAL_MS = 6_000;
const INTERVALLE_MINIMAL_MS = 1_100;

export type ResultatDeGeocodage =
  | { trouve: true; point: PointGeographique; libelle: string }
  | { trouve: false; motif: 'introuvable' | 'hors_zone' | 'indisponible' };

/**
 * File d'attente d'un seul rang : les requêtes s'enchaînent au lieu de partir
 * ensemble. C'est ce qui tient la limite d'une requête par seconde sans
 * dépendre d'une bibliothèque de limitation.
 */
let derniereRequete = 0;
let fileDAttente: Promise<unknown> = Promise.resolve();

function aLaQueue<T>(travail: () => Promise<T>): Promise<T> {
  const resultat = fileDAttente.then(async () => {
    const attente = INTERVALLE_MINIMAL_MS - (Date.now() - derniereRequete);
    if (attente > 0) {
      await new Promise((reprendre) => setTimeout(reprendre, attente));
    }
    derniereRequete = Date.now();
    return travail();
  });

  // La file ne doit pas se rompre parce qu'une requête a échoué.
  fileDAttente = resultat.catch(() => undefined);
  return resultat;
}

type ReponseNominatim = {
  lat?: string;
  lon?: string;
  display_name?: string;
};

export async function geocoder(adresse: string): Promise<ResultatDeGeocodage> {
  const propre = adresse.trim();
  if (propre === '') {
    return { trouve: false, motif: 'introuvable' };
  }

  const url = new URL(process.env.GEOCODEUR_URL ?? SERVICE_PAR_DEFAUT);
  url.searchParams.set('q', propre);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'be');
  url.searchParams.set('addressdetails', '0');
  // On demande au service de chercher d'abord dans la zone couverte.
  url.searchParams.set(
    'viewbox',
    [
      BORNES_DE_BRUXELLES.longitudeMinimale,
      BORNES_DE_BRUXELLES.latitudeMaximale,
      BORNES_DE_BRUXELLES.longitudeMaximale,
      BORNES_DE_BRUXELLES.latitudeMinimale,
    ].join(','),
  );

  try {
    const reponse = await aLaQueue(() =>
      fetch(url, {
        headers: {
          'User-Agent': IDENTIFICATION,
          'Accept-Language': 'fr-BE,fr',
        },
        signal: AbortSignal.timeout(DELAI_MAXIMAL_MS),
        cache: 'no-store',
      }),
    );

    if (!reponse.ok) {
      return { trouve: false, motif: 'indisponible' };
    }

    const trouvailles = (await reponse.json()) as ReponseNominatim[];
    const premiere = trouvailles[0];

    if (!premiere?.lat || !premiere.lon) {
      return { trouve: false, motif: 'introuvable' };
    }

    const point = {
      latitude: Number.parseFloat(premiere.lat),
      longitude: Number.parseFloat(premiere.lon),
    };

    if (Number.isNaN(point.latitude) || Number.isNaN(point.longitude)) {
      return { trouve: false, motif: 'introuvable' };
    }

    // Le service peut répondre pour une adresse belge hors de Bruxelles : la
    // règle de territoire tranche, pas le fournisseur.
    if (!estDansLaZoneCouverte(point)) {
      return { trouve: false, motif: 'hors_zone' };
    }

    return {
      trouve: true,
      point,
      libelle: premiere.display_name ?? propre,
    };
  } catch {
    // Panne réseau, délai dépassé, réponse illisible : dans tous les cas
    // l'emplacement doit pouvoir être créé quand même, avec le centre du
    // quartier. Un géocodeur indisponible ne bloque pas un bike sitter.
    return { trouve: false, motif: 'indisponible' };
  }
}
