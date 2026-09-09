import 'server-only';

import { uneLigne } from '@/lib/bd/client';
import type { MesuresDuReseau } from '@/lib/regles/chiffres';

/**
 * Les chiffres du réseau, comptés dans la base.
 *
 * Ils ne sont plus écrits à la main. Un nombre saisi dans un fichier vieillit
 * mal : il reste juste assez plausible pour qu'on ne pense jamais à le
 * corriger. Ce qui se compte se compte, et ce qui ne se compte pas ne
 * s'affiche pas — c'est `lib/regles/chiffres.ts` qui décide de la suite.
 */

const AUCUNE_MESURE: MesuresDuReseau = {
  gardesRealisees: 0,
  habitantsQuiAccueillent: 0,
  quartiersOuverts: 0,
};

export async function mesuresDuReseau(): Promise<MesuresDuReseau> {
  const ligne = await uneLigne<MesuresDuReseau>(
    `select
       (select count(*) from stationnement where etat = 'termine')::int
         as "gardesRealisees",
       -- Des habitants, pas des emplacements : quelqu'un qui en propose deux
       -- reste une seule porte ouverte.
       (select count(distinct membre_id) from emplacement where publie)::int
         as "habitantsQuiAccueillent",
       (select count(distinct quartier) from emplacement where publie)::int
         as "quartiersOuverts"`,
  );

  return ligne ?? AUCUNE_MESURE;
}
