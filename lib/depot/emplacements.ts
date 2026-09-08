import 'server-only';

import { interroger, uneLigne } from '@/lib/bd/client';
import type {
  Acces,
  Ancrage,
  Intemperie,
  Service,
  Verrouillage,
} from '@/lib/regles/caracteristiques';
import type { TypeEmplacementPrive } from '@/lib/regles/emplacements';
import type { TypeVelo } from '@/lib/regles/velos';

/**
 * La lecture des emplacements.
 *
 * Toutes les requêtes de lecture partent de la vue `emplacement_visible`, qui
 * ne contient ni l'adresse exacte ni la position exacte (règle 4). C'est la
 * seule raison d'être de cette vue : rendre la fuite impossible plutôt que
 * simplement improbable. La seule exception est `adresseDuStationnement`, qui
 * passe par la fonction SQL vérifiant que la demande a bien été acceptée.
 */

export type FicheDEmplacement = {
  reference: string;
  prenomDuBikeSitter: string;
  quartier: string;
  rayonDeLaZone: number;
  type: TypeEmplacementPrive;
  capacite: number;
  verrouillage: Verrouillage;
  intemperie: Intemperie;
  acces: Acces;
  ancrage: Ancrage;
  services: Service[];
  velosAcceptes: TypeVelo[];
  precisions: string | null;
  /** Centre de la zone publiée, arrondi par la vue à environ 500 mètres. */
  latitude: number;
  longitude: number;
};

const COLONNES_VISIBLES = `
  reference,
  prenom_du_bike_sitter                 as "prenomDuBikeSitter",
  quartier,
  rayon_de_la_zone                      as "rayonDeLaZone",
  type,
  capacite,
  verrouillage,
  intemperie,
  acces,
  ancrage,
  services,
  velos_acceptes                        as "velosAcceptes",
  precisions,
  latitude_de_zone::double precision    as latitude,
  longitude_de_zone::double precision   as longitude
`;

export async function emplacementsPublies(
  quartier?: string,
): Promise<FicheDEmplacement[]> {
  if (quartier && quartier.trim() !== '') {
    return interroger<FicheDEmplacement>(
      `select ${COLONNES_VISIBLES}
         from emplacement_visible
        where quartier ilike '%' || $1 || '%'
        order by quartier, "prenomDuBikeSitter"`,
      [quartier.trim()],
    );
  }

  return interroger<FicheDEmplacement>(
    `select ${COLONNES_VISIBLES}
       from emplacement_visible
      order by quartier, "prenomDuBikeSitter"`,
  );
}

export async function ficheParReference(
  reference: string,
): Promise<FicheDEmplacement | null> {
  return uneLigne<FicheDEmplacement>(
    `select ${COLONNES_VISIBLES}
       from emplacement_visible
      where reference = $1`,
    [reference],
  );
}

/**
 * Règle 4 — l'unique porte de sortie de l'adresse exacte. La vérification
 * (« cette personne a-t-elle une demande acceptée ici ? ») est faite en SQL,
 * pas ici : elle reste vraie même si un autre appelant oubliait de la faire.
 */
export async function adresseDuStationnement(
  reference: string,
  cyclisteId: string,
): Promise<string | null> {
  const ligne = await uneLigne<{ adresse: string | null }>(
    'select adresse_apres_acceptation($1, $2) as adresse',
    [reference, cyclisteId],
  );
  return ligne?.adresse ?? null;
}

// --- Écriture ---------------------------------------------------------------

export type NouvelEmplacement = {
  membreId: string;
  reference: string;
  type: TypeEmplacementPrive;
  quartier: string;
  adresseExacte: string;
  latitude: number;
  longitude: number;
  rayonDeLaZone: number;
  capacite: number;
  verrouillage: Verrouillage;
  intemperie: Intemperie;
  acces: Acces;
  ancrage: Ancrage;
  services: readonly Service[];
  velosAcceptes: readonly TypeVelo[];
  precisions: string | null;
  publie: boolean;
};

export async function creerUnEmplacement(
  emplacement: NouvelEmplacement,
): Promise<string> {
  const ligne = await uneLigne<{ reference: string }>(
    `insert into emplacement (
        membre_id, reference, type, quartier, adresse_exacte, position,
        rayon_de_la_zone, capacite, verrouillage, intemperie, acces, ancrage,
        services, velos_acceptes, precisions, publie)
     values (
        $1, $2, $3, $4, $5,
        st_setsrid(st_makepoint($7, $6), 4326)::geography,
        $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     returning reference`,
    [
      emplacement.membreId,
      emplacement.reference,
      emplacement.type,
      emplacement.quartier,
      emplacement.adresseExacte,
      emplacement.latitude,
      emplacement.longitude,
      emplacement.rayonDeLaZone,
      emplacement.capacite,
      emplacement.verrouillage,
      emplacement.intemperie,
      emplacement.acces,
      emplacement.ancrage,
      [...emplacement.services],
      [...emplacement.velosAcceptes],
      emplacement.precisions,
      emplacement.publie,
    ],
  );

  if (!ligne) {
    throw new Error('L’emplacement n’a pas pu être créé.');
  }
  return ligne.reference;
}

export type EmplacementDuMembre = {
  reference: string;
  type: TypeEmplacementPrive;
  quartier: string;
  capacite: number;
  publie: boolean;
  demandesEnAttente: number;
};

export async function emplacementsDuMembre(
  membreId: string,
): Promise<EmplacementDuMembre[]> {
  return interroger<EmplacementDuMembre>(
    `select e.reference,
            e.type,
            e.quartier,
            e.capacite,
            e.publie,
            count(s.id) filter (where s.etat = 'demande')::int
              as "demandesEnAttente"
       from emplacement e
       left join stationnement s on s.emplacement_id = e.id
      where e.membre_id = $1
      group by e.id
      order by e.cree_le`,
    [membreId],
  );
}

export async function nombreDEmplacements(membreId: string): Promise<number> {
  const ligne = await uneLigne<{ combien: number }>(
    'select count(*)::int as combien from emplacement where membre_id = $1',
    [membreId],
  );
  return ligne?.combien ?? 0;
}
