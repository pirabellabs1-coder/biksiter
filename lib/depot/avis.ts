import 'server-only';

import { dansUneTransaction, interroger } from '@/lib/bd/client';
import { refusDeLAvis, type RefusDAvis } from '@/lib/regles/avis';

/**
 * Les avis d'un emplacement.
 *
 * Aucune colonne de note, aucune moyenne, aucun tri par « les mieux notés ».
 * On lit les avis d'un emplacement dans l'ordre où ils ont été écrits, et
 * c'est tout ce qu'on peut en faire.
 */

export type AvisAffiche = {
  id: string;
  corps: string;
  ecritLe: Date;
  prenomDeLAuteur: string;
  typeVelo: string;
};

export async function avisDeLEmplacement(
  reference: string,
  combien = 6,
): Promise<AvisAffiche[]> {
  return interroger<AvisAffiche>(
    `select a.id,
            a.corps,
            a.ecrit_le  as "ecritLe",
            m.prenom    as "prenomDeLAuteur",
            s.type_velo as "typeVelo"
       from avis a
       join emplacement e on e.id = a.emplacement_id
       join membre m on m.id = a.auteur_id
       join stationnement s on s.id = a.stationnement_id
      where e.reference = $1
      order by a.ecrit_le desc
      limit $2`,
    [reference, combien],
  );
}

export type EcritureDAvis =
  | { ecrit: true }
  | { ecrit: false; motif: RefusDAvis | 'introuvable' };

export async function ecrireUnAvis(
  stationnementId: string,
  auteurId: string,
  corps: string,
): Promise<EcritureDAvis> {
  return dansUneTransaction(async (client) => {
    const contexte = await client.query<{
      emplacementId: string;
      cyclisteId: string;
      etat: string;
      dejaEcrit: boolean;
    }>(
      `select s.emplacement_id as "emplacementId",
              s.cycliste_id    as "cyclisteId",
              s.etat,
              exists (select 1 from avis where stationnement_id = s.id) as "dejaEcrit"
         from stationnement s
        where s.id = $1`,
      [stationnementId],
    );

    if (contexte.rowCount === 0) {
      return { ecrit: false, motif: 'introuvable' };
    }

    const ligne = contexte.rows[0];

    const refus = refusDeLAvis({
      corps,
      etatDeLaGarde: ligne.etat,
      estLeCycliste: ligne.cyclisteId === auteurId,
      dejaEcrit: ligne.dejaEcrit,
    });

    if (refus) {
      return { ecrit: false, motif: refus };
    }

    // Le déclencheur en base revérifie les trois mêmes conditions : ce qui est
    // écrit ici pour donner un message clair l'est là-bas pour être vrai.
    await client.query(
      `insert into avis (stationnement_id, emplacement_id, auteur_id, corps)
       values ($1, $2, $3, $4)`,
      [stationnementId, ligne.emplacementId, auteurId, corps.trim()],
    );

    return { ecrit: true };
  });
}

export async function avisDejaEcrit(
  stationnementId: string,
): Promise<boolean> {
  const lignes = await interroger<{ existe: boolean }>(
    'select exists (select 1 from avis where stationnement_id = $1) as existe',
    [stationnementId],
  );
  return lignes[0]?.existe ?? false;
}
