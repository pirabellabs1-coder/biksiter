'use client';

import { useActionState } from 'react';

import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE, type EtatDuFormulaire } from '@/lib/formulaires/etat';
import { SUJETS_DES_PHOTOS, TYPES_ACCEPTES } from '@/lib/regles/photos';

/**
 * Trois emplacements de photo, un par sujet.
 *
 * On dit explicitement ce qu'il ne faut pas cadrer : aucun code ne sait lire
 * un numéro de rue sur une façade, donc c'est ici que la règle 4 se joue pour
 * ce qui est *dans* l'image. Les métadonnées, elles, sont retirées au dépôt.
 */
export default function Photos({
  action,
  reference,
  presentes,
}: {
  action: (
    etat: EtatDuFormulaire,
    donnees: FormData,
  ) => Promise<EtatDuFormulaire>;
  reference: string;
  presentes: readonly number[];
}) {
  const [etat, envoyer, enCours] = useActionState(action, FORMULAIRE_VIERGE);

  const erreur = etat.statut === 'erreur' ? etat.erreurs.photo : undefined;

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <div className="encart">
        <p>
          <strong>Ne cadrez ni le numéro, ni la plaque de rue.</strong> Les
          coordonnées GPS de vos photos sont effacées à l’arrivée, mais une
          façade reconnaissable, elle, resterait lisible. Montrez le garage, pas
          la maison.
        </p>
      </div>

      {SUJETS_DES_PHOTOS.map((sujet, rang) => (
        <div className="champ" key={sujet}>
          <label htmlFor={`photo-${rang}`}>{sujet}</label>
          {presentes.includes(rang) ? (
            <span className="champ__aide">
              Une photo est déjà là. En envoyer une autre la remplacera.
            </span>
          ) : null}
          <input
            id={`photo-${rang}`}
            name={`photo-${rang}`}
            type="file"
            accept={TYPES_ACCEPTES.join(',')}
          />
        </div>
      ))}

      {erreur ? <span className="champ__erreur">{erreur}</span> : null}

      <input type="hidden" name="reference" value={reference} />

      <button
        type="submit"
        className="bouton bouton--discret"
        disabled={enCours}
      >
        {enCours ? 'Envoi…' : 'Envoyer les photos'}
      </button>
    </form>
  );
}
