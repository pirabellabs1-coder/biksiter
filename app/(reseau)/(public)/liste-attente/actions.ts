'use server';

import { baseConfiguree } from '@/lib/bd/client';
import { inscrireSurLaListe } from '@/lib/depot/liste-attente';
import { texte } from '@/lib/formulaires/etat';
import { estUnRole } from '@/lib/formulaires/roles';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { ressembleAUnEmail } from '@/lib/regles/comptes';

export type SaisieDeLaListe = { email: string; quartier: string; role: string };

export type EtatDeLaListe =
  | { statut: 'vierge' }
  | { statut: 'erreur'; erreurs: string[]; saisie: SaisieDeLaListe }
  | { statut: 'inscrit'; message: string };

export async function rejoindreLaListe(
  _precedent: EtatDeLaListe,
  donnees: FormData,
): Promise<EtatDeLaListe> {
  const p = phraseur(await langueCourante());

  const saisie = {
    email: texte(donnees, 'email'),
    quartier: texte(donnees, 'quartier').slice(0, 80),
    role: texte(donnees, 'role'),
  };

  const erreurs: string[] = [];
  if (!ressembleAUnEmail(saisie.email)) {
    erreurs.push(p('Indiquez une adresse e-mail valide.'));
  }
  if (saisie.quartier === '') {
    erreurs.push(p('Indiquez votre quartier.'));
  }
  if (!estUnRole(saisie.role)) {
    erreurs.push(p('Indiquez ce que vous seriez plutôt.'));
  }
  if (erreurs.length > 0 || !estUnRole(saisie.role)) {
    return { statut: 'erreur', erreurs, saisie };
  }

  const indisponible: EtatDeLaListe = {
    statut: 'erreur',
    erreurs: [
      p(
        'L’inscription est momentanément indisponible. Rien n’a été enregistré : vous pouvez réessayer un peu plus tard.',
      ),
    ],
    saisie,
  };

  if (!baseConfiguree()) {
    return indisponible;
  }

  try {
    // Une adresse déjà inscrite n'est pas une erreur : la personne l'avait
    // simplement oublié, et la réponse est la même.
    await inscrireSurLaListe({
      email: saisie.email,
      quartier: saisie.quartier,
      role: saisie.role,
    });
  } catch {
    return indisponible;
  }

  return {
    statut: 'inscrit',
    message: p("Inscrit. Nous vous écrirons à l'ouverture de votre quartier."),
  };
}
