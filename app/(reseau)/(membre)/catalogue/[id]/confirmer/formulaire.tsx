'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Icone } from '@/components/app/icone';

import type { EtatDeLEchange } from '../../actions';

export function FormulaireDEchange({
  action,
  retour,
  textes,
}: {
  action: (precedent: EtatDeLEchange, donnees: FormData) => Promise<EtatDeLEchange>;
  retour: string;
  textes: { confirmer: string; envoi: string; annuler: string };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  return (
    <form action={envoyer} className="pile" style={{ marginTop: 16 }}>
      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}
      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.confirmer}
      </button>
      <Link href={retour} className="bouton contour">
        {textes.annuler}
      </Link>
    </form>
  );
}
