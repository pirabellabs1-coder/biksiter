import { createHash, timingSafeEqual } from 'node:crypto';

import { expedierLaFile } from '@/lib/envois/expedition';

export const dynamic = 'force-dynamic';
// Une minute suffit à un passage ; une fonction coupée laisse ses
// réservations se reprendre au bout de dix minutes.
export const maxDuration = 60;

/**
 * Le passage de secours de la file sortante, appelé chaque jour par la tâche
 * planifiée de Vercel (vercel.json). En temps normal, chaque message part
 * juste après la requête qui l'a créé ; ce passage reprend ceux qui ont
 * échoué (serveur de messagerie indisponible, par exemple).
 *
 * Vercel envoie `Authorization: Bearer <CRON_SECRET>` : sans ce secret, la
 * route ne répond pas, pour que personne ne puisse la déclencher à la chaîne.
 */
export async function GET(requete: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const empreinte = (texte: string) => createHash('sha256').update(texte).digest();
  const recu = empreinte(requete.headers.get('authorization') ?? '');
  const attendu = empreinte(`Bearer ${secret ?? ''}`);
  // Des empreintes de même taille : la comparaison ne dit rien de la longueur
  // du secret.
  if (!secret || !timingSafeEqual(recu, attendu)) {
    return new Response('Introuvable', { status: 404 });
  }
  const bilan = await expedierLaFile(50);
  return Response.json(bilan);
}
