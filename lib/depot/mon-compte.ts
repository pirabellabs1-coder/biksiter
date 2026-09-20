import 'server-only';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { compteSupprimable, nomModifiable } from '@/lib/regles/comptes';
import { CONNEXIONS_REFUSEES } from '@/lib/regles/limites';
import { motDePasseCorrespond } from '@/lib/securite/mot-de-passe';

import type { ResultatSimple } from './membre-espace';

/**
 * Ce que le membre règle lui-même : ses alertes, les comptes qu'il a bloqués,
 * son nom, l'export de ses données et la suppression de son compte.
 */

const IDENTIFIANT = /^[0-9a-f-]{36}$/;

// --- Les alertes ----------------------------------------------------------------------

export type Alerte = {
  id: string;
  lieu: string;
  jour: string | null;
  de: string | null;
  a: string | null;
  creeeLe: Date;
};

export async function alertesDuMembre(membreId: string): Promise<Alerte[]> {
  return interroger<Alerte>(
    `select id, lieu, to_char(jour, 'YYYY-MM-DD') as jour,
            to_char(heure_de, 'HH24:MI') as de, to_char(heure_a, 'HH24:MI') as a,
            creee_le as "creeeLe"
       from alerte_de_recherche where membre_id = $1
      order by creee_le desc`,
    [membreId],
  );
}

export async function retirerUneAlerte(
  membreId: string,
  alerteId: string,
): Promise<void> {
  if (!IDENTIFIANT.test(alerteId)) return;
  await interroger(
    'delete from alerte_de_recherche where id = $1 and membre_id = $2',
    [alerteId, membreId],
  );
}

// --- Les comptes bloqués --------------------------------------------------------------

export type CompteBloque = { id: string; prenom: string; initiale: string };

export async function comptesBloques(
  membreId: string,
): Promise<CompteBloque[]> {
  return interroger<CompteBloque>(
    `select m.id, m.prenom, upper(left(m.nom, 1)) as initiale
       from blocage b join membre m on m.id = b.bloque_id
      where b.membre_id = $1
      order by b.cree_le desc`,
    [membreId],
  );
}

// --- Le nom ---------------------------------------------------------------------------

export type Identite = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  verification: string;
};

export async function identiteDuMembre(
  membreId: string,
): Promise<Identite | null> {
  return uneLigne<Identite>(
    'select prenom, nom, email, telephone, verification from membre where id = $1',
    [membreId],
  );
}

export async function modifierLeNom(
  membreId: string,
  saisie: { prenom: string; nom: string },
): Promise<ResultatSimple> {
  const prenom = saisie.prenom.trim().slice(0, 60);
  const nom = saisie.nom.trim().slice(0, 60);
  if (!prenom) return { ok: false, texte: 'Indiquez votre prénom.' };
  if (!nom) return { ok: false, texte: 'Indiquez votre nom.' };
  const identite = await identiteDuMembre(membreId);
  if (!identite) return { ok: false, texte: "Ce membre n'existe pas." };
  if (!nomModifiable(identite.verification)) {
    return {
      ok: false,
      texte:
        'Votre nom figure sur la pièce vérifiée. Pour le modifier, écrivez-nous en expliquant pourquoi.',
    };
  }
  // La condition est répétée dans la requête : entre la lecture et l'écriture,
  // une pièce a pu être envoyée.
  const { length } = await interroger(
    `update membre set prenom = $2, nom = $3
      where id = $1 and verification not in ('verifiee', 'en_cours')
      returning id`,
    [membreId, prenom, nom],
  );
  return length
    ? { ok: true }
    : {
        ok: false,
        texte:
          'Votre nom figure sur la pièce vérifiée. Pour le modifier, écrivez-nous en expliquant pourquoi.',
      };
}

// --- L'export -------------------------------------------------------------------------

/**
 * Tout ce que le réseau sait du membre, dans un format que d'autres outils
 * lisent. Les données des autres personnes n'y figurent pas : ni l'adresse
 * d'un bike sitter, ni le nom complet de quelqu'un, ni le texte de leurs
 * messages.
 */
