import 'server-only';

import { dansUneTransaction, interroger } from '@/lib/bd/client';
import {
  LONGUEUR_DU_BON,
  decisionDEchange,
  type RefusDEchange,
} from '@/lib/regles/catalogue';
import { soldeDisponible } from '@/lib/regles/maillons';

/**
 * Le catalogue des remerciements.
 *
 * `offresDuCatalogue` ne prend pas de membre en paramètre : tout le monde voit
 * exactement le même catalogue, qu'on ait accueilli ou non. Ce qui change,
 * c'est ce qu'on peut en faire — et cela se dit une fois en haut de la page,
 * pas offre par offre.
 */

export type OffreDuCatalogue = {
  id: string;
  titre: string;
  partenaire: string;
  quartier: string | null;
  coutEnMaillons: number;
  stockRestant: number;
  active: boolean;
};

export async function offresDuCatalogue(): Promise<OffreDuCatalogue[]> {
  return interroger<OffreDuCatalogue>(
    `select o.id,
            o.titre,
            p.nom              as partenaire,
            p.quartier,
            o.cout_en_maillons as "coutEnMaillons",
            o.stock_restant    as "stockRestant",
            o.active
       from offre o
       join partenaire p on p.id = o.partenaire_id
      where p.actif
      order by o.cout_en_maillons, o.titre`,
  );
}

export type Bon = {
  id: string;
  code: string;
  titre: string;
  partenaire: string;
  coutEnMaillons: number;
  echangeLe: Date;
  utiliseLe: Date | null;
};

export async function mesBons(membreId: string): Promise<Bon[]> {
  return interroger<Bon>(
    `select e.id, e.code, o.titre, p.nom as partenaire,
            e.cout_en_maillons as "coutEnMaillons",
            e.echange_le       as "echangeLe",
            e.utilise_le       as "utiliseLe"
       from echange e
       join offre o on o.id = e.offre_id
       join partenaire p on p.id = o.partenaire_id
      where e.membre_id = $1
      order by e.echange_le desc`,
    [membreId],
  );
}

export type ResultatDEchange =
  | { echange: true; code: string }
  | { echange: false; motif: RefusDEchange | 'introuvable' };

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Sans I, O, 0 ni 1 : le bon se lit à voix haute au comptoir d'un commerçant,
 * et on ne veut pas arbitrer entre un « O » et un zéro.
 */
function nouveauBon(): string {
  const octets = new Uint8Array(LONGUEUR_DU_BON);
  crypto.getRandomValues(octets);
  return Array.from(octets, (octet) => ALPHABET[octet % ALPHABET.length]).join('');
}

/**
 * Échanger, en une seule transaction.
 *
 * Le stock est décrémenté sous verrou et la contrainte `stock_restant >= 0`
 * fait le reste : deux membres qui prennent le dernier exemplaire à la même
 * seconde ne peuvent pas passer tous les deux.
 */
export async function echangerUneOffre(
  membreId: string,
  offreId: string,
): Promise<ResultatDEchange> {
  return dansUneTransaction(async (client) => {
    const trouvee = await client.query<{
      coutEnMaillons: number;
      stockRestant: number;
      active: boolean;
    }>(
      `select o.cout_en_maillons as "coutEnMaillons",
              o.stock_restant    as "stockRestant",
              (o.active and p.actif) as active
         from offre o join partenaire p on p.id = o.partenaire_id
        where o.id = $1
        for update of o`,
      [offreId],
    );

    if (trouvee.rowCount === 0) {
      return { echange: false, motif: 'introuvable' };
    }

    const solde = await client.query<{ acquis: number; enAttente: number }>(
      `select coalesce(sum(nombre) filter (where etat = 'acquis'), 0)::int     as acquis,
              coalesce(sum(nombre) filter (where etat = 'en_attente'), 0)::int as "enAttente"
         from maillon where membre_id = $1`,
      [membreId],
    );

    const accueillies = await client.query<{ combien: number }>(
      `select count(*)::int as combien
         from stationnement s join emplacement e on e.id = s.emplacement_id
        where e.membre_id = $1 and s.etat = 'termine'`,
      [membreId],
    );

    const decision = decisionDEchange(
      trouvee.rows[0],
      solde.rows[0],
      accueillies.rows[0].combien,
    );

    if (!decision.possible) {
      return { echange: false, motif: decision.motif };
    }

    const cout = trouvee.rows[0].coutEnMaillons;
    const code = nouveauBon();

    await client.query(
      'update offre set stock_restant = stock_restant - 1 where id = $1',
      [offreId],
    );

    await client.query(
      `insert into echange (membre_id, offre_id, code, cout_en_maillons)
       values ($1, $2, $3, $4)`,
      [membreId, offreId, code, cout],
    );

    // La dépense est une ligne du registre comme une autre, en négatif : le
    // solde reste la somme de son historique.
    await client.query(
      `insert into maillon (membre_id, nombre, etat, motif)
       values ($1, $2, 'acquis', 'échange au catalogue')`,
      [membreId, -cout],
    );

    return { echange: true, code };
  });
}

export async function soldeDepensable(membreId: string): Promise<number> {
  const lignes = await interroger<{ acquis: number; enAttente: number }>(
    `select coalesce(sum(nombre) filter (where etat = 'acquis'), 0)::int     as acquis,
            coalesce(sum(nombre) filter (where etat = 'en_attente'), 0)::int as "enAttente"
       from maillon where membre_id = $1`,
    [membreId],
  );
  return soldeDisponible(lignes[0] ?? { acquis: 0, enAttente: 0 });
}
