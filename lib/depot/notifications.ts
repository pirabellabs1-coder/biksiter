import 'server-only';

import type { PoolClient } from 'pg';

import { interroger, uneLigne } from '@/lib/bd/client';
import {
  minutesDAttente,
  TRANQUILLITE_PAR_DEFAUT,
} from '@/lib/regles/notifications';
import { heureABruxelles } from '@/lib/temps';

/**
 * Les notifications dans l'application.
 *
 * Le texte est la phrase française, avec ses emplacements ; les valeurs vont à
 * part. C'est l'écran qui traduit, dans la langue de celui qui lit.
 */

export type Notification = {
  id: string;
  texte: string;
  valeurs: Record<string, string | number>;
  lien: string | null;
  visibleLe: Date;
  differee: boolean;
  lue: boolean;
};

export async function notifier(
  client: PoolClient,
  membreId: string,
  notification: {
    texte: string;
    valeurs?: Record<string, string | number>;
    lien?: string;
    urgente?: boolean;
  },
): Promise<void> {
  const { rows } = await client.query<{ de: string | null; a: string | null }>(
    `select to_char(tranquillite_de, 'HH24:MI') as de,
            to_char(tranquillite_a, 'HH24:MI') as a
       from membre where id = $1`,
    [membreId],
  );
  const membre = rows[0];
  if (!membre) return;

  const plage = membre.de && membre.a ? { de: membre.de, a: membre.a } : null;
  const attente = minutesDAttente(
    heureABruxelles(),
    plage,
    notification.urgente ?? false,
  );

  await client.query(
    `insert into notification (membre_id, texte, valeurs, lien, urgente, visible_le)
     values ($1, $2, $3, $4, $5, now() + ($6 || ' minutes')::interval)`,
    [
      membreId,
      notification.texte,
      JSON.stringify(notification.valeurs ?? {}),
      notification.lien ?? null,
      notification.urgente ?? false,
      String(attente),
    ],
  );
}

export async function notificationsDuMembre(
  membreId: string,
): Promise<Notification[]> {
  return interroger<Notification>(
    `select id, texte, valeurs, lien,
            visible_le as "visibleLe",
            visible_le > creee_le + interval '1 minute' as differee,
            lue_le is not null as lue
       from notification
      where membre_id = $1 and visible_le <= now()
      order by visible_le desc
      limit 100`,
    [membreId],
  );
}

export async function nombreDeNotificationsNonLues(
  membreId: string,
): Promise<number> {
  const ligne = await uneLigne<{ combien: number }>(
    `select count(*)::int as combien from notification
      where membre_id = $1 and lue_le is null and visible_le <= now()`,
    [membreId],
  );
  return ligne?.combien ?? 0;
}

/** Marque une notification lue et rend son lien, s'il y en a un. */
export async function ouvrirUneNotification(
  membreId: string,
  id: string,
): Promise<string | null> {
  const ligne = await uneLigne<{ lien: string | null }>(
    `update notification set lue_le = coalesce(lue_le, now())
      where id = $1 and membre_id = $2
      returning lien`,
    [id, membreId],
  );
  return ligne?.lien ?? null;
}

export async function toutMarquerCommeLu(membreId: string): Promise<void> {
  await interroger(
    `update notification set lue_le = now()
      where membre_id = $1 and lue_le is null and visible_le <= now()`,
    [membreId],
  );
}

export type PreferencesDeTranquillite = { de: string; a: string } | null;

export async function tranquilliteDuMembre(
  membreId: string,
): Promise<PreferencesDeTranquillite> {
  const ligne = await uneLigne<{ de: string | null; a: string | null }>(
    `select to_char(tranquillite_de, 'HH24:MI') as de,
            to_char(tranquillite_a, 'HH24:MI') as a
       from membre where id = $1`,
    [membreId],
  );
  return ligne?.de && ligne.a ? { de: ligne.de, a: ligne.a } : null;
}

export async function reglerLaTranquillite(
  membreId: string,
  plage: PreferencesDeTranquillite,
): Promise<void> {
  await interroger(
    `update membre set tranquillite_de = $2, tranquillite_a = $3 where id = $1`,
    [membreId, plage?.de ?? null, plage?.a ?? null],
  );
}

export { TRANQUILLITE_PAR_DEFAUT };
