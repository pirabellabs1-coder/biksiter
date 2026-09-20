'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Icone } from '@/components/app/icone';

import { supprimerMonCompte, type EtatSimple } from '../actions';

const VIDE: EtatSimple = { erreur: null };

export function FormulaireDeSuppression({
  possible,
  textes,
}: {
  possible: boolean;
  textes: {
    retenu: string;
    conserve: string;
    motDePasse: string;
    confirmation: string;
    supprimer: string;
    envoi: string;
    annuler: string;
    voirMonActivite: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(supprimerMonCompte, VIDE);

  if (!possible) {
    return (
      <div className="pile">
        <div className="encart ambre" role="status">
          <Icone nom="horloge" taille={22} />
          <span>{textes.retenu}</span>
        </div>
        <Link href="/gardes" className="bouton plein">
          {textes.voirMonActivite}
        </Link>
        <Link href="/profil/parametres" className="bouton discret">
          {textes.annuler}
        </Link>
      </div>
    );
  }

  return (
    <form action={envoyer} className="pile">
      <p className="petit texte-doux" style={{ margin: 0, lineHeight: 1.6 }}>
        {textes.conserve}
      </p>
      <label className="champ-texte">
        <span>{textes.motDePasse}</span>
        <input
          name="motDePasse"
          type="password"
          className="champ-simple"
          autoComplete="current-password"
          maxLength={200}
          required
        />
      </label>
      <label className="check">
        <input type="checkbox" name="confirmation" value="oui" required />
        <span>{textes.confirmation}</span>
      </label>
      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}
      <button type="submit" className="bouton danger" disabled={enCours}>
        {enCours ? textes.envoi : textes.supprimer}
      </button>
      <Link href="/profil/parametres" className="bouton discret">
        {textes.annuler}
      </Link>
    </form>
  );
}