export async function donneesDuMembre(
  membreId: string,
): Promise<Record<string, unknown>> {
  const [
    compte,
    velos,
    emplacements,
    gardes,
    messages,
    avisDonnes,
    avisRecus,
    alertes,
    points,
    bons,
    favoris,
    prolongations,
  ] = await Promise.all([
    uneLigne(
      `select prenom, nom, email, telephone, verification, cree_le as "membreDepuis",
                email_verifie_le as "emailConfirmeLe", telephone_verifie_le as "telephoneVerifieLe",
                to_char(tranquillite_de, 'HH24:MI') as "tranquilliteDe",
                to_char(tranquillite_a, 'HH24:MI') as "tranquilliteA",
                apparait_au_classement as "apparaitAuClassement"
           from membre where id = $1`,
      [membreId],
    ),
    interroger(
      `select nom, type, marque, couleur, numero_de_cadre as "numeroDeCadre", cree_le as "ajouteLe"
           from velo where membre_id = $1 order by cree_le`,
      [membreId],
    ),
    interroger(
      `select reference, type, quartier, adresse_exacte as "adresseExacte", capacite, publie
           from emplacement where membre_id = $1 order by reference`,
      [membreId],
    ),
    interroger(
      `select s.id, case when s.cycliste_id = $1 then 'cycliste' else 'bike sitter' end as role,
                s.etat, s.debut, s.fin, s.type_velo as "typeDeVelo", s.demande_le as "demandeLe",
                e.quartier
           from stationnement s join emplacement e on e.id = s.emplacement_id
          where s.cycliste_id = $1 or e.membre_id = $1
          order by s.demande_le`,
      [membreId],
    ),
    interroger(
      `select stationnement_id as garde, corps as texte, ecrit_le as "ecritLe"
           from message where auteur_id = $1 order by ecrit_le`,
      [membreId],
    ),
    interroger(
      `select stationnement_id as garde, note, criteres, texte, ecrit_le as "ecritLe"
           from avis_sur_une_garde where auteur_id = $1 order by ecrit_le`,
      [membreId],
    ),
    interroger(
      `select stationnement_id as garde, note, criteres, texte, reponse, publie_le as "publieLe"
           from avis_sur_une_garde where cible_id = $1 and publie_le is not null order by publie_le`,
      [membreId],
    ),
    interroger(
      `select lieu, jour, heure_de as de, heure_a as a, creee_le as "creeeLe"
           from alerte_de_recherche where membre_id = $1 order by creee_le`,
      [membreId],
    ),
    interroger(
      `select nature, nombre, etat, motif, stationnement_id as garde, cree_le as "le"
           from maillon where membre_id = $1 order by cree_le`,
      [membreId],
    ),
    interroger(
      `select o.titre as avantage, e.code, e.cout_en_maillons as points,
                e.echange_le as "echangeLe", e.utilise_le as "utiliseLe"
           from echange e join offre o on o.id = e.offre_id
          where e.membre_id = $1 order by e.echange_le`,
      [membreId],
    ),
    interroger(
      `select e.reference, f.cree_le as "ajouteLe"
           from favori f join emplacement e on e.id = f.emplacement_id
          where f.membre_id = $1 order by f.cree_le`,
      [membreId],
    ),
    interroger(
      `select p.stationnement_id as garde, p.ancienne_fin as "ancienneFin",
                p.nouvelle_fin as "nouvelleFin", p.motif, p.etat, p.demandee_le as "demandeeLe"
           from prolongation p join stationnement s on s.id = p.stationnement_id
          where s.cycliste_id = $1 order by p.demandee_le`,
      [membreId],
    ),
  ]);
  return {
    exporteLe: new Date().toISOString(),
    compte,
    velos,
    emplacements,
    gardes,
    messagesEcrits: messages,
    avisDonnes,
    avisRecus,
    alertes,
    apparaitAuClassement: (compte as { apparaitAuClassement?: boolean } | null)?.apparaitAuClassement ?? false,
    points,
    bons,
    favoris,
    prolongationsDemandees: prolongations,
  };
}

// --- La suppression -------------------------------------------------------------------

const ETATS_DES_GARDES = `select s.etat from stationnement s join emplacement e on e.id = s.emplacement_id
  where s.cycliste_id = $1 or e.membre_id = $1`;

export async function compteSupprimableMaintenant(
  membreId: string,
): Promise<boolean> {
  const lignes = await interroger<{ etat: string }>(ETATS_DES_GARDES, [
    membreId,
  ]);
  return compteSupprimable(lignes.map((ligne) => ligne.etat));
}

