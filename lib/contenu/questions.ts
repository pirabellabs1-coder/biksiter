import type { Phraseur } from '../i18n/traduction';

/**
 * Les questions-réponses, telles que les écrans les affichent : le centre
 * d'aide des membres et la FAQ du site public partagent la même forme, la même
 * recherche et le même affichage.
 */

export type QuestionDAide = {
  question: string;
  reponse: string;
  valeurs?: Readonly<Record<string, number>>;
  lien?: { href: string; libelle: string };
};

export type RubriqueDAide = {
  cle: string;
  titre: string;
  description: string;
  icone:
    | 'calendrier'
    | 'velo'
    | 'horloge'
    | 'verifie'
    | 'etoile'
    | 'bouclier'
    | 'maison'
    | 'cle';
  questions: readonly QuestionDAide[];
};

export type RubriqueAffichee = Omit<RubriqueDAide, 'questions'> & {
  questions: {
    question: string;
    reponse: string;
    lien?: QuestionDAide['lien'];
  }[];
};

export const LONGUEUR_D_UNE_RECHERCHE = 80;

/** On cherche « velo » et on trouve « vélo » : les accents ne doivent pas faire écran. */
export function sansAccents(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr');
}

/**
 * Les rubriques traduites, réduites aux questions qui contiennent la recherche.
 * La recherche porte sur le texte affiché, dans la langue de l'écran.
 */
export function rubriquesAffichees(
  rubriques: readonly RubriqueDAide[],
  p: Phraseur,
  recherche: string,
): RubriqueAffichee[] {
  const cherche = sansAccents(
    recherche.trim().slice(0, LONGUEUR_D_UNE_RECHERCHE),
  );
  return rubriques
    .map((rubrique) => ({
      ...rubrique,
      questions: rubrique.questions
        .map((q) => ({
          question: p(q.question),
          reponse: p(q.reponse, q.valeurs),
          lien: q.lien,
        }))
        .filter(
          (q) =>
            !cherche ||
            sansAccents(`${q.question} ${q.reponse}`).includes(cherche),
        ),
    }))
    .filter((rubrique) => rubrique.questions.length > 0);
}

/** Tous les textes d'une liste de rubriques, pour le test de traduction. */
export function textesDesRubriques(
  rubriques: readonly RubriqueDAide[],
): string[] {
  return rubriques.flatMap((rubrique) => [
    rubrique.titre,
    rubrique.description,
    ...rubrique.questions.flatMap((q) => [
      q.question,
      q.reponse,
      ...(q.lien ? [q.lien.libelle] : []),
    ]),
  ]);
}
