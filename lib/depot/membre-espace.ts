import 'server-only';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import { messageRecu } from '@/lib/courriel/modeles';
import { notifier } from '@/lib/depot/notifications';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { mettreEnFile } from '@/lib/envois/file';
import {
  CRITERES,
  motifsDeLAvis,
  onPeutEncoreDeposer,
  type SensDeLAvis,
} from '@/lib/regles/avis-de-garde';
import {
  blocageCoupeLaConversation,
  conversationOuverte,
  type EtatDeGarde,
} from '@/lib/regles/garde';
import { MESSAGES_PAR_HEURE } from '@/lib/regles/limites';
import { estUnTypeVelo } from '@/lib/regles/velos';

import { AVIS_PUBLIE, avisRecus, type AvisAffiche } from './reseau';

/**
 * Ce qui appartient au membre dans son espace : ses vélos, ses conversations,
 * ses avis, son profil, les membres qu'il a bloqués.
 */

export type ResultatSimple = { ok: true } | { ok: false; texte: string };

// --- Présence ---------------------------------------------------------------------

/** « Vu il y a… » : mis à jour au plus toutes les cinq minutes. */
export async function signalerLaPresence(membreId: string): Promise<void> {
  await interroger(
    `update membre set vu_le = now()
      where id = $1 and (vu_le is null or vu_le < now() - interval '5 minutes')`,
    [membreId],
  );
}

// --- Les vélos ------------------------------------------------------------------------

/** Au-delà, ce n'est plus un particulier qui fait garder son vélo. */
export const VELOS_PAR_MEMBRE = 8;

export type Velo = {
  id: string;
  nom: string;
  type: string;
  marque: string | null;
  couleur: string | null;
  numeroDeCadreEnregistre: boolean;
};

export async function velosDuMembre(membreId: string): Promise<Velo[]> {
  return interroger<Velo>(
    `select id, nom, type, marque, couleur,
            numero_de_cadre is not null as "numeroDeCadreEnregistre"
       from velo where membre_id = $1 order by cree_le`,
    [membreId],
  );
}

