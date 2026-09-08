'use server';

import {
  RIEN_N_EST_ENCORE_ENVOYE,
  ressembleAUnEmail,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { estUnRole } from '@/lib/formulaires/roles';

export async function rejoindreLaListe(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  const erreurs: Record<string, string> = {};

  const email = texte(donnees, 'email');
  if (!ressembleAUnEmail(email)) {
    erreurs.email = 'Indiquez une adresse e-mail valide.';
  }

  const quartier = texte(donnees, 'quartier');
  if (quartier === '') {
    erreurs.quartier =
      'Indiquez votre quartier : c’est ce qui nous dit où ouvrir.';
  }

  const role = texte(donnees, 'role');
  if (!estUnRole(role)) {
    erreurs.role = 'Dites-nous ce que vous seriez plutôt.';
  }

  if (Object.keys(erreurs).length > 0) {
    return { statut: 'erreur', erreurs };
  }

  // TODO(persistance) : enregistrer l'inscription et compter les bike sitters
  // par quartier — c'est ce compteur qui déclenche l'ouverture d'un quartier.
  return { statut: 'valide', message: RIEN_N_EST_ENCORE_ENVOYE };
}
