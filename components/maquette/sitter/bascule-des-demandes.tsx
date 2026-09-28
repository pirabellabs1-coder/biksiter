import { basculerLesNouvellesDemandes } from '@/app/(reseau)/(membre)/profil/actions';

/**
 * « Accepter les nouvelles demandes » : un seul geste pour tous ses lieux.
 *
 * L'interrupteur est un bouton d'envoi : il fonctionne sans JavaScript, et son
 * état est écrit en toutes lettres à côté — la couleur ne le porte jamais
 * seule (règle 6).
 */
export function BasculeDesDemandes({ accepte }: { accepte: boolean }) {
  return (
    <form action={basculerLesNouvellesDemandes} className="dispo-ligne">
      <input type="hidden" name="accepter" value={accepte ? 'non' : 'oui'} />
      <div>
        <b>Accepter les nouvelles demandes</b>
        <span>
          {accepte
            ? 'Vous apparaissez dans les recherches.'
            : 'Vous n’apparaissez plus dans les recherches.'}
        </span>
      </div>
      {/* Un vrai interrupteur, qui envoie le formulaire dès qu'on le touche.
          La classe « bascule » de la maquette sert aussi à la bascule
          Liste / Carte de la recherche : l'employer ici posait l'interrupteur
          en position fixe, par-dessus la barre du bas. */}
      <button
        type="submit"
        className={accepte ? 'interrupteur-envoi actif' : 'interrupteur-envoi'}
        role="switch"
        aria-checked={accepte}
        aria-label="Recevoir de nouvelles demandes"
      >
        <span aria-hidden="true" />
      </button>
    </form>
  );
}
