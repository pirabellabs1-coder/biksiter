import { minutesDe } from './creneau';

/**
 * Les heures de tranquillité.
 *
 * Personne ne veut être réveillé à deux heures du matin pour une demande de
 * garde. La notification n'est pas perdue : elle attend la fin de la nuit.
 * L'urgence passe quand même — un désistement de dernière minute, un litige
 * ouvert ne peuvent pas attendre sept heures du matin.
 */

export const TRANQUILLITE_PAR_DEFAUT = { de: '22:00', a: '07:00' } as const;

/** Vrai si l'heure tombe dans la plage, y compris à cheval sur minuit. */
export function dansLaPlage(heure: string, de: string, a: string): boolean {
  const t = minutesDe(heure);
  const debut = minutesDe(de);
  const fin = minutesDe(a);
  return debut > fin ? t >= debut || t < fin : t >= debut && t < fin;
}

/**
 * Combien de minutes attendre avant d'afficher une notification reçue à
 * `heure`, à Bruxelles. Zéro si elle s'affiche tout de suite.
 */
export function minutesDAttente(
  heure: string,
  plage: { de: string; a: string } | null,
  urgente: boolean,
): number {
  if (urgente || !plage || !dansLaPlage(heure, plage.de, plage.a)) return 0;
  const t = minutesDe(heure);
  const fin = minutesDe(plage.a);
  return fin > t ? fin - t : fin + 24 * 60 - t;
}

/**
 * « Vu il y a 2 h » : jamais un horodatage précis, qui en dirait trop sur les
 * habitudes de quelqu'un.
 */
export function presence(
  vuLe: Date | null,
  maintenant: Date,
): {
  enLigne: boolean;
  texte: string;
  valeurs?: Record<string, number>;
} | null {
  if (!vuLe) return null;
  const minutes = Math.max(0, (maintenant.getTime() - vuLe.getTime()) / 60000);
  if (minutes < 15) return { enLigne: true, texte: 'En ligne' };
  if (minutes < 60)
    return { enLigne: false, texte: "Vu il y a moins d'une heure" };
  if (minutes < 1440) {
    return {
      enLigne: false,
      texte: 'Vu il y a {n} h',
      valeurs: { n: Math.round(minutes / 60) },
    };
  }
  return {
    enLigne: false,
    texte: 'Vu il y a {n} j',
    valeurs: { n: Math.round(minutes / 1440) },
  };
}