export async function ajouterUnVelo(
  membreId: string,
  velo: {
    nom: string;
    type: string;
    marque: string;
    couleur: string;
    numeroDeCadre: string;
  },
): Promise<ResultatSimple> {
  const nom = velo.nom.trim().slice(0, 60);
  if (!nom) return { ok: false, texte: 'Donnez un nom à votre vélo.' };
  if (!estUnTypeVelo(velo.type)) {
    return { ok: false, texte: 'Choisissez le type de votre vélo.' };
  }
  return dansUneTransaction(async (client) => {
    const { rows } = await client.query<{ combien: number }>(
      'select count(*)::int as combien from velo where membre_id = $1',
      [membreId],
    );
    if ((rows[0]?.combien ?? 0) >= VELOS_PAR_MEMBRE) {
      return {
        ok: false,
        texte: 'Vous avez déjà enregistré huit vélos.',
      };
    }
    await client.query(
      `insert into velo (membre_id, nom, type, marque, couleur, numero_de_cadre)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        membreId,
        nom,
        velo.type,
        velo.marque.trim().slice(0, 60) || null,
        velo.couleur.trim().slice(0, 40) || null,
        velo.numeroDeCadre.trim().slice(0, 60) || null,
      ],
    );
    return { ok: true };
  });
}

export async function retirerUnVelo(
  membreId: string,
  veloId: string,
): Promise<ResultatSimple> {
  if (!/^[0-9a-f-]{36}$/.test(veloId)) {
    return { ok: false, texte: "Ce vélo n'est pas le vôtre." };
  }
  return dansUneTransaction(async (client) => {
    const velo = await client.query(
      'select 1 from velo where id = $1 and membre_id = $2 for update',
      [veloId, membreId],
    );
    if (!velo.rowCount)
      return { ok: false, texte: "Ce vélo n'est pas le vôtre." };

    const engage = await client.query(
      `select 1 from stationnement
        where velo_id = $1 and etat in ('demande', 'accepte', 'arrivee', 'en_cours', 'reprise_demandee', 'litige')`,
      [veloId],
    );
    if (engage.rowCount) {
      return {
        ok: false,
        texte: 'Ce vélo est engagé dans une garde en cours.',
      };
    }
    await client.query('delete from velo where id = $1', [veloId]);
    return { ok: true };
  });
}

// --- Les conversations ------------------------------------------------------------

export type Conversation = {
  id: string;
  etat: EtatDeGarde;
  debut: Date;
  fin: Date;
  autreId: string;
  autrePrenom: string;
  autreInitiale: string;
  autreVuLe: Date | null;
  dernierMessage: string | null;
  dernierMessageLe: Date | null;
  nonLu?: boolean;
};

export type ConversationOuverte = Conversation & {
  reprisLe: Date | null;
  /** Un blocage dans un sens ou dans l'autre. */
  bloquee: boolean;
};

/**
 * Une conversation par garde. Elle apparaît dès qu'un message a été écrit, ou
 * dès que la demande est acceptée.
 */
export async function conversationsDuMembre(
  membreId: string,
): Promise<Conversation[]> {
  return interroger<Conversation>(
    `select s.id, s.etat, s.debut, s.fin,
            autre.id as "autreId", autre.prenom as "autrePrenom",
            upper(left(autre.nom, 1)) as "autreInitiale", autre.vu_le as "autreVuLe",
            dernier.corps as "dernierMessage", dernier.ecrit_le as "dernierMessageLe",
            exists (select 1 from notification n
                     where n.membre_id = $1 and n.lien = '/messages/' || s.id
                       and n.lue_le is null and n.visible_le <= now()) as "nonLu"
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre autre on autre.id = case when s.cycliste_id = $1 then e.membre_id else s.cycliste_id end
       left join lateral (
         select corps, ecrit_le from message m
          where m.stationnement_id = s.id order by ecrit_le desc limit 1
       ) dernier on true
      where (s.cycliste_id = $1 or e.membre_id = $1)
        and (dernier.corps is not null
             or s.etat in ('accepte', 'arrivee', 'en_cours', 'reprise_demandee', 'litige'))
      order by coalesce(dernier.ecrit_le, s.repondu_le, s.demande_le) desc
      limit 100`,
    [membreId],
  );
}

export type MessageDeConversation = {
  id: string;
  deMoi: boolean;
  corps: string;
  ecritLe: Date;
};

export async function conversation(
  membreId: string,
  gardeId: string,
): Promise<{
  garde: ConversationOuverte;
  messages: MessageDeConversation[];
} | null> {
  if (!/^[0-9a-f-]{36}$/.test(gardeId)) return null;
  const garde = await uneLigne<ConversationOuverte>(
    `select s.id, s.etat, s.debut, s.fin, s.repris_le as "reprisLe",
            autre.id as "autreId", autre.prenom as "autrePrenom",
            upper(left(autre.nom, 1)) as "autreInitiale", autre.vu_le as "autreVuLe",
            null as "dernierMessage", null as "dernierMessageLe",
            ${BLOCAGE_ENTRE} as bloquee
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre autre on autre.id = case when s.cycliste_id = $2 then e.membre_id else s.cycliste_id end
      where s.id = $1 and (s.cycliste_id = $2 or e.membre_id = $2)`,
    [gardeId, membreId],
  );
  if (!garde) return null;
  const [messages] = await Promise.all([
    interroger<MessageDeConversation>(
      `select id, auteur_id = $2 as "deMoi", corps, ecrit_le as "ecritLe"
         from message where stationnement_id = $1 order by ecrit_le`,
      [gardeId, membreId],
    ),
    // Lire la conversation vaut lecture de sa notification : sans cela, le
    // message suivant ne préviendrait plus personne.
    interroger(
      `update notification set lue_le = now()
        where membre_id = $1 and lien = $2 and lue_le is null and visible_le <= now()`,
      [membreId, `/messages/${gardeId}`],
    ),
  ]);
  return { garde, messages };
}

/** Un blocage entre le membre ($2) et l'autre personne, dans un sens ou dans l'autre. */
const BLOCAGE_ENTRE = `exists (select 1 from blocage b
   where (b.membre_id = $2 and b.bloque_id = autre.id)
      or (b.membre_id = autre.id and b.bloque_id = $2))`;

/** La conversation accepte-t-elle encore un message ? */
export function conversationEcrivable(garde: {
  etat: EtatDeGarde;
  reprisLe: Date | null;
  bloquee: boolean;
}): boolean {
  const moment = {
    reprisLe: garde.reprisLe ? new Date(garde.reprisLe) : null,
    maintenant: new Date(),
  };
  if (!conversationOuverte(garde.etat, moment)) return false;
  return !(garde.bloquee && blocageCoupeLaConversation(garde.etat));
}

export async function ecrireUnMessage(
  membreId: string,
  gardeId: string,
  corps: string,
): Promise<ResultatSimple> {
  const texte = corps.trim();
  if (!texte) return { ok: false, texte: 'Écrivez votre message.' };
  if (texte.length > 2000) {
    return {
      ok: false,
      texte: 'Un message peut contenir jusqu’à 2000 caractères.',
    };
  }
  if (!/^[0-9a-f-]{36}$/.test(gardeId)) {
    return { ok: false, texte: 'Cette conversation ne vous concerne pas.' };
  }
  return dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      etat: EtatDeGarde;
      repris_le: Date | null;
      bloquee: boolean;
      autre_id: string;
      autre_prenom: string;
      autre_email: string;
      mon_prenom: string;
      quartier: string;
    }>(
      `select s.etat, s.repris_le, ${BLOCAGE_ENTRE} as bloquee,
              autre.id as autre_id, autre.prenom as autre_prenom, autre.email as autre_email,
              moi.prenom as mon_prenom, e.quartier
         from stationnement s
         join emplacement e on e.id = s.emplacement_id
         join membre moi on moi.id = $2
         join membre autre on autre.id = case when s.cycliste_id = $2 then e.membre_id else s.cycliste_id end
        where s.id = $1 and (s.cycliste_id = $2 or e.membre_id = $2)`,
      [gardeId, membreId],
    );
    const garde = rows[0];
    if (!garde)
      return { ok: false, texte: 'Cette conversation ne vous concerne pas.' };
    if (
      !conversationEcrivable({
        etat: garde.etat,
        reprisLe: garde.repris_le,
        bloquee: garde.bloquee,
      })
    ) {
      return {
        ok: false,
        texte: 'Cette conversation ne reçoit plus de messages.',
      };
    }
    if (await limiteDejaAtteinte(MESSAGES_PAR_HEURE, membreId, client)) {
      return {
        ok: false,
        texte:
          'Vous avez écrit beaucoup de messages en peu de temps. Vous pourrez continuer dans un moment.',
      };
    }
    await noterUneTentative('message_envoye', membreId, client);
    await client.query(
      'insert into message (stationnement_id, auteur_id, corps) values ($1, $2, $3)',
      [gardeId, membreId, texte],
    );

    // Une seule notification tant que la précédente n'a pas été lue : dix
    // messages d'affilée ne font pas dix sonneries.
    const dejaPrevenu = await client.query(
      `select 1 from notification
        where membre_id = $1 and lien = $2 and lue_le is null`,
      [garde.autre_id, `/messages/${gardeId}`],
    );
    if (!dejaPrevenu.rowCount) {
      await notifier(client, garde.autre_id, {
        texte: 'Nouveau message de {prenom}.',
        valeurs: { prenom: garde.mon_prenom },
        lien: `/messages/${gardeId}`,
      });
      await mettreEnFile(
        garde.autre_email,
        messageRecu({
          prenomDuDestinataire: garde.autre_prenom,
          prenomDeLAuteur: garde.mon_prenom,
          quartier: garde.quartier,
          corps: texte,
        }),
        { client, aPropos: `stationnement ${gardeId}` },
      );
    }
    return { ok: true };
  });
}

// --- Les avis ---------------------------------------------------------------------------

export async function deposerUnAvis(
  membreId: string,
  gardeId: string,
  avis: { note: number; criteres: Record<string, number>; texte: string },
): Promise<ResultatSimple> {
  if (!/^[0-9a-f-]{36}$/.test(gardeId)) {
    return { ok: false, texte: 'Cette garde ne vous concerne pas.' };
  }
  return dansUneTransaction(async (client) => {
    const { rows } = await client.query<{
      etat: EtatDeGarde;
      repris_le: Date | null;
      cycliste_id: string;
      bike_sitter_id: string;
    }>(
      `select s.etat, s.repris_le, s.cycliste_id, e.membre_id as bike_sitter_id
         from stationnement s join emplacement e on e.id = s.emplacement_id
        where s.id = $1 and (s.cycliste_id = $2 or e.membre_id = $2)
        for update of s`,
      [gardeId, membreId],
    );
    const garde = rows[0];
    if (!garde)
      return { ok: false, texte: 'Cette garde ne vous concerne pas.' };
    if (garde.etat !== 'termine' || !garde.repris_le) {
      return {
        ok: false,
        texte: 'Un avis se dépose une fois la garde terminée.',
      };
    }
    if (!onPeutEncoreDeposer(new Date(garde.repris_le), new Date())) {
      return { ok: false, texte: 'Le délai pour laisser un avis est passé.' };
    }

    const sens: SensDeLAvis =
      garde.cycliste_id === membreId
        ? 'cycliste_vers_bike_sitter'
        : 'bike_sitter_vers_cycliste';
    const criteres = Object.fromEntries(
      Object.entries(avis.criteres).filter(([cle]) =>
        CRITERES[sens].includes(cle),
      ),
    );
    const texte = avis.texte.trim();
    const motifs = motifsDeLAvis({ note: avis.note, criteres, texte, sens });
    if (motifs.length > 0) return { ok: false, texte: motifs[0]! };

    const cible =
      sens === 'cycliste_vers_bike_sitter'
        ? garde.bike_sitter_id
        : garde.cycliste_id;
    const insere = await client.query(
      `insert into avis_sur_une_garde (stationnement_id, auteur_id, cible_id, sens, note, criteres, texte)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (stationnement_id, auteur_id) do nothing`,
      [
        gardeId,
        membreId,
        cible,
        sens,
        avis.note,
        JSON.stringify(criteres),
        texte || null,
      ],
    );
    if (!insere.rowCount)
      return {
        ok: false,
        texte: 'Vous avez déjà laissé un avis sur cette garde.',
      };

    // Publication à l'aveugle : les deux avis paraissent ensemble.
    const paire = await client.query(
      `update avis_sur_une_garde set publie_le = now()
        where stationnement_id = $1 and publie_le is null
          and (select count(*) from avis_sur_une_garde where stationnement_id = $1) = 2
        returning auteur_id`,
      [gardeId],
    );
    if (paire.rowCount) {
      await notifier(client, cible, {
        texte: 'Les avis de votre garde sont publiés.',
        lien: `/membres/${membreId}`,
      });
    }
    return { ok: true };
  });
}

export type AvisDonne = {
  id: string;
  ciblePrenom: string;
  note: number;
  texte: string | null;
  publie: boolean;
  ecritLe: Date;
};

export async function avisDuMembre(membreId: string): Promise<{
  recus: AvisAffiche[];
  donnes: AvisDonne[];
}> {
  const [recus, donnes] = await Promise.all([
    avisRecus(membreId, null),
    interroger<AvisDonne>(
      `select a.id, m.prenom as "ciblePrenom", a.note, a.texte, a.ecrit_le as "ecritLe",
              (${AVIS_PUBLIE}) as publie
         from avis_sur_une_garde a join membre m on m.id = a.cible_id
        where a.auteur_id = $1
        order by a.ecrit_le desc`,
      [membreId],
    ),
  ]);
  return { recus, donnes };
}

/** Une seule réponse, par la personne visée, après publication. */
export async function repondreAUnAvis(
  membreId: string,
  avisId: string,
  reponse: string,
): Promise<ResultatSimple> {
  if (!/^[0-9a-f-]{36}$/.test(avisId)) {
    return { ok: false, texte: "Cette réponse n'est pas possible." };
  }
  const texte = reponse.trim();
  if (texte.length < 10)
    return { ok: false, texte: 'Écrivez au moins une phrase.' };
  if (texte.length > 600) {
    return {
      ok: false,
      texte: 'Une réponse peut contenir jusqu’à 600 caractères.',
    };
  }
  const ligne = await uneLigne<{ auteur_id: string }>(
    `update avis_sur_une_garde a set reponse = $3, repondu_le = now()
      where a.id = $1 and a.cible_id = $2 and a.reponse is null and ${AVIS_PUBLIE}
      returning auteur_id`,
    [avisId, membreId, texte],
  );
  if (!ligne) return { ok: false, texte: "Cette réponse n'est pas possible." };
  await dansUneTransaction((client) =>
    notifier(client, ligne.auteur_id, {
      texte: 'Votre avis a reçu une réponse.',
      lien: `/membres/${membreId}`,
    }),
  );
  return { ok: true };
}

/** On ne supprime pas un avis qui déplaît : on le signale, la modération tranche. */
export async function contesterUnAvis(
  membreId: string,
  avisId: string,
  motif: string,
): Promise<ResultatSimple> {
  if (!/^[0-9a-f-]{36}$/.test(avisId)) {
    return { ok: false, texte: 'Cet avis est déjà signalé.' };
  }
  return dansUneTransaction(async (client) => {
    const { rowCount } = await client.query(
      `update avis_sur_une_garde set conteste_le = now()
        where id = $1 and cible_id = $2 and conteste_le is null`,
      [avisId, membreId],
    );
    if (!rowCount) return { ok: false, texte: 'Cet avis est déjà signalé.' };
    await client.query(
      `insert into signalement (auteur_id, cible_type, cible, motif, details)
       values ($1, 'avis', $2, 'Avis contesté', $3)`,
      [membreId, avisId, motif.trim().slice(0, 1000) || null],
    );
    return { ok: true };
  });
}

// --- Le profil public -----------------------------------------------------------------

export type ProfilPublic = {
  id: string;
  prenom: string;
  initiale: string;
  membreDepuis: number;
  vuLe: Date | null;
  identiteVerifiee: boolean;
  telephoneVerifie: boolean;
  emailVerifie: boolean;
  bikeSitter: boolean;
  velosAccueillis: number;
  velosConfies: number;
  emplacements: {
    reference: string;
    type: string;
    quartier: string;
    capacite: number;
  }[];
  avis: AvisAffiche[];
  bloque: boolean;
};

/**
 * Le réseau n'est pas un annuaire. Le profil d'un bike sitter se voit, parce
 * qu'on envisage de lui confier son vélo ; celui d'un autre membre ne se voit
 * que si l'on a une garde en commun.
 */
export async function profilPublic(
  membreId: string,
  cibleId: string,
): Promise<ProfilPublic | 'refuse' | null> {
  if (!/^[0-9a-f-]{36}$/.test(cibleId)) return null;
  const ligne = await uneLigne<
    Omit<ProfilPublic, 'emplacements' | 'avis'> & { visible: boolean }
  >(
    `select m.id, m.prenom, upper(left(m.nom, 1)) as initiale,
            extract(year from m.cree_le)::int as "membreDepuis", m.vu_le as "vuLe",
            m.verification = 'verifiee' as "identiteVerifiee",
            m.telephone_verifie_le is not null as "telephoneVerifie",
            m.email_verifie_le is not null as "emailVerifie",
            exists (select 1 from emplacement e where e.membre_id = m.id and e.publie) as "bikeSitter",
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where e.membre_id = m.id and s.etat = 'termine') as "velosAccueillis",
            (select count(*)::int from stationnement s
              where s.cycliste_id = m.id and s.etat = 'termine') as "velosConfies",
            exists (select 1 from blocage b where b.membre_id = $2 and b.bloque_id = m.id) as bloque,
            (m.id = $2
             or (select moderateur from membre where id = $2)
             or exists (select 1 from emplacement e where e.membre_id = m.id and e.publie)
             or exists (select 1 from stationnement s join emplacement e on e.id = s.emplacement_id
                         where (s.cycliste_id = m.id and e.membre_id = $2)
                            or (s.cycliste_id = $2 and e.membre_id = m.id))) as visible
       from membre m
      where m.id = $1 and not m.suspendu
        -- Qui vous a bloqué disparaît de votre vue, sans vous l'annoncer.
        and not exists (select 1 from blocage b where b.membre_id = m.id and b.bloque_id = $2)`,
    [cibleId, membreId],
  );
  if (!ligne) return null;
  if (!ligne.visible) return 'refuse';

  const [emplacements, avis] = await Promise.all([
    interroger<ProfilPublic['emplacements'][number]>(
      `select reference, type, quartier, capacite from emplacement_visible
        where bike_sitter_id = $1 order by cree_le`,
      [cibleId],
    ),
    avisRecus(
      cibleId,
      ligne.bikeSitter && cibleId !== membreId
        ? 'cycliste_vers_bike_sitter'
        : null,
    ),
  ]);
  return { ...ligne, emplacements, avis };
}

export async function basculerLeBlocage(
  membreId: string,
  cibleId: string,
): Promise<ResultatSimple> {
  if (membreId === cibleId) {
    return { ok: false, texte: 'Vous ne pouvez pas vous bloquer vous-même.' };
  }
  if (!/^[0-9a-f-]{36}$/.test(cibleId)) {
    return { ok: false, texte: "Ce membre n'existe pas." };
  }
  const supprime = await interroger(
    'delete from blocage where membre_id = $1 and bloque_id = $2 returning bloque_id',
    [membreId, cibleId],
  );
  if (supprime.length === 0) {
    await interroger(
      `insert into blocage (membre_id, bloque_id)
       select $1, id from membre where id = $2
       on conflict do nothing`,
      [membreId, cibleId],
    );
  }
  return { ok: true };
}

export async function signaler(
  membreId: string,
  signalement: {
    cibleType: 'membre' | 'emplacement';
    cible: string;
    motif: string;
    details: string;
  },
): Promise<ResultatSimple> {
  const motif = signalement.motif.trim().slice(0, 120);
  if (!motif) return { ok: false, texte: 'Choisissez un motif.' };
  const cible = await cibleDuSignalement(
    membreId,
    signalement.cibleType,
    signalement.cible,
  );
  if (!cible) return { ok: false, texte: "Ce signalement n'a pas de cible." };
  // Un second signalement sur la même cible n'apprend rien de plus à la
  // modération ; il allonge seulement sa file.
  const deja = await uneLigne(
    `select 1 from signalement
      where auteur_id = $1 and cible_type = $2 and cible = $3 and etat <> 'traite'`,
    [membreId, signalement.cibleType, signalement.cible],
  );
  if (deja) {
    return {
      ok: false,
      texte: 'Vous avez déjà un signalement en cours sur cette cible.',
    };
  }
  await interroger(
    `insert into signalement (auteur_id, cible_type, cible, motif, details)
     values ($1, $2, $3, $4, $5)`,
    [
      membreId,
      signalement.cibleType,
      signalement.cible.slice(0, 100),
      motif,
      signalement.details.trim().slice(0, 1000) || null,
    ],
  );
  return { ok: true };
}

/**
 * Ce qu'on signale doit exister et être visible de qui le signale : un membre
 * dont on voit le profil, un emplacement publié. Rend le nom à afficher.
 */
export type CibleDuSignalement =
  | { type: 'membre'; nom: string }
  | { type: 'emplacement'; genre: string; quartier: string };

export async function cibleDuSignalement(
  membreId: string,
  type: 'membre' | 'emplacement',
  cible: string,
): Promise<CibleDuSignalement | null> {
  if (type === 'membre') {
    if (cible === membreId) return null;
    const profil = await profilPublic(membreId, cible);
    return profil && profil !== 'refuse'
      ? { type, nom: `${profil.prenom} ${profil.initiale}.` }
      : null;
  }
  if (!/^[a-z0-9-]{3,60}$/.test(cible)) return null;
  const ligne = await uneLigne<{ genre: string; quartier: string }>(
    'select type as genre, quartier from emplacement_visible where reference = $1',
    [cible],
  );
  return ligne ? { type, ...ligne } : null;
}

// --- Le profil du membre ------------------------------------------------------------

export type MonProfil = {
  prenom: string;
  initiale: string;
  membreDepuis: number;
  identiteVerifiee: boolean;
  verification: string;
  telephoneVerifie: boolean;
  emailVerifie: boolean;
  gardes: number;
  velosConfies: number;
  velosAccueillis: number;
  emplacements: number;
  moderateur: boolean;
};

export async function monProfil(membreId: string): Promise<MonProfil | null> {
  return uneLigne<MonProfil>(
    `select m.prenom, upper(left(m.nom, 1)) as initiale,
            extract(year from m.cree_le)::int as "membreDepuis",
            m.verification = 'verifiee' as "identiteVerifiee", m.verification,
            m.telephone_verifie_le is not null as "telephoneVerifie",
            m.email_verifie_le is not null as "emailVerifie",
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where s.etat = 'termine' and (s.cycliste_id = m.id or e.membre_id = m.id)) as gardes,
            (select count(*)::int from stationnement s
              where s.cycliste_id = m.id and s.etat = 'termine') as "velosConfies",
            (select count(*)::int from stationnement s join emplacement e on e.id = s.emplacement_id
              where e.membre_id = m.id and s.etat = 'termine') as "velosAccueillis",
            (select count(*)::int from emplacement e where e.membre_id = m.id) as emplacements,
            m.moderateur
       from membre m where m.id = $1`,
    [membreId],
  );
}