export async function supprimerLeCompte(
  membreId: string,
  motDePasse: string,
): Promise<ResultatSimple> {
  const compte = await uneLigne<{ email: string; empreinte: string }>(
    'select email, empreinte from membre where id = $1',
    [membreId],
  );
  if (!compte) return { ok: false, texte: "Ce membre n'existe pas." };

  // Le même compteur que la connexion : un appareil resté ouvert ne doit pas
  // devenir un moyen de deviner le mot de passe. Le verrou fait passer les
  // essais un par un : sans lui, des envois simultanés passeraient tous le
  // contrôle avant que le premier échec ne soit compté.
  const motDePasseAccepte = await dansUneTransaction(async (client) => {
    await client.query('select pg_advisory_xact_lock(hashtext($1))', [
      `suppression:${membreId}`,
    ]);
    if (await limiteDejaAtteinte(CONNEXIONS_REFUSEES, compte.email, client)) {
      return 'limite' as const;
    }
    if (!(await motDePasseCorrespond(motDePasse, compte.empreinte))) {
      await noterUneTentative('connexion_refusee', compte.email, client);
      return 'refuse' as const;
    }
    return 'accepte' as const;
  });
  if (motDePasseAccepte === 'limite') {
    return {
      ok: false,
      texte:
        'Plusieurs essais n’ont pas abouti. Par sécurité, patientez un quart d’heure.',
    };
  }
  if (motDePasseAccepte === 'refuse') {
    return { ok: false, texte: 'Ce mot de passe ne correspond pas.' };
  }

  return dansUneTransaction(async (client) => {
    await client.query('select id from membre where id = $1 for update', [
      membreId,
    ]);
    // Une demande vers l'un de ses emplacements ne touche pas la ligne du
    // membre : on verrouille aussi ses emplacements pour qu'aucune n'arrive
    // entre la vérification et l'effacement.
    await client.query(
      'select id from emplacement where membre_id = $1 for update',
      [membreId],
    );
    const { rows } = await client.query<{ etat: string }>(ETATS_DES_GARDES, [
      membreId,
    ]);
    if (!compteSupprimable(rows.map((ligne) => ligne.etat))) {
      return {
        ok: false,
        texte:
          'Une demande ou une garde est encore en cours. Vous pourrez supprimer votre compte une fois qu’elle sera terminée.',
      };
    }
    const signale = await client.query(
      `select 1 from signalement
        where etat <> 'traite' and cible_type = 'membre' and cible = $1::text`,
      [membreId],
    );
    if (signale.rowCount) {
      return {
        ok: false,
        texte:
          'Un signalement est en cours d’examen par la modération. Vous pourrez supprimer votre compte une fois qu’il sera traité.',
      };
    }
    // Ce qui identifie la personne disparaît ; ce qui appartient aussi aux
    // autres (une garde passée, un avis reçu) reste, sans nom.
    const effacements = [
      'delete from session where membre_id = $1',
      'delete from velo where membre_id = $1',
      'delete from alerte_de_recherche where membre_id = $1',
      'delete from favori where membre_id = $1',
      `update prolongation set motif = null
        where stationnement_id in (select id from stationnement where cycliste_id = $1)`,
      'delete from notification where membre_id = $1',
      'delete from blocage where membre_id = $1 or bloque_id = $1',
      'delete from piece_didentite where membre_id = $1',
      'delete from code_telephone where membre_id = $1',
      'delete from jeton_a_usage_unique where membre_id = $1',
      'delete from message where auteur_id = $1',
      `delete from photo_emplacement
        where emplacement_id in (select id from emplacement where membre_id = $1)`,
      // La position redevient le centre de la zone affichée : la ligne reste
      // pour les gardes passées, mais ne désigne plus un domicile.
      `update emplacement
          set publie = false, adresse_exacte = 'Adresse effacée',
              precisions = null, description = null, precision_d_acces = null,
              position = st_setsrid(st_makepoint(
                round((st_x(position::geometry) / 0.008)::numeric) * 0.008,
                round((st_y(position::geometry) / 0.005)::numeric) * 0.005), 4326)::geography
        where membre_id = $1`,
      `update stationnement set message = null where cycliste_id = $1`,
      `update constat set note = null where etabli_par = $1`,
      `update avis_sur_une_garde set texte = null, reponse = null where auteur_id = $1`,
      `update avis_sur_une_garde set reponse = null where cible_id = $1`,
      `delete from candidature_emplacement
        where lower(email) = (select lower(email) from membre where id = $1)`,
      `delete from message_sortant
        where lower(destinataire) = (select lower(email) from membre where id = $1)`,
      `update membre
          set prenom = 'Ancien membre', nom = '—', telephone = null,
              email = 'supprime-' || id || '@bike-sitters.invalid',
              empreinte = 'supprime', suspendu = true, moderateur = false,
              verification = 'absente', verifie_le = null,
              telephone_verifie_le = null, email_verifie_le = null,
              tranquillite_de = null, tranquillite_a = null,
              apparait_au_classement = false, supprime_le = now()
        where id = $1`,
    ];
    for (const requete of effacements) {
      await client.query(requete, [membreId]);
    }
    return { ok: true };
  });
}
