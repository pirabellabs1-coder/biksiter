/**
 * Les avis après une garde.
 *
 * La note appartient à la personne, jamais au lieu. Cinq règles :
 * 1. Publication à l'aveugle : chacun écrit sans voir l'avis de l'autre ; les
 *    deux paraissent ensemble, ou seul au bout de sept jours.
 * 2. On dépose un avis dans les quatorze jours qui suivent la fin de la garde.
 * 3. Une seule réponse publique, par la personne visée, après publication.
 * 4. On ne supprime pas un avis qui déplaît : on le conteste, la modération
 *    tranche.
 * 5. L'auteur retire son avis tant qu'il n'est pas publié, pas après.
 *
 * Règle 3 du réseau : aucune de ces notes ne sert à trier ou filtrer des
 * membres.
 */

export type SensDeLAvis =
  'cycliste_vers_bike_sitter' | 'bike_sitter_vers_cycliste';

export const CRITERES: Readonly<Record<SensDeLAvis, readonly string[]>> = {
  cycliste_vers_bike_sitter: ['Accueil', 'Communication', 'Qualité du lieu'],
  bike_sitter_vers_cycliste: ['Ponctualité', 'Communication', 'Respect'],
};

export const DELAI_POUR_DEPOSER_JOURS = 14;
export const PUBLICATION_SEULE_APRES_JOURS = 7;

/** En dessous de trois avis, une moyenne ne dit rien de quelqu'un. */
export const AVIS_POUR_AFFICHER_UNE_NOTE = 3;

const JOUR = 24 * 60 * 60 * 1000;

export function onPeutEncoreDeposer(
  termineLe: Date,
  maintenant: Date,
): boolean {
  return (
    maintenant.getTime() - termineLe.getTime() <=
    DELAI_POUR_DEPOSER_JOURS * JOUR
  );
}

/** Un avis seul se publie au bout de sept jours. */
export function publieSeulLe(ecritLe: Date): Date {
  return new Date(ecritLe.getTime() + PUBLICATION_SEULE_APRES_JOURS * JOUR);
}

export function motifsDeLAvis(brouillon: {
  note: number;
  criteres: Readonly<Record<string, number>>;
  texte: string;
  sens: SensDeLAvis;
}): string[] {
  const motifs: string[] = [];
  if (
    !Number.isInteger(brouillon.note) ||
    brouillon.note < 1 ||
    brouillon.note > 5
  ) {
    motifs.push('Donnez une note générale.');
  }
  const permis = CRITERES[brouillon.sens];
  for (const [critere, valeur] of Object.entries(brouillon.criteres)) {
    if (
      !permis.includes(critere) ||
      !Number.isInteger(valeur) ||
      valeur < 1 ||
      valeur > 5
    ) {
      motifs.push('Une note de critère n’est pas valable.');
      break;
    }
  }
  if (brouillon.texte.length > 1000) {
    motifs.push('Votre avis peut contenir jusqu’à 1000 caractères.');
  }
  return motifs;
}

export function moyenne(notes: readonly number[]): number | null {
  if (notes.length === 0) return null;
  return notes.reduce((somme, note) => somme + note, 0) / notes.length;
}
