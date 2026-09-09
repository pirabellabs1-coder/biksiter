import 'server-only';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import {
  affluenceMaximale,
  capaciteSuffisante,
  type Creneau,
} from '@/lib/regles/capacite';
import { decisionDeRetrait } from '@/lib/regles/emplacements';
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
  /** Ce qui empêche de retirer : demandes, acceptations et gardes en cours. */
  stationnementsQuiRetiennent: number;
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
              as "demandesEnAttente",
            count(s.id) filter (
              where s.etat in ('demande', 'accepte', 'en_cours'))::int
              as "stationnementsQuiRetiennent"
       from emplacement e
       left join stationnement s on s.emplacement_id = e.id
      where e.membre_id = $1
      group by e.id
      order by e.cree_le`,
    [membreId],
  );
}

// --- Modification et retrait -------------------------------------------------

/**
 * La fiche complète, telle que son propriétaire la voit pour la corriger.
 *
 * Elle contient l'adresse exacte, et c'est normal : la règle 4 protège
 * l'adresse des autres membres, pas de celui qui l'a saisie. Cette fonction
 * n'est appelée que par la page de modification, dont le `where` exige que le
 * membre soit le propriétaire.
 */
export type EmplacementModifiable = {
  reference: string;
  type: TypeEmplacementPrive;
  quartier: string;
  adresseExacte: string;
  capacite: number;
  verrouillage: Verrouillage;
  intemperie: Intemperie;
  acces: Acces;
  ancrage: Ancrage;
  services: Service[];
  velosAcceptes: TypeVelo[];
  precisions: string | null;
  publie: boolean;
};

export async function emplacementAModifier(
  reference: string,
  membreId: string,
): Promise<EmplacementModifiable | null> {
  return uneLigne<EmplacementModifiable>(
    `select reference,
            type,
            quartier,
            adresse_exacte as "adresseExacte",
            capacite,
            verrouillage,
            intemperie,
            acces,
            ancrage,
            services,
            velos_acceptes as "velosAcceptes",
            precisions,
            publie
       from emplacement
      where reference = $1 and membre_id = $2`,
    [reference, membreId],
  );
}

export type Modification = Omit<NouvelEmplacement, 'membreId' | 'reference' | 'publie'>;

export type ResultatDeModification =
  | { modifie: true }
  | { modifie: false; motif: 'introuvable' }
  | { modifie: false; motif: 'capacite_trop_basse'; dejaPromis: number };

/**
 * La référence ne change jamais, même si le quartier change : elle vit dans
 * des URL, dans des e-mails et dans des conversations avec le support.
 *
 * La capacité est vérifiée dans la transaction, contre les stationnements déjà
 * acceptés : un bike sitter peut réduire ses places pour l'avenir, pas en
 * dessous de ce qu'il a déjà promis.
 */
export async function modifierUnEmplacement(
  reference: string,
  membreId: string,
  modification: Modification,
): Promise<ResultatDeModification> {
  return dansUneTransaction(async (client) => {
    const trouve = await client.query<{ id: string }>(
      'select id from emplacement where reference = $1 and membre_id = $2 for update',
      [reference, membreId],
    );

    if (trouve.rowCount === 0) {
      return { modifie: false, motif: 'introuvable' };
    }

    const { id } = trouve.rows[0];

    const acceptes = await client.query<{ debut: Date; fin: Date }>(
      `select debut, fin from stationnement
        where emplacement_id = $1 and etat in ('accepte', 'en_cours')`,
      [id],
    );

    const creneaux: Creneau[] = acceptes.rows.map((ligne) => ({
      debut: new Date(ligne.debut),
      fin: new Date(ligne.fin),
    }));

    if (!capaciteSuffisante(creneaux, modification.capacite)) {
      return {
        modifie: false,
        motif: 'capacite_trop_basse',
        dejaPromis: affluenceMaximale(creneaux),
      };
    }

    await client.query(
      `update emplacement
          set type = $2,
              quartier = $3,
              adresse_exacte = $4,
              position = st_setsrid(st_makepoint($6, $5), 4326)::geography,
              rayon_de_la_zone = $7,
              capacite = $8,
              verrouillage = $9,
              intemperie = $10,
              acces = $11,
              ancrage = $12,
              services = $13,
              velos_acceptes = $14,
              precisions = $15,
              modifie_le = now()
        where id = $1`,
      [
        id,
        modification.type,
        modification.quartier,
        modification.adresseExacte,
        modification.latitude,
        modification.longitude,
        modification.rayonDeLaZone,
        modification.capacite,
        modification.verrouillage,
        modification.intemperie,
        modification.acces,
        modification.ancrage,
        [...modification.services],
        [...modification.velosAcceptes],
        modification.precisions,
      ],
    );

    return { modifie: true };
  });
}

/** Mettre en pause, ou remettre sur la carte. Toujours possible. */
export async function changerLaPublication(
  reference: string,
  membreId: string,
  publie: boolean,
): Promise<boolean> {
  const lignes = await interroger<{ reference: string }>(
    `update emplacement
        set publie = $3, modifie_le = now()
      where reference = $1 and membre_id = $2
      returning reference`,
    [reference, membreId, publie],
  );
  return lignes.length > 0;
}

export type ResultatDeRetrait =
  | { retire: true }
  | { retire: false; motif: 'introuvable' }
  | { retire: false; motif: 'stationnements_en_cours'; combien: number };

/**
 * Retirer efface aussi les stationnements passés de cet emplacement, par la
 * cascade du schéma. C'est assumé et annoncé au membre : une association qui
 * ne classe personne n'a pas besoin de garder l'historique d'un lieu que son
 * propriétaire a décidé de reprendre.
 *
 * En revanche, un stationnement vivant retient : le vélo est là, ou quelqu'un
 * attend une réponse.
 */
export async function retirerUnEmplacement(
  reference: string,
  membreId: string,
): Promise<ResultatDeRetrait> {
  return dansUneTransaction(async (client) => {
    const trouve = await client.query<{ id: string }>(
      'select id from emplacement where reference = $1 and membre_id = $2 for update',
      [reference, membreId],
    );

    if (trouve.rowCount === 0) {
      return { retire: false, motif: 'introuvable' };
    }

    const { id } = trouve.rows[0];

    const retenus = await client.query<{ combien: number }>(
      `select count(*)::int as combien from stationnement
        where emplacement_id = $1
          and etat in ('demande', 'accepte', 'en_cours')`,
      [id],
    );

    const decision = decisionDeRetrait(retenus.rows[0].combien);
    if (!decision.retirable) {
      return {
        retire: false,
        motif: 'stationnements_en_cours',
        combien: decision.combien,
      };
    }

    await client.query('delete from emplacement where id = $1', [id]);
    return { retire: true };
  });
}

export async function nombreDEmplacements(membreId: string): Promise<number> {
  const ligne = await uneLigne<{ combien: number }>(
    'select count(*)::int as combien from emplacement where membre_id = $1',
    [membreId],
  );
  return ligne?.combien ?? 0;
}

// --- Ce que la fiche publique affiche en plus --------------------------------

/**
 * Les signaux de confiance, en une ligne.
 *
 * Ce sont des compteurs, pas des rangs : aucune requête du produit ne trie ni
 * ne filtre des emplacements par ces nombres (règle 3). Ils disent « cette
 * personne a déjà fait ça », pas « elle le fait mieux qu'une autre ».
 */
export type SignauxDeConfiance = {
  identiteVerifiee: boolean;
  gardesAccueillies: number;
  nombreDAvis: number;
  membreDepuis: number;
};

export async function signauxDeLEmplacement(
  reference: string,
): Promise<SignauxDeConfiance | null> {
  return uneLigne<SignauxDeConfiance>(
    `select (m.verification = 'verifiee')          as "identiteVerifiee",
            (select count(*) from stationnement s2
               join emplacement e2 on e2.id = s2.emplacement_id
              where e2.membre_id = m.id and s2.etat = 'termine')::int
                                                  as "gardesAccueillies",
            (select count(*) from avis a where a.emplacement_id = e.id)::int
                                                  as "nombreDAvis",
            extract(year from m.cree_le)::int     as "membreDepuis"
       from emplacement e
       join membre m on m.id = e.membre_id
      where e.reference = $1`,
    [reference],
  );
}

/**
 * Les créneaux déjà pris ce jour-là, pour dessiner la frise.
 *
 * On ne rend ni qui occupe, ni pour quel vélo : seulement des bornes. Un
 * passant n'a pas à savoir quand le bike sitter reçoit du monde chez lui.
 */
export async function creneauxAcceptesDuJour(
  reference: string,
  jour: Date,
): Promise<Creneau[]> {
  const lignes = await interroger<{ debut: Date; fin: Date }>(
    `select s.debut, s.fin
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
      where e.reference = $1
        and s.etat in ('accepte', 'en_cours')
        and s.fin   >= $2::timestamptz - interval '1 hour'
        and s.debut <= $2::timestamptz + interval '1 day'`,
    [reference, jour],
  );

  return lignes.map((ligne) => ({
    debut: new Date(ligne.debut),
    fin: new Date(ligne.fin),
  }));
}

/**
 * Les centres de zone du réseau, un par quartier ouvert.
 *
 * Sert à la figure de la page d'accueil. Elle passe par la même vue que le
 * reste : ce qui en sort est déjà arrondi à la maille de 500 mètres, et un
 * quartier ne rend qu'un point, si bien qu'on ne peut pas déduire de la figure
 * combien d'emplacements s'y trouvent — encore moins où.
 */
export async function zonesOuvertes(): Promise<
  { latitude: number; longitude: number }[]
> {
  return interroger<{ latitude: number; longitude: number }>(
    `select avg(latitude_de_zone)::double precision  as latitude,
            avg(longitude_de_zone)::double precision as longitude
       from emplacement_visible
      group by quartier`,
  );
}
