import 'server-only';

import { interroger, uneLigne } from '@/lib/bd/client';

/**
 * Ce que voit l'administration, et surtout ce qu'elle ne voit pas.
 *
 * Ce module ne lit que des nombres et des états. Trois choses n'en sortent
 * jamais, et ce n'est pas un oubli :
 *
 * - **Aucune adresse.** `emplacement.adresse_exacte` n'est sélectionnée nulle
 *   part ici. La règle 4 ne fait pas d'exception pour les administrateurs :
 *   une adresse ne sort que par `adresse_apres_acceptation()`, pour la
 *   personne dont la demande a été acceptée.
 * - **Aucun corps de message.** La file d'envoi se compte, elle ne se lit pas.
 *   Les messages d'acceptation contiennent précisément les adresses que le
 *   reste du produit protège ; les afficher dans un écran d'administration
 *   défierait tout le travail fait ailleurs.
 * - **Aucun classement de membres.** On compte des membres, on n'en ordonne
 *   jamais (règle 3). Le seul tri de ce fichier porte sur des quartiers, pour
 *   décider lequel ouvrir — un quartier n'est pas quelqu'un.
 */

export type EtatDuReseau = {
  membres: number;
  membresVerifies: number;
  membresAVerifier: number;
  emplacements: number;
  emplacementsPublies: number;
  quartiersOuverts: number;
  gardesEnCours: number;
  gardesTerminees: number;
  demandesSansReponse: number;
  surLaListeDAttente: number;
};

export async function etatDuReseau(): Promise<EtatDuReseau> {
  const ligne = await uneLigne<EtatDuReseau>(
    `select
       (select count(*) from membre)::int
         as membres,
       (select count(*) from membre where verification = 'verifiee')::int
         as "membresVerifies",
       (select count(*) from membre where verification = 'en_cours')::int
         as "membresAVerifier",
       (select count(*) from emplacement)::int
         as emplacements,
       (select count(*) from emplacement where publie)::int
         as "emplacementsPublies",
       (select count(distinct quartier) from emplacement where publie)::int
         as "quartiersOuverts",
       (select count(*) from stationnement where etat = 'en_cours')::int
         as "gardesEnCours",
       (select count(*) from stationnement where etat = 'termine')::int
         as "gardesTerminees",
       (select count(*) from stationnement where etat = 'demande')::int
         as "demandesSansReponse",
       (select count(*) from inscription_liste_attente)::int
         as "surLaListeDAttente"`,
  );

  return (
    ligne ?? {
      membres: 0,
      membresVerifies: 0,
      membresAVerifier: 0,
      emplacements: 0,
      emplacementsPublies: 0,
      quartiersOuverts: 0,
      gardesEnCours: 0,
      gardesTerminees: 0,
      demandesSansReponse: 0,
      surLaListeDAttente: 0,
    }
  );
}

export type FileDEnvoi = {
  enAttente: number;
  enEchec: number;
  envoyesCetteSemaine: number;
  /** Âge du plus vieux message non parti, en heures. `null` si la file est vide. */
  attenteLaPlusLongueEnHeures: number | null;
};

/**
 * La santé de la file d'envoi.
 *
 * C'est le seul organe du produit qui peut tomber en panne sans que personne
 * ne s'en aperçoive : rien ne casse à l'écran, les messages s'empilent
 * simplement, et quelqu'un attend devant une porte l'adresse qu'il n'a jamais
 * reçue. D'où cet écran — et d'où le fait qu'on y compte l'attente en heures.
 */
export async function fileDEnvoi(): Promise<FileDEnvoi> {
  const ligne = await uneLigne<FileDEnvoi>(
    `select
       count(*) filter (where envoye_le is null and tentatives = 0)::int
         as "enAttente",
       count(*) filter (where envoye_le is null and tentatives > 0)::int
         as "enEchec",
       count(*) filter (where envoye_le >= now() - interval '7 days')::int
         as "envoyesCetteSemaine",
       (extract(epoch from (now() - min(cree_le)
          filter (where envoye_le is null))) / 3600)::int
         as "attenteLaPlusLongueEnHeures"
     from message_sortant`,
  );

  return (
    ligne ?? {
      enAttente: 0,
      enEchec: 0,
      envoyesCetteSemaine: 0,
      attenteLaPlusLongueEnHeures: null,
    }
  );
}

