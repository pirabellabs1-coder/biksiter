'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE, type EtatDuFormulaire } from '@/lib/formulaires/etat';
import { LONGUEUR_MAXIMALE_DE_LAVIS } from '@/lib/regles/avis';

/**
 * Un champ de texte, et rien d'autre.
 *
 * Pas d'étoiles, pas de curseur, pas de « recommanderiez-vous ce lieu ? ».
 * La note appartient à la personne, et un emplacement noté deviendrait un
 * emplacement classé.
 */
export default function FormulaireDAvis({
  action,
  prenomDuBikeSitter,
}: {
  action: (
    etat: EtatDuFormulaire,
    donnees: FormData,
  ) => Promise<EtatDuFormulaire>;
  prenomDuBikeSitter: string;
}) {
  const [etat, envoyer, enCours] = useActionState(action, FORMULAIRE_VIERGE);

  const erreur = etat.statut === 'erreur' ? etat.erreurs.avis : undefined;
  const ecrit = etat.statut === 'valide';

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      {ecrit ? null : (
        <>
          <div className="champ">
            <label htmlFor="avis">Comment ça s’est passé&nbsp;?</label>
            <span id="avis-aide" className="champ__aide">
              Ce que vous écrivez apparaît sur la fiche de l’emplacement, signé
              de votre prénom. Racontez le lieu et l’accueil — il n’y a rien à
              noter.
            </span>
            <textarea
              id="avis"
              name="avis"
              maxLength={LONGUEUR_MAXIMALE_DE_LAVIS}
              placeholder={`Accueil chez ${prenomDuBikeSitter}, accès, rangement du vélo…`}
              aria-invalid={erreur ? true : undefined}
              aria-describedby={erreur ? 'avis-aide avis-erreur' : 'avis-aide'}
            />
            {erreur ? (
              <span id="avis-erreur" className="champ__erreur">
                {erreur}
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            className="bouton bouton--discret"
            disabled={enCours}
          >
            {enCours ? 'Envoi…' : 'Publier mon avis'}
          </button>
        </>
      )}
    </form>
  );
}
