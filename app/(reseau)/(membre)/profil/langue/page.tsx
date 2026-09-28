import { redirect } from 'next/navigation';

/**
 * L'espace membre s'affiche en français tant qu'il n'est pas traduit
 * (lib/i18n/espaces.ts) : la langue se choisit sur le site public. Cette
 * adresse ramène aux paramètres, pour les liens déjà enregistrés.
 */
export default function Langue() {
  redirect('/profil/parametres');
}
