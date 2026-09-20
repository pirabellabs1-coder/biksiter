import {
  MARGE_ENTRE_STATIONNEMENTS_MINUTES,
  seChevauchent,
  type Creneau as Intervalle,
} from './capacite';
import {
  A_CONVENIR,
  dansLesHoraires,
  DUREE_MINIMALE_MINUTES,
  dureeDansLaJournee,
  DUREES_MAX_JOURS,
  ecartEnJours,
  HORIZON_JOURS,
  libelleDesHoraires,
  nombreDeJours,
  repriseApresDepot,
  type Creneau,
  type Horaires,
} from './creneau';

/**
 * Ce qui empêche d'envoyer une demande de garde.
 *
 * Chaque motif est une phrase complète, avec ses emplacements : elle se
 * traduit entière, puis reçoit ses valeurs.
 */

export type Motif = {
  texte: string;
  valeurs?: Readonly<Record<string, string | number>>;
};

export type EmplacementDemande = {
  bikeSitterId: string;
  prenomDuBikeSitter: string;
  horaires: Horaires;
  dureeMaxHeures: number;
  dureeMaxJours: number;
  velosAcceptes: readonly string[];
};

export type ContexteDeDemande = {
  maintenant: Date;
  /** Aujourd'hui, à Bruxelles. */
  aujourdhui: string;
  membre: { id: string; verifie: boolean; suspendu: boolean };
  emplacement: EmplacementDemande;
  /** Un blocage entre les deux membres, dans un sens ou dans l'autre. */
  bloque: boolean;
  /** Une demande de ce membre attend déjà une réponse pour cet emplacement. */
  demandeEnAttente: boolean;
  /** Le plafond de demandes envoyées sur un jour est atteint. */
  tropDeDemandes: boolean;
  velo: { type: string } | null;
  /** Une garde déjà confirmée pour ce vélo sur un créneau qui se chevauche. */
  veloDejaConfieChez: string | null;
  creneau: Creneau;
  debut: Date | null;
  placesRestantes: number;
  bikeSitterOccupeAilleurs: boolean;
};

