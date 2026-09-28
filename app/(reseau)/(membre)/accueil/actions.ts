'use server';

import { revalidatePath } from 'next/cache';

import {
  changerLaDisponibiliteImmediate,
  horairesDeMesLieuxPublies,
} from '@/lib/depot/lieux';
import { heureFrancaise } from '@/lib/regles/creneau';
import {
  finDeLaDisponibiliteImmediate,
  ouvertureImmediate,
} from '@/lib/regles/disponibilite-immediate';
import { exigerUnMembre } from '@/lib/session';

export type EtatDeLaDisponibilite = {
  jusqua: string | null;
  erreur: string | null;
};

/** Ouvre ou ferme la disponibilité immédiate du bike sitter connecté. */
export async function changerDisponibiliteImmediate(
  _precedent: EtatDeLaDisponibilite,
  donnees: FormData,
): Promise<EtatDeLaDisponibilite> {
  const membre = await exigerUnMembre();
  const ouvrir = donnees.get('ouvrir') === 'oui';
  if (ouvrir) {
    const horaires = await horairesDeMesLieuxPublies(membre.id);
    const ouverture = ouvertureImmediate(horaires, new Date());
    if (horaires.length > 0 && !ouverture.possible) {
      return {
        jusqua: null,
        erreur: texteDeLAttente(ouverture.des),
      };
    }
  }
  const jusqua = ouvrir ? finDeLaDisponibiliteImmediate(new Date()) : null;
  const concernes = await changerLaDisponibiliteImmediate(membre.id, jusqua);
  if (ouvrir && concernes === 0) {
    return {
      jusqua: null,
      erreur:
        'Publiez d’abord un emplacement : c’est lui qui apparaîtra en tête des résultats.',
    };
  }
  revalidatePath('/accueil');
  return { jusqua: jusqua ? jusqua.toISOString() : null, erreur: null };
}

/** Ce qu'on dit au bike sitter quand l'heure ne s'y prête pas encore. */
function texteDeLAttente(des: string | null): string {
  return des
    ? `Vous pourrez vous dire disponible à partir de ${heureFrancaise(des)}, pendant vos horaires d’accueil.`
    : 'Vos horaires d’accueil sont terminés pour aujourd’hui. Vous pourrez vous dire disponible demain, pendant ces horaires.';
}
