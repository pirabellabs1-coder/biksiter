import { heureABruxelles, jourABruxelles } from '../temps';
import {
  A_CONVENIR,
  horairesDuJour,
  minutesDe,
  nombreDeJours,
  type Horaires,
} from './creneau';
import type { EtatDeGarde, Phase } from './garde';
import { maillonsPourUneGarde } from './maillons';
import type { TypeVelo } from './velos';

/**
 * Les aménagements d'une garde acceptée : prévenir d'un retard, demander à
 * garder le vélo plus longtemps. Aucun des deux ne change la garde sans
 * l'autre personne : un retard la prévient, une prolongation attend son
 * accord.
 */

const MINUTE = 60 * 1000;
const HEURE = 60 * MINUTE;
const JOUR = 24 * HEURE;

// --- Le retard -----------------------------------------------------------------

export const RETARDS_ANNONCABLES = [15, 30, 60] as const;
export type MinutesDeRetard = (typeof RETARDS_ANNONCABLES)[number];

export function estUnRetardAnnoncable(
  minutes: number,
): minutes is MinutesDeRetard {
  return (RETARDS_ANNONCABLES as readonly number[]).includes(minutes);
}

/**
 * On prévient d'un retard le jour même, pas la veille : trois heures avant le
 * moment convenu, et jusqu'à une heure après. Plus tôt, c'est un changement
 * d'horaire, qui se discute par message.
 */
export const ANNONCE_DE_RETARD_AVANT_HEURES = 3;
export const ANNONCE_DE_RETARD_APRES_MINUTES = 60;

export const LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT = 200;

/** Le moment dont on annonce le retard : le dépôt d'une garde acceptée, la reprise d'une garde en cours. */
export function phaseDuRetard(etat: EtatDeGarde): Phase | null {
  if (etat === 'accepte') return 'depot';
  if (etat === 'en_cours') return 'reprise';
  return null;
}

export function retardAnnoncable(
  etat: EtatDeGarde,
  horaires: { debut: Date; fin: Date },
  maintenant: Date,
): Phase | null {
  const phase = phaseDuRetard(etat);
  if (!phase) return null;
  const reference = (
    phase === 'depot' ? horaires.debut : horaires.fin
  ).getTime();
  const ouverture = reference - ANNONCE_DE_RETARD_AVANT_HEURES * HEURE;
  const fermeture = reference + ANNONCE_DE_RETARD_APRES_MINUTES * MINUTE;
  const t = maintenant.getTime();
  return t >= ouverture && t <= fermeture ? phase : null;
}

export function heureAnnoncee(reference: Date, minutes: MinutesDeRetard): Date {
  return new Date(reference.getTime() + minutes * MINUTE);
}

// --- La prolongation -----------------------------------------------------------

/** Une semaine de plus au plus : au-delà, c'est une nouvelle garde à demander. */
export const PROLONGATION_MAXIMALE_JOURS = 7;

export const ETATS_PROLONGEABLES: readonly EtatDeGarde[] = [
  'accepte',
  'arrivee',
  'en_cours',
];

export function prolongationPossible(
  etat: EtatDeGarde,
  fin: Date,
  maintenant: Date,
): boolean {
  return (
    ETATS_PROLONGEABLES.includes(etat) && maintenant.getTime() < fin.getTime()
  );
}

export type RefusDeProlongation =
  | 'pas_plus_tard'
  | 'trop_longue'
  | 'hors_horaires'
  | 'duree_du_lieu';

/**
 * La nouvelle fin se juge comme une reprise : plus tard que prévu, d'une
 * semaine au plus, à une heure où le lieu accueille, et dans la durée
 * maximale que le bike sitter a fixée.
 */
export function nouvelleFinRefusee(
  garde: { debut: Date; fin: Date },
  nouvelleFin: Date,
  lieu: { horaires: Horaires; dureeMaxJours: number },
): RefusDeProlongation | null {
  const ecart = nouvelleFin.getTime() - garde.fin.getTime();
  if (ecart <= 0) return 'pas_plus_tard';
  if (ecart > PROLONGATION_MAXIMALE_JOURS * JOUR) return 'trop_longue';

  const jour = jourABruxelles(nouvelleFin);
  const heure = minutesDe(heureABruxelles(nouvelleFin));
  const ouvert = horairesDuJour(lieu.horaires, jour);
  if (!ouvert || heure < minutesDe(ouvert.de) || heure > minutesDe(ouvert.a)) {
    return 'hors_horaires';
  }

  const jours = nombreDeJours({
    jourDepot: jourABruxelles(garde.debut),
    heureDepot: heureABruxelles(garde.debut),
    jourReprise: jour,
    heureReprise: heureABruxelles(nouvelleFin),
  });
  if (lieu.dureeMaxJours !== A_CONVENIR && jours > lieu.dureeMaxJours) {
    return 'duree_du_lieu';
  }
  return null;
}

export const TEXTE_DU_REFUS_DE_PROLONGATION: Readonly<
  Record<RefusDeProlongation, string>
> = {
  pas_plus_tard: 'Choisissez une fin plus tardive que celle prévue.',
  trop_longue:
    'Une prolongation va jusqu’à une semaine. Au-delà, envoyez une nouvelle demande de garde.',
  hors_horaires:
    'Cette heure tombe en dehors des disponibilités du lieu : choisissez une heure où le Bike Sitter accueille.',
  duree_du_lieu:
    'Cette prolongation dépasse la durée d’accueil que le Bike Sitter propose pour ce lieu.',
};

/** Ce que la prolongation ajoute aux points de la garde, une fois menée à terme. */
export function pointsEnPlus(
  garde: { debut: Date; fin: Date; typeVelo: TypeVelo },
  nouvelleFin: Date,
): number {
  return Math.max(
    0,
    maillonsPourUneGarde({ ...garde, fin: nouvelleFin }) -
      maillonsPourUneGarde(garde),
  );
}
