import 'server-only';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import { decisionDeFavori, type DecisionDeFavori } from '@/lib/regles/favoris';

import { AVIS_PUBLIE } from './reseau';

/**
 * Les favoris ne lisent que des lieux visibles (`emplacement_visible`) : un
 * lieu retiré, mis en pause ou tenu par un membre bloqué sort de la liste sans
 * être supprimé, et y revient s'il redevient visible.
 */

const REFERENCE = /^[a-z0-9-]{3,60}$/;

const VISIBLE_POUR = `not m.suspendu
  and not exists (select 1 from blocage b
                   where (b.membre_id = $1 and b.bloque_id = v.bike_sitter_id)
                      or (b.membre_id = v.bike_sitter_id and b.bloque_id = $1))`;

export async function estEnFavori(
  membreId: string,
  reference: string,
): Promise<boolean> {
  if (!REFERENCE.test(reference)) return false;
  const ligne = await uneLigne<{ oui: boolean }>(
    `select true as oui from favori f join emplacement e on e.id = f.emplacement_id
      where f.membre_id = $1 and e.reference = $2`,
    [membreId, reference],
  );
  return Boolean(ligne);
}

export async function basculerLeFavori(
  membreId: string,
  reference: string,
  voulu: 'ajouter' | 'retirer',
): Promise<DecisionDeFavori | 'introuvable'> {
  if (!REFERENCE.test(reference)) return 'introuvable';
  return dansUneTransaction(async (client) => {
    const { rows } = await client.query<{ id: string; bike_sitter_id: string }>(
      `select e.id, v.bike_sitter_id
         from emplacement_visible v
         join emplacement e on e.reference = v.reference
         join membre m on m.id = v.bike_sitter_id
        where v.reference = $2 and ${VISIBLE_POUR}`,
      [membreId, reference],
    );
    const lieu = rows[0];
    // Son propre lieu ne se met pas en favori.
    if (!lieu || lieu.bike_sitter_id === membreId) return 'introuvable';

    // Le verrou sur le membre sérialise ses ajouts : deux clics simultanés ne
    // dépassent pas la limite.
    await client.query('select id from membre where id = $1 for update', [
      membreId,
    ]);
    const { rows: etat } = await client.query<{
      deja: boolean;
      nombre: number;
    }>(
      `select exists (select 1 from favori where membre_id = $1 and emplacement_id = $2) as deja,
              (select count(*)::int from favori where membre_id = $1) as nombre`,
      [membreId, lieu.id],
    );
    const deja = etat[0]!.deja;
    // Un double clic ne défait pas ce qu'on vient de faire : l'écran dit ce
    // qu'il veut obtenir, et on ne fait que ce qui manque.
    if ((voulu === 'ajouter') === deja) return voulu === 'ajouter' ? 'ajouter' : 'retirer';
    const decision = decisionDeFavori(deja, etat[0]!.nombre);
    if (decision === 'ajouter') {
      await client.query(
        'insert into favori (membre_id, emplacement_id) values ($1, $2)',
        [membreId, lieu.id],
      );
    } else if (decision === 'retirer') {
      await client.query(
        'delete from favori where membre_id = $1 and emplacement_id = $2',
        [membreId, lieu.id],
      );
    }
    return decision;
  });
}

export type Favori = {
  reference: string;
  prenom: string;
  initialeDuNom: string;
  type: string;
  quartier: string;
  identiteVerifiee: boolean;
  accepteLesVae: boolean;
  nombreDePhotos: number;
  gardesMenees: number;
  noteMoyenne: number | null;
  nombreDAvis: number;
};

export async function mesFavoris(membreId: string): Promise<Favori[]> {
  const lignes = await interroger<Favori>(
    `select v.reference,
            v.prenom_du_bike_sitter as prenom,
            upper(left(m.nom, 1)) as "initialeDuNom",
            v.type, v.quartier,
            m.verification = 'verifiee' as "identiteVerifiee",
            'Électrique' = any(v.velos_acceptes) as "accepteLesVae",
            (select count(*)::int from photo_emplacement ph where ph.emplacement_id = e.id) as "nombreDePhotos",
            (select count(*)::int from stationnement s join emplacement e2 on e2.id = s.emplacement_id
              where e2.membre_id = v.bike_sitter_id and s.etat = 'termine') as "gardesMenees",
            (select avg(a.note)::float8 from avis_sur_une_garde a
              where a.cible_id = v.bike_sitter_id and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}) as "noteMoyenne",
            (select count(*)::int from avis_sur_une_garde a
              where a.cible_id = v.bike_sitter_id and a.sens = 'cycliste_vers_bike_sitter' and ${AVIS_PUBLIE}) as "nombreDAvis"
       from favori f
       join emplacement e on e.id = f.emplacement_id
       join emplacement_visible v on v.reference = e.reference
       join membre m on m.id = v.bike_sitter_id
      where f.membre_id = $1 and ${VISIBLE_POUR}
      order by f.cree_le desc`,
    [membreId],
  );
  return lignes.map((ligne) => ({
    ...ligne,
    noteMoyenne:
      ligne.nombreDAvis >= AVIS_POUR_AFFICHER_UNE_NOTE
        ? ligne.noteMoyenne
        : null,
  }));
}
