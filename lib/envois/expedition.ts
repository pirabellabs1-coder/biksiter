import 'server-only';

import { after } from 'next/server';
import nodemailer, { type Transporter } from 'nodemailer';
import { cache } from 'react';

import { interroger } from '@/lib/bd/client';
import { adresseSansBoiteReelle } from '@/lib/regles/envois';

import { canauxConfigures } from './canaux';

/**
 * L'expédition de la file sortante : courriels et SMS.
 *
 * Un message est d'abord écrit dans `message_sortant` (lib/envois/file.ts),
 * dans la même transaction que ce qui le motive. Il part ensuite d'ici, juste
 * après la réponse faite au membre : personne n'attend un serveur de
 * messagerie pour voir sa page, et un envoi raté reste dans la file pour la
 * tentative suivante (la route quotidienne /api/envois, ou le prochain
 * message).
 *
 * Sans SMTP_URL (ou sans SMS_URL), rien ne part sur ce canal : les messages
 * attendent dans la file, et `npm run bd:messages` les montre sans les
 * envoyer.
 */

/** Au-delà, l'adresse ou le numéro est probablement faux : on n'insiste plus. */
const TENTATIVES_MAXIMALES = 5;

/** De quoi vider la file d'un coup en temps normal, sans monopoliser la base. */
const PAR_PASSE = 20;

type EnAttente = {
  id: string;
  canal: 'courriel' | 'sms';
  destinataire: string;
  sujet: string;
  corps: string;
};

export type BilanDExpedition = {
  envoyes: number;
  echoues: number;
  ecartes: number;
};

let facteur: Transporter | null = null;

function leFacteur(): Transporter | null {
  const smtp = process.env.SMTP_URL;
  if (!smtp) return null;
  // Un seul transport par instance. Les délais bornent l'attente d'un
  // serveur qui ne répond pas ; si la plateforme coupe malgré tout la
  // fonction, la réservation se reprend au bout de dix minutes.
  facteur ??= nodemailer.createTransport({
    url: smtp,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return facteur;
}

/**
 * La passerelle SMS est une API HTTP générique : la plupart des opérateurs
 * belges en proposent une, et en changer ne touche que cette fonction.
 */
async function envoyerUnSms(
  destinataire: string,
  texte: string,
): Promise<void> {
  const passerelle = process.env.SMS_URL;
  if (!passerelle) throw new Error('SMS_URL n’est pas défini.');
  const reponse = await fetch(passerelle, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SMS_JETON
        ? { Authorization: `Bearer ${process.env.SMS_JETON}` }
        : {}),
    },
    body: JSON.stringify({ destinataire, texte }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!reponse.ok) {
    throw new Error(`La passerelle SMS a répondu ${reponse.status}.`);
  }
}

/**
 * Envoie ce qui attend dans la file, sur les canaux configurés.
 *
 * Les messages sont d'abord réservés, en une seule requête (`for update skip
 * locked`) : deux expéditions lancées en même temps (deux membres qui
 * s'inscrivent à la même seconde) ne prennent jamais le même message. L'envoi
 * se fait ensuite hors de toute transaction : un serveur de messagerie lent ne
 * retient aucun verrou. Une réservation abandonnée se reprend au bout de dix
 * minutes.
 *
 * Seuls les messages de moins de 30 heures partent : brancher un canal ne
 * doit pas expédier d'un coup tout ce qui attendait, et un envoi raté se
 * retente encore au passage quotidien suivant (qui a lieu à l'heure près).
 */
export async function expedierLaFile(
  combien: number = PAR_PASSE,
): Promise<BilanDExpedition> {
  const { courriel, sms } = canauxConfigures();
  const canaux = [...(courriel ? ['courriel'] : []), ...(sms ? ['sms'] : [])];
  if (canaux.length === 0) return { envoyes: 0, echoues: 0, ecartes: 0 };

  const reserves = await interroger<EnAttente>(
    `update message_sortant
        set reserve_le = now()
      where id in (
            select id
              from message_sortant
             where envoye_le is null
               and tentatives < $1
               and canal = any($2::text[])
               and cree_le > now() - interval '30 hours'
               and (reserve_le is null or reserve_le < now() - interval '10 minutes')
             order by cree_le
             limit $3
             for update skip locked)
      returning id, canal, destinataire, sujet, corps`,
    [TENTATIVES_MAXIMALES, canaux, combien],
  );

  const expediteur =
    process.env.COURRIEL_EXPEDITEUR ?? 'Bike Sitters <bonjour@bikesitters.be>';
  let envoyes = 0;
  let echoues = 0;
  let ecartes = 0;

  for (const message of reserves) {
    if (
      message.canal === 'courriel' &&
      adresseSansBoiteReelle(message.destinataire)
    ) {
      // Épuiser les tentatives sort le message de la file pour de bon.
      await interroger(
        `update message_sortant
            set tentatives = $2, reserve_le = null,
                derniere_erreur = 'Adresse de démonstration ou d’essai : non expédié.'
          where id = $1`,
        [message.id, TENTATIVES_MAXIMALES],
      );
      ecartes += 1;
      continue;
    }
    try {
      if (message.canal === 'courriel') {
        const transport = leFacteur();
        if (!transport) throw new Error('SMTP_URL n’est pas défini.');
        await transport.sendMail({
          from: expediteur,
          to: message.destinataire,
          subject: message.sujet,
          // Texte brut uniquement : voir lib/courriel/modeles.ts.
          text: message.corps,
        });
      } else {
        await envoyerUnSms(message.destinataire, message.corps);
      }
    } catch (erreur) {
      const motif = erreur instanceof Error ? erreur.message : String(erreur);
      // Si la base refuse aussi ce marquage, la réservation reste en place et
      // le message se retente dans dix minutes : la boucle continue.
      await interroger(
        `update message_sortant
            set tentatives = tentatives + 1, derniere_erreur = $2, reserve_le = null
          where id = $1`,
        [message.id, motif.slice(0, 500)],
      ).catch(() => undefined);
      echoues += 1;
      continue;
    }
    // Le message est parti : un marquage raté ne doit pas le compter comme
    // un échec ni lever la réservation, qui le renverrait tout de suite.
    await interroger(
      'update message_sortant set envoye_le = now(), reserve_le = null where id = $1',
      [message.id],
    ).catch(() => undefined);
    envoyes += 1;
  }
  return { envoyes, echoues, ecartes };
}

/**
 * Une seule expédition par requête : une action qui met trois messages en
 * file les envoie en un passage, après la réponse.
 */
const expeditionDeLaRequete = cache(() => ({ planifiee: false }));

/**
 * Demande une expédition juste après la réponse en cours.
 *
 * Hors d'une requête (un script), `after` n'est pas disponible : la file
 * attend alors le prochain passage, ce qui est le comportement voulu.
 */
export function planifierLExpedition(): void {
  const { courriel, sms } = canauxConfigures();
  if (!courriel && !sms) return;
  const expedition = expeditionDeLaRequete();
  if (expedition.planifiee) return;
  expedition.planifiee = true;
  try {
    after(async () => {
      try {
        await expedierLaFile();
      } catch {
        // La file garde le message : le passage suivant le reprendra.
      }
    });
  } catch {
    // Appel hors d'une requête : rien à planifier.
  }
}
