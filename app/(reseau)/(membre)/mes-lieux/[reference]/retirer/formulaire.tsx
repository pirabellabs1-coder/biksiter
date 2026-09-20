'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Icone } from '@/components/app/icone';

import type { EtatDuLieu } from '../../actions';

export function FormulaireDeRetrait({
  action,
  retour,
  textes,
}: {
  action: (precedent: EtatDuLieu, donnees: FormData) => Promise<EtatDuLieu>;
  retour: string;
  textes: { confirmation: string; retirer: string; envoi: string; annuler: string };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreurs: {} });
  return (
    <form action={envoyer} className="pile">
      <label className="check">
        <input type="checkbox" name="confirmation" value="oui" required />
        <span>{textes.confirmation}</span>
      </label>
      {etat.erreurs.formulaire ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreurs.formulaire}</span>
        </div>
      ) : null}
      <button type="submit" className="bouton danger" disabled={enCours}>
        {enCours ? textes.envoi : textes.retirer}
      </button>
      <Link href={retour} className="bouton discret">
        {textes.annuler}
      </Link>
    </form>
  );
}
