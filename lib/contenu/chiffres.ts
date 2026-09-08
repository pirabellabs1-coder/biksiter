/**
 * Les chiffres affichés sur le site.
 *
 * ATTENTION — ce sont les valeurs de la maquette, pas des mesures. Elles
 * doivent être remplacées par les chiffres réels du réseau avant la mise en
 * ligne, puis branchées sur la base. Elles sont réunies ici pour qu’on ne les
 * cherche pas dans quinze fichiers le jour où on les corrigera.
 *
 * Aucun chiffre externe (vols en Belgique, part des cyclistes touchés) n’est
 * affiché tant qu’on n’a pas la source à citer : une association qui avance un
 * chiffre doit pouvoir dire d’où il vient.
 */

export type Chiffre = {
  valeur: string;
  libelle: string;
};

export const CHIFFRES_DU_RESEAU: readonly Chiffre[] = [
  { valeur: '612', libelle: 'emplacements proposés' },
  { valeur: '3 480', libelle: 'vélos accueillis' },
  { valeur: '9', libelle: 'quartiers ouverts à Bruxelles' },
];
