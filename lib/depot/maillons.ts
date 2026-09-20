import 'server-only';

import type { PoolClient } from 'pg';

import { VIOLATION_UNICITE, codeDErreurPostgres, interroger, uneLigne } from '@/lib/bd/client';
import { etatApresLaGarde, maillonsPourUneGarde } from '@/lib/regles/maillons';
import type { TypeVelo } from '@/lib/regles/velos';

/**
 * Le registre des maillons — les points de l'interface.
 *
 * On lit ici le registre d'une seule personne, la sienne. Le classement, qui
 * compare des membres, vit à part dans `progression.ts` et ne lit que ceux qui
 * ont choisi d'y apparaître (règle 3).
 */

export type SoldeDuMembre = {
  acquis: number;
  enAttente: number;
};

export async function soldeDuMembre(membreId: string): Promise<SoldeDuMembre> {
  const ligne = await uneLigne<SoldeDuMembre>(
    `select coalesce(sum(nombre) filter (where etat = 'acquis'), 0)::int      as acquis,
            coalesce(sum(nombre) filter (where etat = 'en_attente'), 0)::int  as "enAttente"
       from maillon where membre_id = $1`,
    [membreId],
  );
  return ligne ?? { acquis: 0, enAttente: 0 };
}

export type LigneDeRegistre = {
  id: string;
  nombre: number;
  etat: 'acquis' | 'en_attente' | 'annule';
  motif: string | null;
  creeLe: Date;
  typeVelo: TypeVelo | null;
  debut: Date | null;
  fin: Date | null;
};

export async function registre(
  membreId: string,
  combien = 10,
): Promise<LigneDeRegistre[]> {
  return interroger<LigneDeRegistre>(
    `select m.id, m.nombre, m.etat, m.motif,
            m.cree_le    as "creeLe",
            s.type_velo  as "typeVelo",
            s.debut, s.fin
       from maillon m
       left join stationnement s on s.id = m.stationnement_id
      where m.membre_id = $1
      order by m.cree_le desc
      limit $2`,
    [membreId, combien],
  );
}

/**
 * Remercier une garde, à la reprise du vélo.
 *
 * Appelé dans la transaction qui fait passer le stationnement à « terminé ».
 * L'index unique en base garantit qu'une garde ne se remercie qu'une fois,
 * quel que soit le chemin d'écriture — une double validation du code de
 * reprise ne double pas les maillons.
 */
export async function crediterLaGarde(
  client: PoolClient,
  stationnementId: string,
): Promise<number> {
  const trouve = await client.query<{
    bikeSitterId: string;
    debut: Date;
    fin: Date;
    typeVelo: TypeVelo;
    etat: string;
    conteste: boolean;
  }>(
    `select e.membre_id as "bikeSitterId",
            s.debut, s.fin, s.type_velo as "typeVelo", s.etat, s.conteste
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
      where s.id = $1`,
    [stationnementId],
  );

  if (trouve.rowCount === 0) {
    return 0;
  }

  const garde = trouve.rows[0];
  const etat = etatApresLaGarde(garde);
  if (etat === null || etat === 'annule') {
    return 0;
  }

  const nombre = maillonsPourUneGarde({
    debut: new Date(garde.debut),
    fin: new Date(garde.fin),
    typeVelo: garde.typeVelo,
  });

  if (nombre <= 0) {
    return 0;
  }

  try {
    await client.query(
      `insert into maillon (membre_id, stationnement_id, nombre, etat, motif)
       values ($1, $2, $3, $4, 'garde menée à bien')`,
      [garde.bikeSitterId, stationnementId, nombre, etat],
    );
  } catch (erreur) {
    // Déjà crédité : ce n'est pas une erreur, c'est la garantie qui joue.
    if (codeDErreurPostgres(erreur) === VIOLATION_UNICITE) {
      return 0;
    }
    throw erreur;
  }

  return nombre;
}

export type ComptesDuMembre = {
  accueillies: number;
  confiees: number;
};

/**
 * Les deux façons de faire vivre le réseau, comptées séparément.
 *
 * Ce sont des compteurs, pas des rangs : rien ici ne se compare à ceux de
 * quelqu'un d'autre, et aucune requête du produit ne les ordonne.
 */
export async function comptesDuMembre(
  membreId: string,
): Promise<ComptesDuMembre> {
  const ligne = await uneLigne<ComptesDuMembre>(
    `select (select count(*) from stationnement s
               join emplacement e on e.id = s.emplacement_id
              where e.membre_id = $1 and s.etat = 'termine')::int as accueillies,
            (select count(*) from stationnement
              where cycliste_id = $1 and etat = 'termine')::int   as confiees`,
    [membreId],
  );
  return ligne ?? { accueillies: 0, confiees: 0 };
}
