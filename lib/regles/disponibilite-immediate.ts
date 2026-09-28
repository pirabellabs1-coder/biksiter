import { heureABruxelles, jourABruxelles } from '../temps';
import {
  DERNIER_DEPOT_MINUTES,
  heureDe,
  horairesDuJour,
  minutesDe,
  PREMIER_DEPOT_MINUTES,
  type Horaires,
} from './creneau';

/**
 * La disponibilité immédiate d'un bike sitter.
 *
 * Un bike sitter qui est chez lui et peut ouvrir tout de suite le signale :
 * pendant une heure, il passe en tête des résultats pour les gardes qui
 * commencent dans cette heure-là. Elle s'éteint seule — personne ne doit
 * rester affiché « disponible » après être sorti de chez lui.
 */

export const DUREE_DE_LA_DISPONIBILITE_IMMEDIATE_MINUTES = 60;

/** L'instant où une disponibilité ouverte maintenant s'éteindra. */
export function finDeLaDisponibiliteImmediate(maintenant: Date): Date {
  return new Date(
    maintenant.getTime() + DUREE_DE_LA_DISPONIBILITE_IMMEDIATE_MINUTES * 60_000,
  );
}

/** La disponibilité est-elle encore ouverte ? */
export function disponibiliteImmediateOuverte(
  jusquA: Date | null,
  maintenant: Date,
): boolean {
  return jusquA !== null && jusquA.getTime() > maintenant.getTime();
}

/**
 * Le bike sitter passe-t-il en tête pour ce créneau ? Seulement si sa
 * disponibilité est ouverte et que la garde commence avant qu'elle s'éteigne :
 * être libre maintenant ne dit rien d'une garde prévue demain.
 */
export function passeEnTeteDesResultats(
  jusquA: Date | null,
  debutDuCreneau: Date,
  maintenant: Date,
): boolean {
  return (
    disponibiliteImmediateOuverte(jusquA, maintenant) &&
    debutDuCreneau.getTime() <= (jusquA as Date).getTime()
  );
}

export type OuvertureImmediate =
  | { possible: true }
  /** `des` : l'heure où elle le deviendra aujourd'hui, s'il en reste une. */
  | { possible: false; des: string | null };

/**
 * Peut-on se dire disponible maintenant ? Seulement pendant les horaires
 * d'accueil d'un de ses emplacements, et à une heure où un dépôt est
 * possible : à deux heures du matin, passer en tête ne servirait à personne.
 */
export function ouvertureImmediate(
  horaires: readonly Horaires[],
  maintenant: Date,
): OuvertureImmediate {
  const jour = jourABruxelles(maintenant);
  const minutes = minutesDe(heureABruxelles(maintenant));
  const ouvertures = horaires
    .map((h) => horairesDuJour(h, jour))
    .filter((h) => h !== null)
    .map((h) => ({
      de: Math.max(minutesDe(h.de), PREMIER_DEPOT_MINUTES),
      a: Math.min(minutesDe(h.a), DERNIER_DEPOT_MINUTES),
    }))
    .filter((h) => h.de < h.a);

  if (ouvertures.some((h) => minutes >= h.de && minutes < h.a)) {
    return { possible: true };
  }
  const plusTot = ouvertures
    .map((h) => h.de)
    .filter((de) => de > minutes)
    .sort((x, y) => x - y)[0];
  return { possible: false, des: plusTot === undefined ? null : heureDe(plusTot) };
}
