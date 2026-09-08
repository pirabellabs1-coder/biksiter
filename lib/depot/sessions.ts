import 'server-only';

import { interroger, uneLigne } from '@/lib/bd/client';
import { empreinteDuJeton, nouveauJeton } from '@/lib/securite/jeton';
import type { EtatDeVerification } from '@/lib/regles/publication';

/**
 * Trente jours : assez long pour qu'un bike sitter qui vient une fois par mois
 * ne se reconnecte pas à chaque fois, assez court pour qu'un poste partagé
 * finisse par oublier.
 */
export const DUREE_DE_SESSION_JOURS = 30;

export type MembreConnecte = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  verification: EtatDeVerification;
  moderateur: boolean;
};

export async function ouvrirUneSession(membreId: string): Promise<string> {
  const jeton = nouveauJeton();

  await interroger(
    `insert into session (empreinte_du_jeton, membre_id, expire_le)
     values ($1, $2, now() + ($3 || ' days')::interval)`,
    [empreinteDuJeton(jeton), membreId, String(DUREE_DE_SESSION_JOURS)],
  );

  return jeton;
}

export async function membreDeLaSession(
  jeton: string,
): Promise<MembreConnecte | null> {
  return uneLigne<MembreConnecte>(
    `select m.id, m.prenom, m.nom, m.email, m.verification, m.moderateur
       from session s
       join membre m on m.id = s.membre_id
      where s.empreinte_du_jeton = $1
        and s.expire_le > now()`,
    [empreinteDuJeton(jeton)],
  );
}

export async function fermerLaSession(jeton: string): Promise<void> {
  await interroger('delete from session where empreinte_du_jeton = $1', [
    empreinteDuJeton(jeton),
  ]);
}

/** À passer périodiquement : une session expirée n'a plus rien à faire là. */
export async function purgerLesSessionsExpirees(): Promise<number> {
  const lignes = await interroger<{ id: string }>(
    'delete from session where expire_le <= now() returning membre_id as id',
  );
  return lignes.length;
}
