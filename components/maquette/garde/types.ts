/**
 * Ce qu'une action de formulaire renvoie aux écrans de garde : rien, ou la
 * phrase à montrer. Le type est redit ici pour que les composants des
 * maquettes ne dépendent pas d'un fichier de route.
 */
export type EtatDUneAction = { erreur: string | null };

export type ActionDeFormulaire = (
  precedent: EtatDUneAction,
  donnees: FormData,
) => Promise<EtatDUneAction>;

export const SANS_ERREUR: EtatDUneAction = { erreur: null };
