import { LIEU_PAR_DEFAUT, trouverUnLieu, type Lieu } from '@/lib/contenu/lieux';
import {
  ajouterJours,
  estUneHeure,
  estUnJour,
  heureDe,
  HORIZON_JOURS,
  minutesDe,
  ecartEnJours,
  type Creneau,
} from '@/lib/regles/creneau';
import {
  ecrireLesFiltres,
  lireLesFiltres,
  type Filtres,
} from '@/lib/regles/recherche';
import { TYPES_VELO } from '@/lib/regles/velos';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';

/**
 * La recherche en cours, portée par l'adresse de la page.
 *
 * Tout ce que le cycliste a choisi — le lieu, le créneau, les filtres — vit
 * dans l'URL : une recherche se partage, se recharge et revient telle quelle
 * avec le bouton retour, sans rien garder sur le serveur.
 */

export type RechercheCourante = {
  texte: string;
  lieu: Lieu | null;
  creneau: Creneau;
  filtres: Filtres;
  aujourdhui: string;
};

/** Les heures proposées, par quarts d'heure. */
export const HEURES: readonly string[] = Array.from({ length: 96 }, (_, rang) =>
  heureDe(rang * 15),
);

/**
 * Un créneau par défaut qui a du sens : la prochaine heure pleine, pour trois
 * heures. Trop tard dans la soirée, le lendemain matin.
 */
export function creneauParDefaut(maintenant: Date): Creneau {
  const aujourdhui = jourABruxelles(maintenant);
  const debut =
    Math.ceil((minutesDe(heureABruxelles(maintenant)) + 30) / 60) * 60;
  if (debut + 180 > 21 * 60) {
    const demain = ajouterJours(aujourdhui, 1);
    return {
      jourDepot: demain,
      heureDepot: '09:00',
      jourReprise: demain,
      heureReprise: '12:00',
    };
  }
  return {
    jourDepot: aujourdhui,
    heureDepot: heureDe(debut),
    jourReprise: aujourdhui,
    heureReprise: heureDe(debut + 180),
  };
}

export function lireLaRecherche(
  parametres: Readonly<Record<string, string | undefined>>,
  maintenant: Date = new Date(),
): RechercheCourante {
  const aujourdhui = jourABruxelles(maintenant);
  const defaut = creneauParDefaut(maintenant);
  const texte =
    (parametres.lieu ?? '').trim().slice(0, 120) || LIEU_PAR_DEFAUT.nom;

  const jourPermis = (jour: string | undefined) =>
    jour &&
    estUnJour(jour) &&
    ecartEnJours(aujourdhui, jour) >= 0 &&
    ecartEnJours(aujourdhui, jour) < HORIZON_JOURS + 14
      ? jour
      : null;

  const jourDepot = jourPermis(parametres.jour) ?? defaut.jourDepot;
  const jourReprise = jourPermis(parametres.jourFin) ?? jourDepot;

  return {
    texte,
    lieu: trouverUnLieu(texte),
    aujourdhui,
    creneau: {
      jourDepot,
      heureDepot:
        parametres.de && estUneHeure(parametres.de)
          ? parametres.de
          : defaut.heureDepot,
      jourReprise:
        ecartEnJours(jourDepot, jourReprise) < 0 ? jourDepot : jourReprise,
      heureReprise:
        parametres.a && estUneHeure(parametres.a)
          ? parametres.a
          : defaut.heureReprise,
    },
    filtres: lireLesFiltres(parametres, TYPES_VELO),
  };
}

/** Les paramètres d'adresse d'une recherche, pour construire un lien. */
export function parametresDeLaRecherche(
  recherche: Pick<RechercheCourante, 'texte' | 'creneau' | 'filtres'>,
  remplacements: Partial<Pick<RechercheCourante, 'creneau' | 'filtres'>> = {},
): URLSearchParams {
  const creneau = remplacements.creneau ?? recherche.creneau;
  const filtres = remplacements.filtres ?? recherche.filtres;
  const parametres = new URLSearchParams({
    lieu: recherche.texte,
    jour: creneau.jourDepot,
    de: creneau.heureDepot,
    jourFin: creneau.jourReprise,
    a: creneau.heureReprise,
    ...ecrireLesFiltres(filtres),
  });
  return parametres;
}