export function motifsDeRefusDeLaDemande(c: ContexteDeDemande): Motif[] {
  const motifs: Motif[] = [];
  const e = c.emplacement;

  if (c.membre.suspendu) {
    motifs.push({
      texte:
        'Votre compte est suspendu : vous ne pouvez pas envoyer de demande.',
    });
  }
  if (!c.membre.verifie) {
    motifs.push({
      texte: "Vérifiez votre identité avant d'envoyer une demande.",
    });
  }
  if (e.bikeSitterId === c.membre.id) {
    motifs.push({ texte: "C'est votre propre emplacement." });
  }
  // Le même motif dans les deux sens : la personne bloquée n'a pas à
  // l'apprendre par un message d'erreur.
  if (c.bloque) {
    motifs.push({ texte: "Cet emplacement n'est pas disponible." });
  }
  if (c.demandeEnAttente) {
    motifs.push({
      texte:
        'Vous avez déjà une demande en attente pour cet emplacement : {prenom} vous répondra.',
      valeurs: { prenom: e.prenomDuBikeSitter },
    });
  }
  if (c.tropDeDemandes) {
    motifs.push({
      texte:
        'Vous avez envoyé beaucoup de demandes aujourd’hui. Vous pourrez en envoyer d’autres demain.',
    });
  }
  if (!c.velo) {
    motifs.push({ texte: 'Choisissez le vélo concerné.' });
  } else if (!e.velosAcceptes.includes(c.velo.type)) {
    motifs.push({
      texte: "{prenom} n'accueille pas ce type de vélo.",
      valeurs: { prenom: e.prenomDuBikeSitter },
    });
  }
  if (c.veloDejaConfieChez) {
    motifs.push({
      texte:
        "Ce vélo est déjà confié chez {prenom} sur ce créneau. Annulez cette garde avant d'en demander une autre.",
      valeurs: { prenom: c.veloDejaConfieChez },
    });
  }

  const avance = ecartEnJours(c.aujourdhui, c.creneau.jourDepot);
  if (avance >= HORIZON_JOURS) {
    motifs.push({
      texte: "Les demandes de garde s'ouvrent {jours} jours à l'avance.",
      valeurs: { jours: HORIZON_JOURS },
    });
  }
  if (avance < 0 || (c.debut && c.debut.getTime() < c.maintenant.getTime())) {
    motifs.push({
      texte: 'Ce créneau est déjà passé : choisissez une heure à venir.',
    });
  }

  if (!repriseApresDepot(c.creneau)) {
    motifs.push({
      texte:
        ecartEnJours(c.creneau.jourDepot, c.creneau.jourReprise) < 0
          ? 'La date de récupération doit suivre celle du dépôt.'
          : "La récupération doit suivre l'arrivée.",
    });
    return motifs;
  }

  const jours = nombreDeJours(c.creneau);
  if (jours === 1 && dureeDansLaJournee(c.creneau) < DUREE_MINIMALE_MINUTES) {
    motifs.push({
      texte:
        "Une garde dure au moins une heure : le temps de se retrouver, d'ouvrir et de faire les constats.",
    });
  }
  if (!dansLesHoraires(e.horaires, c.creneau)) {
    motifs.push({
      texte: 'Créneau hors des disponibilités du bike sitter : {horaires}.',
      valeurs: { horaires: libelleDesHoraires(e.horaires) },
    });
  }
  if (e.dureeMaxJours !== A_CONVENIR && jours > e.dureeMaxJours) {
    motifs.push({
      texte:
        '{prenom} accueille au maximum : {duree}. Votre demande porte sur {jours} jours.',
      valeurs: {
        prenom: e.prenomDuBikeSitter,
        duree: (DUREES_MAX_JOURS[e.dureeMaxJours] ?? '').toLowerCase(),
        jours,
      },
    });
  }
  if (jours === 1 && dureeDansLaJournee(c.creneau) > e.dureeMaxHeures * 60) {
    motifs.push({
      texte: "{prenom} accueille un vélo jusqu'à {heures} heures d'affilée.",
      valeurs: { prenom: e.prenomDuBikeSitter, heures: e.dureeMaxHeures },
    });
  }

  if (c.bikeSitterOccupeAilleurs) {
    motifs.push({
      texte:
        "Un vélo est déjà accueilli à un autre emplacement tenu par la même personne sur ce créneau. Elle doit être présente, et ne peut pas l'être à deux endroits à la fois.",
    });
  } else if (c.placesRestantes <= 0) {
    motifs.push({
      texte:
        'Plus de place sur ce créneau. Une place déjà réservée reste indisponible {marge} minutes avant et après, pour que personne ne se croise devant la porte.',
      valeurs: { marge: MARGE_ENTRE_STATIONNEMENTS_MINUTES },
    });
  }

  return motifs;
}

/** Les places qui restent sur un créneau, compte tenu des gardes déjà retenues. */
export function placesRestantes(
  capacite: number,
  gardesRetenues: readonly Intervalle[],
  demande: Intervalle,
): number {
  const simultanees = gardesRetenues.filter((garde) =>
    seChevauchent(garde, demande),
  ).length;
  return capacite - simultanees;
}

/** Vrai si l'une des gardes retenues ailleurs chevauche la demande. */
export function occupeAilleurs(
  gardesAilleurs: readonly Intervalle[],
  demande: Intervalle,
): boolean {
  return gardesAilleurs.some((garde) => seChevauchent(garde, demande));
}

/**
 * La première heure de la journée où la même durée tiendrait encore, par pas
 * de trente minutes — la granularité de la marge. `null` si rien ne tient.
 */
export function prochaineHeureLibre(
  debutDuCreneau: number,
  duree: number,
  finDeJournee: number,
  estLibreA: (debutEnMinutes: number) => boolean,
): number | null {
  for (
    let debut = debutDuCreneau + 30;
    debut + duree <= finDeJournee;
    debut += 30
  ) {
    if (estLibreA(debut)) return debut;
  }
  return null;
}