export type QuartierACouvrir = {
  quartier: string;
  bikeSitters: number;
  cyclistes: number;
  /** Vrai si un emplacement y est déjà publié. */
  dejaOuvert: boolean;
};

/**
 * Où ouvrir ensuite.
 *
 * Le tri porte sur le nombre de bike sitters inscrits, parce que c'est le seul
 * chiffre qui décide : un quartier plein de cyclistes en attente et vide de
 * gens qui offrent une place n'est pas près d'ouvrir, il est près de décevoir.
 */
export async function quartiersACouvrir(): Promise<QuartierACouvrir[]> {
  // Deux ensembles séparés puis joints, plutôt qu'un `exists` corrélé : dans
  // une requête groupée, PostgreSQL refuse qu'une sous-requête référence la
  // colonne d'origine — même enveloppée dans la fonction qui sert de clé de
  // regroupement. La forme ci-dessous se lit d'ailleurs mieux.
  return interroger<QuartierACouvrir>(
    `with attente as (
       select lower(quartier)                                        as cle,
              initcap(quartier)                                      as quartier,
              count(*) filter (where role in ('bike_sitter', 'les_deux'))::int
                                                                     as bike_sitters,
              count(*) filter (where role in ('cycliste', 'les_deux'))::int
                                                                     as cyclistes
         from inscription_liste_attente
        group by lower(quartier), initcap(quartier)
     ),
     ouverts as (
       select distinct lower(quartier) as cle from emplacement where publie
     )
     select a.quartier,
            a.bike_sitters            as "bikeSitters",
            a.cyclistes,
            (o.cle is not null)       as "dejaOuvert"
       from attente a
       left join ouverts o on o.cle = a.cle
      order by a.bike_sitters desc, a.quartier`,
  );
}

export type EtatDuCatalogue = {
  partenaires: number;
  offresActives: number;
  exemplairesRestants: number;
  bonsEchanges: number;
  bonsUtilises: number;
};

export async function etatDuCatalogue(): Promise<EtatDuCatalogue> {
  const ligne = await uneLigne<EtatDuCatalogue>(
    `select
       (select count(*) from partenaire)::int                       as partenaires,
       (select count(*) from offre where active)::int               as "offresActives",
       (select coalesce(sum(stock_restant), 0) from offre where active)::int
                                                                    as "exemplairesRestants",
       (select count(*) from echange)::int                          as "bonsEchanges",
       (select count(*) from echange where utilise_le is not null)::int
                                                                    as "bonsUtilises"`,
  );

  return (
    ligne ?? {
      partenaires: 0,
      offresActives: 0,
      exemplairesRestants: 0,
      bonsEchanges: 0,
      bonsUtilises: 0,
    }
  );
}

export type EtatDesDons = {
  annonces: number;
  aRapprocher: number;
  totalAnnonceEnEuros: number;
};

/**
 * Les dons annoncés, jamais les donateurs.
 *
 * On compte des annonces et une somme ; ni le prénom ni l'adresse e-mail de
 * qui donne n'apparaissent. Un don ne donne aucun avantage sur le service, et
 * un écran qui nommerait les donateurs finirait par en donner un.
 */
export async function etatDesDons(): Promise<EtatDesDons> {
  const ligne = await uneLigne<EtatDesDons>(
    `select count(*)::int                                    as annonces,
            count(*) filter (where recu_le is null)::int     as "aRapprocher",
            coalesce(sum(montant_annonce), 0)::int           as "totalAnnonceEnEuros"
       from don`,
  );

  return (
    ligne ?? { annonces: 0, aRapprocher: 0, totalAnnonceEnEuros: 0 }
  );
}

export type MaillonsEnSuspens = {
  gardesContestees: number;
  maillonsRetenus: number;
};

export async function maillonsEnSuspens(): Promise<MaillonsEnSuspens> {
  const ligne = await uneLigne<MaillonsEnSuspens>(
    `select count(*)::int                              as "gardesContestees",
            coalesce(sum(nombre), 0)::int              as "maillonsRetenus"
       from maillon where etat = 'en_attente'`,
  );

  return ligne ?? { gardesContestees: 0, maillonsRetenus: 0 };
}
