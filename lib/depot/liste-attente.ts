import 'server-only';

import {
  VIOLATION_UNICITE,
  codeDErreurPostgres,
  interroger,
  uneLigne,
} from '@/lib/bd/client';
import type { Role } from '@/lib/formulaires/roles';

export type DejaInscrit = { dejaInscrit: true };
export type Inscrit = { dejaInscrit: false };

/**
 * Une deuxième inscription avec la même adresse n'est pas une erreur : la
 * personne a simplement oublié qu'elle s'était déjà inscrite. On le lui dit
 * sans lui faire corriger un formulaire.
 */
export async function inscrireSurLaListe(inscription: {
  email: string;
  quartier: string;
  role: Role;
}): Promise<DejaInscrit | Inscrit> {
  try {
    await interroger(
      `insert into inscription_liste_attente (email, quartier, role)
       values ($1, $2, $3)`,
      [inscription.email, inscription.quartier, inscription.role],
    );
    return { dejaInscrit: false };
  } catch (erreur) {
    if (codeDErreurPostgres(erreur) === VIOLATION_UNICITE) {
      return { dejaInscrit: true };
    }
    throw erreur;
  }
}

export type QuartierEnAttente = {
  quartier: string;
  bikeSitters: number;
  cyclistes: number;
};

/**
 * Ce qui sert à décider quel quartier ouvrir ensuite : ce sont les bike
 * sitters qui comptent, pas le nombre de cyclistes en attente.
 */
export async function quartiersEnAttente(): Promise<QuartierEnAttente[]> {
  return interroger<QuartierEnAttente>(
    `select initcap(quartier) as quartier,
            count(*) filter (where role in ('bike_sitter', 'les_deux'))::int
              as "bikeSitters",
            count(*) filter (where role in ('cycliste', 'les_deux'))::int
              as cyclistes
       from inscription_liste_attente
      group by lower(quartier), initcap(quartier)
      order by "bikeSitters" desc, quartier`,
  );
}

export async function nombreDInscrits(): Promise<number> {
  const ligne = await uneLigne<{ combien: number }>(
    'select count(*)::int as combien from inscription_liste_attente',
  );
  return ligne?.combien ?? 0;
}
