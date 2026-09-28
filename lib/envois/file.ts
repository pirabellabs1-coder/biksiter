import 'server-only';

import type { PoolClient } from 'pg';

import { interroger } from '@/lib/bd/client';

import type { Message } from '@/lib/courriel/modeles';

import { planifierLExpedition } from './expedition';

/**
 * Dépose un courriel dans la file sortante.
 *
 * Quand un `client` est donné, l'écriture se fait dans la transaction en
 * cours : le message ne peut alors pas partir pour un stationnement qui
 * n'aurait finalement pas été enregistré, ni se perdre si le serveur de
 * messagerie était indisponible au moment du clic.
 *
 * Aucune requête web n'attend un serveur SMTP : le message part juste après
 * la réponse (lib/envois/expedition.ts), et reste dans la file s'il échoue.
 */
export async function mettreEnFile(
  destinataire: string,
  message: Message,
  options: { client?: PoolClient; aPropos?: string } = {},
): Promise<void> {
  const requete = `
    insert into message_sortant
      (canal, destinataire, sujet, corps, sujet_technique)
    values ('courriel', $1, $2, $3, $4)
  `;
  const valeurs = [
    destinataire,
    message.sujet,
    message.corps,
    options.aPropos ?? null,
  ];

  if (options.client) {
    await options.client.query(requete, valeurs);
  } else {
    await interroger(requete, valeurs);
  }
  planifierLExpedition();
}

/**
 * Dépose un SMS dans la même file.
 *
 * Le SMS ne sert qu'à la vérification d'un numéro : le coût par message en
 * Belgique interdit d'en faire un canal de rappel. Il n'a pas de sujet — le
 * champ existe pour le courriel — mais on y met de quoi retrouver l'envoi.
 */
export async function mettreUnSmsEnFile(
  numero: string,
  texte: string,
  options: { client?: PoolClient; aPropos?: string } = {},
): Promise<void> {
  const requete = `
    insert into message_sortant
      (canal, destinataire, sujet, corps, sujet_technique)
    values ('sms', $1, $2, $3, $4)
  `;
  const valeurs = [numero, 'Code de vérification', texte, options.aPropos ?? null];

  if (options.client) {
    await options.client.query(requete, valeurs);
  } else {
    await interroger(requete, valeurs);
  }
  planifierLExpedition();
}
