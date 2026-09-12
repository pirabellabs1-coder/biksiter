/**
 * Règle 2 — l'identité avant la publication.
 *
 * Personne ne publie un emplacement sans avoir été vérifié par un humain.
 * C'est ce qui rend acceptable d'ouvrir sa porte : le cycliste sait à qui il
 * confie son vélo, le bike sitter sait qui il fait entrer.
 *
 * « Vérifié par un humain » se dit ici `verifiee` : une adresse e-mail
 * confirmée automatiquement ne suffit pas et ne suffira jamais.
 */

import {
  EMPLACEMENTS_PAR_MEMBRE,
  peutAjouterUnEmplacement,
} from './emplacements';

export type EtatDeVerification =
  'absente' | 'en_cours' | 'verifiee' | 'refusee';

export type Membre = {
  verification: EtatDeVerification;
  emplacementsPublies: number;
};

export type RefusDePublication = 'identite_non_verifiee' | 'quota_atteint';

export type DecisionDePublication =
  { autorise: true } | { autorise: false; motif: RefusDePublication };

export function decisionDePublication(membre: Membre): DecisionDePublication {
  if (membre.verification !== 'verifiee') {
    return { autorise: false, motif: 'identite_non_verifiee' };
  }

  if (!peutAjouterUnEmplacement(membre.emplacementsPublies)) {
    return { autorise: false, motif: 'quota_atteint' };
  }

  return { autorise: true };
}

export const MOTIFS_DE_REFUS: Record<RefusDePublication, string> = {
  identite_non_verifiee:
    'Votre emplacement pourra être publié dès que votre identité aura été vérifiée.',
  quota_atteint: `Vous proposez déjà ${EMPLACEMENTS_PAR_MEMBRE} emplacements, le maximum par membre.`,
};

/**
 * Une demande de stationnement suppose elle aussi une identité vérifiée :
 * c'est la contrepartie de ce qu'on demande au bike sitter.
 */
export function peutDemanderUnStationnement(membre: Membre): boolean {
  return membre.verification === 'verifiee';
}
