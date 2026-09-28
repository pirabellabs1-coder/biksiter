/**
 * L'élision devant un prénom.
 *
 * Les phrases sont écrites une fois, avec le prénom en variable : « le vélo de
 * {prenom} ». Devant Inès ou Élise, le français écrit « d’Inès », « d’Élise ».
 * On corrige après coup les seules petites formes qui s'élident — « de » et
 * « que » — devant un mot qui commence par une voyelle majuscule : dans nos
 * textes, c'est un prénom ou un nom de commune, qui s'élident de la même
 * façon (« d’Ixelles », « d’Uccle »). Un Y s'élide devant une consonne
 * (« d’Yves ») mais pas devant une voyelle (« de Youssef », « de Yasmine »).
 * « de » doit être un mot entier : « bibliothèque Ixelles » ne bouge pas.
 */
const DEVANT_UNE_VOYELLE =
  /(?<!\p{L})([Dd]e|[Qq]ue) (?=[AEIOUÀÂÉÈÊËÎÏÔÛÜ]|Y(?![aeiouyàâéèêëîïôûü]))/gu;

export function avecElision(phrase: string): string {
  return phrase.replace(DEVANT_UNE_VOYELLE, (_tout, mot: string) =>
    `${mot.slice(0, -1)}’`,
  );
}

/** « d’Inès », « de Tom » : pour une phrase qui ne passe pas par le phraseur. */
export function dePrenom(prenom: string): string {
  return avecElision(`de ${prenom}`);
}
