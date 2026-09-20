'use client';

import Link from 'next/link';
import { useActionState } from 'react';

type Etat = { erreur: string | null };

/**
 * Un texte à écrire puis à envoyer : la réponse à un avis, sa contestation.
 * L'action arrive déjà liée à ce qu'elle concerne.
 */
export function FormulaireDeTexte({
  action,
  nom,
  longueurMaximale,
  retour,
  textes,
}: {
  action: (precedent: Etat, donnees: FormData) => Promise<Etat>;
  nom: string;
  longueurMaximale: number;
  retour: string;
  textes: {
    explication: string;
    libelle: string;
    exemple: string;
    envoyer: string;
    envoi: string;
    revenir: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  return (
    <form action={envoyer}>
      <div className="pad">
        <p className="t-s muted" style={{ lineHeight: 1.7, marginBottom: 14 }}>
          {textes.explication}
        </p>
        <div className="field">
          <label htmlFor={`texte-${nom}`}>{textes.libelle}</label>
          <textarea
            id={`texte-${nom}`}
            name={nom}
            maxLength={longueurMaximale}
            placeholder={textes.exemple}
            required
          />
        </div>
        {etat.erreur ? (
          <div className="banner alert" role="alert">
            {etat.erreur}
          </div>
        ) : null}
      </div>
      <div className="footer">
        <button type="submit" className="btn primary" disabled={enCours}>
          {enCours ? textes.envoi : textes.envoyer}
        </button>
        <Link href={retour} className="btn ghost">
          {textes.revenir}
        </Link>
      </div>
    </form>
  );
}
