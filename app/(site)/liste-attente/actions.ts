'use server';

import { baseConfiguree } from '@/lib/bd/client';
import { inscrireSurLaListe } from '@/lib/depot/liste-attente';
import {
  ERREUR_GENERALE,
  ressembleAUnEmail,
  texte,
  type EtatDuFormulaire,
} from '@/lib/formulaires/etat';
import { estUnRole } from '@/lib/formulaires/roles';

export async function rejoindreLaListe(
  _precedent: EtatDuFormulaire,
  donnees: FormData,
): Promise<EtatDuFormulaire> {
  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      erreurs: {
        [ERREUR_GENERALE]:
          'La base de données n’est pas branchée : votre inscription ne peut pas être enregistrée.',
      },
    };
  }

  const erreurs: Record<string, string> = {};

  const email = texte(donnees, 'email');
  if (!ressembleAUnEmail(email)) {
    erreurs.email = 'Indiquez une adresse e-mail valide.';
  }

  const quartier = texte(donnees, 'quartier');
  if (quartier === '') {
    erreurs.quartier =
      'Indiquez votre quartier : il nous aide à choisir les prochaines ouvertures.';
  }

  const role = texte(donnees, 'role');
  if (!estUnRole(role)) {
    erreurs.role = 'Indiquez ce que vous seriez plutôt.';
  }

  if (Object.keys(erreurs).length > 0 || !estUnRole(role)) {
    return { statut: 'erreur', erreurs };
  }

  const resultat = await inscrireSurLaListe({ email, quartier, role });

  if (resultat.dejaInscrit) {
    return {
      statut: 'valide',
      message:
        'Vous êtes déjà inscrit sur la liste avec cette adresse : nous vous préviendrons dès l’ouverture de votre quartier.',
    };
  }

  return {
    statut: 'valide',
    message:
      role === 'cycliste'
        ? 'Merci, vous êtes inscrit ! Nous vous préviendrons dès l’ouverture de votre quartier.'
        : 'Merci, vous êtes inscrit ! En tant que futur bike sitter, vous aidez directement votre quartier à ouvrir.',
  };
}
