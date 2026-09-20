import { DISTANCES } from './distance';
import { TYPES_EMPLACEMENT_PRIVE } from './emplacements';

/**
 * Les filtres d'une recherche.
 *
 * La distance, le vélo à confier, le type d'espace, la note, puis la sécurité
 * et l'accès. Les résultats restent rangés du plus proche au plus éloigné : la
 * note filtre, elle ne classe pas (règle 3).
 */

export type Filtres = {
  distanceMax: number | null;
  typeVelo: string | null;
  typeDEmplacement: string | null;
  noteMin: number | null;
  interieur: boolean;
  ancrage: boolean;
  vae: boolean;
  accessible: boolean;
};

export const SANS_FILTRE: Filtres = {
  distanceMax: null,
  typeVelo: null,
  typeDEmplacement: null,
  noteMin: null,
  interieur: false,
  ancrage: false,
  vae: false,
  accessible: false,
};

/** Les notes minimales proposées ; une note ne s'affiche qu'à partir de trois avis. */
export const NOTES_MINIMALES = [4, 4.5] as const;

/** Un accès sans marche : ce que « accessible » promet. */
export const ACCES_SANS_MARCHE = ['Plain-pied', 'Rampe', 'Ascenseur'] as const;

/** Ce qu'une recherche sait d'un emplacement, pour le filtrer. */
export type CaracteristiquesFiltrables = {
  distance: number;
  velosAcceptes: readonly string[];
  intemperie: string;
  ancrage: string | null;
  type?: string;
  /** Absente tant que l'emplacement n'a pas trois avis publiés. */
  noteMoyenne?: number | null;
  acces?: string;
};

export function correspond(
  emplacement: CaracteristiquesFiltrables,
  filtres: Filtres,
): boolean {
  if (
    filtres.distanceMax !== null &&
    emplacement.distance > filtres.distanceMax
  ) {
    return false;
  }
  if (
    filtres.typeVelo &&
    !emplacement.velosAcceptes.includes(filtres.typeVelo)
  ) {
    return false;
  }
  if (
    filtres.typeDEmplacement &&
    emplacement.type !== filtres.typeDEmplacement
  ) {
    return false;
  }
  if (
    filtres.noteMin !== null &&
    (emplacement.noteMoyenne == null ||
      emplacement.noteMoyenne < filtres.noteMin)
  ) {
    return false;
  }
  if (filtres.interieur && emplacement.intemperie !== 'interieur') return false;
  if (filtres.ancrage && !emplacement.ancrage) return false;
  if (filtres.vae && !emplacement.velosAcceptes.includes('Électrique')) {
    return false;
  }
  if (
    filtres.accessible &&
    !(ACCES_SANS_MARCHE as readonly string[]).includes(emplacement.acces ?? '')
  ) {
    return false;
  }
  return true;
}

export type CleDeFiltre = keyof Filtres;

/** Les filtres avec une valeur basculée : cliquer deux fois retire le choix. */
export function basculer(
  filtres: Filtres,
  cle: CleDeFiltre,
  valeur?: string | number,
): Filtres {
  switch (cle) {
    case 'interieur':
    case 'ancrage':
    case 'vae':
    case 'accessible':
      return { ...filtres, [cle]: !filtres[cle] };
    case 'distanceMax':
    case 'noteMin':
      return {
        ...filtres,
        [cle]: filtres[cle] === valeur ? null : Number(valeur),
      };
    case 'typeVelo':
    case 'typeDEmplacement':
      return {
        ...filtres,
        [cle]: filtres[cle] === valeur ? null : String(valeur),
      };
  }
}

export function nombreDeFiltresActifs(filtres: Filtres): number {
  return (Object.keys(SANS_FILTRE) as CleDeFiltre[]).filter(
    (cle) => filtres[cle] !== SANS_FILTRE[cle],
  ).length;
}

export function filtresActifs(filtres: Filtres): boolean {
  return nombreDeFiltresActifs(filtres) > 0;
}

const DISTANCES_PERMISES: readonly number[] = DISTANCES.map((d) => d.metres);

/** Les filtres lus dans l'adresse de la page ; toute valeur inconnue est ignorée. */
export function lireLesFiltres(
  parametres: Readonly<Record<string, string | undefined>>,
  typesDeVelo: readonly string[],
): Filtres {
  const distance = Number(parametres.distance);
  const note = Number(parametres.note);
  return {
    distanceMax: DISTANCES_PERMISES.includes(distance) ? distance : null,
    typeVelo:
      parametres.velo && typesDeVelo.includes(parametres.velo)
        ? parametres.velo
        : null,
    typeDEmplacement:
      parametres.espace &&
      (TYPES_EMPLACEMENT_PRIVE as readonly string[]).includes(parametres.espace)
        ? parametres.espace
        : null,
    noteMin: (NOTES_MINIMALES as readonly number[]).includes(note) ? note : null,
    interieur: parametres.interieur === '1',
    ancrage: parametres.ancrage === '1',
    vae: parametres.vae === '1',
    accessible: parametres.accessible === '1',
  };
}

/** Les filtres écrits dans l'adresse d'une page. */
export function ecrireLesFiltres(filtres: Filtres): Record<string, string> {
  const sortie: Record<string, string> = {};
  if (filtres.distanceMax !== null)
    sortie.distance = String(filtres.distanceMax);
  if (filtres.typeVelo) sortie.velo = filtres.typeVelo;
  if (filtres.typeDEmplacement) sortie.espace = filtres.typeDEmplacement;
  if (filtres.noteMin !== null) sortie.note = String(filtres.noteMin);
  if (filtres.interieur) sortie.interieur = '1';
  if (filtres.ancrage) sortie.ancrage = '1';
  if (filtres.vae) sortie.vae = '1';
  if (filtres.accessible) sortie.accessible = '1';
  return sortie;
}

/** Un emplacement a une place à offrir sur le créneau, et son bike sitter est là. */
export function placeLibre(disponibilite: {
  placesLibres: number;
  occupeAilleurs: boolean;
}): boolean {
  return disponibilite.placesLibres > 0 && !disponibilite.occupeAilleurs;
}
