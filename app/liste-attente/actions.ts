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
      'Indiquez votre quartier : c’est ce qui nous dit où ouvrir.';
  }

  const role = texte(donnees, 'role');
  if (!estUnRole(role)) {
    erreurs.role = 'Dites-nous ce que vous seriez plutôt.';
  }

  if (Object.keys(erreurs).length > 0 || !estUnRole(role)) {
    return { statut: 'erreur', erreurs };
  }

  const resultat = await inscrireSurLaListe({ email, quartier, role });

  if (resultat.dejaInscrit) {
    return {
      statut: 'valide',
      message:
        'Vous étiez déjà sur la liste avec cette adresse — c’est noté, il n’y a rien à faire de plus.',
    };
  }

  return {
    statut: 'valide',
    message:
      role === 'cycliste'
        ? 'Vous êtes sur la liste. Nous ouvrirons votre quartier quand il comptera assez de bike sitters pour qu’une place s’y trouve à chaque fois.'
        : 'Vous êtes sur la liste, et c’est votre inscription qui compte le plus : ce sont les bike sitters qui font ouvrir un quartier.',
  };
}
