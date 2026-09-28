import 'server-only';

/**
 * Les canaux d'envoi branchés sur ce serveur. Sans SMTP_URL, aucun courriel
 * ne part ; sans SMS_URL, aucun SMS : les écrans en tiennent compte pour ne
 * pas faire attendre un message qui ne partira pas.
 */
export function canauxConfigures(): { courriel: boolean; sms: boolean } {
  return {
    courriel: Boolean(process.env.SMTP_URL),
    sms: Boolean(process.env.SMS_URL),
  };
}
