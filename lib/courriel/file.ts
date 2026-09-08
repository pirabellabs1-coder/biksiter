import 'server-only';

import type { PoolClient } from 'pg';

import { interroger } from '@/lib/bd/client';

import type { Message } from './modeles';

/**
 * Dépose un message dans la file sortante.
 *
 * Quand un `client` est donné, l'écriture se fait dans la transaction en
 * cours : le message ne peut alors pas partir pour un stationnement qui
 * n'aurait finalement pas été enregistré, ni se perdre si le serveur de
 * messagerie était indisponible au moment du clic.
 *
 * Aucune requête web n'attend un serveur SMTP : c'est un script qui draine
 * cette table.
 */
export async function mettreEnFile(
  destinataire: string,
  message: Message,
  options: { client?: PoolClient; aPropos?: string } = {},
): Promise<void> {
  const requete = `
    insert into courriel (destinataire, sujet, corps, sujet_technique)
    values ($1, $2, $3, $4)
  `;
  const valeurs = [
    destinataire,
    message.sujet,
    message.corps,
    options.aPropos ?? null,
  ];

  if (options.client) {
    await options.client.query(requete, valeurs);
    return;
  }

  await interroger(requete, valeurs);
}

export type CourrielEnAttente = {
  id: string;
  destinataire: string;
  sujet: string;
  corps: string;
  tentatives: number;
};

export async function courrielsEnAttente(
  combien: number,
): Promise<CourrielEnAttente[]> {
  return interroger<CourrielEnAttente>(
    `select id, destinataire, sujet, corps, tentatives
       from courriel
      where envoye_le is null
      order by cree_le
      limit $1`,
    [combien],
  );
}

export async function marquerEnvoye(id: string): Promise<void> {
  await interroger('update courriel set envoye_le = now() where id = $1', [id]);
}

export async function marquerEchec(id: string, erreur: string): Promise<void> {
  await interroger(
    `update courriel
        set tentatives = tentatives + 1,
            derniere_erreur = $2
      where id = $1`,
    [id, erreur.slice(0, 500)],
  );
}
