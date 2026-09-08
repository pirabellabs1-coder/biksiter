import 'server-only';

import { dansUneTransaction, interroger } from '@/lib/bd/client';
import { mettreEnFile } from '@/lib/envois/file';
import { candidatureRecue } from '@/lib/courriel/modeles';
import type {
  Acces,
  Ancrage,
  Intemperie,
  Service,
  Verrouillage,
} from '@/lib/regles/caracteristiques';
import type { TypeEmplacementPrive } from '@/lib/regles/emplacements';
import type { TypeVelo } from '@/lib/regles/velos';

/**
 * Une candidature vient de quelqu'un qui n'a pas encore de compte.
 *
 * Elle ne devient jamais un emplacement toute seule : il faut que la personne
 * crée un compte et qu'une autre personne vérifie son identité (règle 2).
 * C'est pour cela qu'elle vit dans sa propre table et non dans `emplacement`
 * avec un drapeau — un emplacement non publié reste un emplacement, et il n'y
 * en a pas ici.
 */
export type Candidature = {
  prenom: string;
  email: string;
  adresseExacte: string;
  type: TypeEmplacementPrive;
  quartier: string | null;
  capacite: number;
  verrouillage: Verrouillage;
  intemperie: Intemperie;
  acces: Acces;
  ancrage: Ancrage;
  services: readonly Service[];
  velosAcceptes: readonly TypeVelo[];
  precisions: string | null;
};

export async function deposerUneCandidature(
  candidature: Candidature,
): Promise<void> {
  await dansUneTransaction(async (client) => {
    await client.query(
      `insert into candidature_emplacement (
          prenom, email, adresse_exacte, type, quartier, capacite,
          verrouillage, intemperie, acces, ancrage, services,
          velos_acceptes, precisions)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        candidature.prenom,
        candidature.email,
        candidature.adresseExacte,
        candidature.type,
        candidature.quartier,
        candidature.capacite,
        candidature.verrouillage,
        candidature.intemperie,
        candidature.acces,
        candidature.ancrage,
        [...candidature.services],
        [...candidature.velosAcceptes],
        candidature.precisions,
      ],
    );

    await mettreEnFile(
      candidature.email,
      candidatureRecue({ prenom: candidature.prenom }),
      { client, aPropos: 'candidature d’emplacement' },
    );
  });
}

export async function candidaturesATraiter(): Promise<number> {
  const lignes = await interroger<{ combien: number }>(
    `select count(*)::int as combien
       from candidature_emplacement where traitee_le is null`,
  );
  return lignes[0]?.combien ?? 0;
}
