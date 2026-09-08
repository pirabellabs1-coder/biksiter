import { seDeconnecterEtRentrer } from '@/app/connexion/actions';

/**
 * Un bouton dans un formulaire, et non un lien : se déconnecter change l'état
 * du serveur. Un lien peut être préchargé par le navigateur, ce qui
 * déconnecterait le membre au simple survol.
 */
export default function BoutonDeDeconnexion() {
  return (
    <form action={seDeconnecterEtRentrer}>
      <button type="submit" className="bouton bouton--discret">
        Me déconnecter
      </button>
    </form>
  );
}
