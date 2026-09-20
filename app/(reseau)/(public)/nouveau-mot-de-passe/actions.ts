'use server';

import { redirect } from 'next/navigation';

import { choisirUnNouveauMotDePasse } from '@/lib/depot/comptes';
import { texte } from '@/lib/formulaires/etat';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { erreurDeMotDePasse } from '@/lib/regles/comptes';

export type EtatDuNouveauMotDePasse =
  | { statut: 'vierge' }
  | { statut: 'erreur'; erreur: string; lienPerime?: boolean };

export async function enregistrerLeMotDePasse(
  _precedent: EtatDuNouveauMotDePasse,
  donnees: FormData,
): Promise<EtatDuNouveauMotDePasse> {
  const langue = await langueCourante();
  const p = phraseur(langue);

  const jeton = texte(donnees, 'jeton');
  const brut = donnees.get('motDePasse');
  const motDePasse = typeof brut === 'string' ? brut : '';
  const confirmation = donnees.get('confirmation');

  const erreur = erreurDeMotDePasse(motDePasse);
  if (erreur) {
    return { statut: 'erreur', erreur: p(erreur) };
  }
  if (confirmation !== motDePasse) {
    return {
      statut: 'erreur',
      erreur: p('Les deux mots de passe ne sont pas identiques.'),
    };
  }

  const membreId = await choisirUnNouveauMotDePasse(jeton, motDePasse);
  if (!membreId) {
    return {
      statut: 'erreur',
      lienPerime: true,
      erreur: p(
        'Ce lien n’est plus valable : il a déjà servi ou a expiré. Vous pouvez en demander un nouveau.',
      ),
    };
  }

  redirect('/connexion?motDePasse=change');
}
