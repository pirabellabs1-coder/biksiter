'use server';

import { baseConfiguree } from '@/lib/bd/client';
import { demanderUnNouveauMotDePasse } from '@/lib/depot/comptes';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { texte } from '@/lib/formulaires/etat';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { ressembleAUnEmail } from '@/lib/regles/comptes';
import { COURRIELS_DE_COMPTE } from '@/lib/regles/limites';

export type EtatDeLaDemande =
  | { statut: 'vierge' }
  | { statut: 'erreur'; erreur: string; email: string }
  | { statut: 'envoyee'; message: string };

export async function demanderLeLien(
  _precedent: EtatDeLaDemande,
  donnees: FormData,
): Promise<EtatDeLaDemande> {
  const langue = await langueCourante();
  const p = phraseur(langue);
  const email = texte(donnees, 'email');

  if (!ressembleAUnEmail(email)) {
    return {
      statut: 'erreur',
      email,
      erreur: p('Entrez une adresse e-mail valide.'),
    };
  }

  if (!baseConfiguree()) {
    return {
      statut: 'erreur',
      email,
      erreur: p(
        'L’envoi est momentanément indisponible. Vous pouvez réessayer un peu plus tard.',
      ),
    };
  }

  // Au-delà de la limite, rien ne part, mais la réponse reste la même : elle
  // ne doit rien apprendre sur l'adresse.
  if (!(await limiteDejaAtteinte(COURRIELS_DE_COMPTE, email))) {
    await demanderUnNouveauMotDePasse(email);
    await noterUneTentative('courriel_de_compte', email);
  }

  // La même réponse, que l'adresse existe ou non : c'est ce qui empêche de
  // s'en servir pour savoir qui est membre.
  return {
    statut: 'envoyee',
    message: p(
      "Si un compte existe pour cette adresse, un lien vient d'être envoyé.",
    ),
  };
}
