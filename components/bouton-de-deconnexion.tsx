import { seDeconnecterEtRentrer } from '@/app/(site)/connexion/actions';

import IconeCaracteristique from '@/components/icone-caracteristique';

/**
 * Un bouton dans un formulaire, et non un lien : se déconnecter change l'état
 * du serveur. Un lien peut être préchargé par le navigateur, ce qui
 * déconnecterait le membre au simple survol.
 *
 * Il prend l'allure d'un lien du rail quand il y est posé, parce qu'un bouton
 * plein en bas d'une colonne de navigation attirerait l'œil plus que la
 * navigation elle-même — et se déconnecter n'est pas ce qu'on vient faire.
 */
export default function BoutonDeDeconnexion() {
  return (
    <form action={seDeconnecterEtRentrer}>
      <button type="submit" className="bouton-lien">
        <IconeCaracteristique pictogramme="fermeture" />
        <span className="rail__libelle">Me déconnecter</span>
      </button>
    </form>
  );
}
