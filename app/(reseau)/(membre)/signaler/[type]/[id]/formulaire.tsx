'use client';

import Link from 'next/link';
import { startTransition, useActionState, type FormEvent } from 'react';

import { Icone } from '@/components/app/icone';

import { envoyerUnSignalement, type EtatSimple } from '../../../profil/actions';

const VIDE: EtatSimple = { erreur: null };

/**
 * L'envoi passe par le formulaire sans le réinitialiser : le motif choisi et
 * les détails écrits restent en place si le signalement est refusé.
 */
export function FormulaireDeSignalement({
  type,
  id,
  retour,
  motifs,
  textes,
}: {
  type: 'membre' | 'emplacement';
  id: string;
  retour: string;
  motifs: readonly (readonly [string, string])[];
  textes: {
    motif: string;
    details: string;
    exemple: string;
    discretion: string;
    envoyer: string;
    envoi: string;
    annuler: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(envoyerUnSignalement, VIDE);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    <form action={envoyer} onSubmit={soumettre} className="pile">
      <input type="hidden" name="cible" value={type} />
      <input type="hidden" name="id" value={id} />

      <fieldset className="sans-cadre">
        <legend className="titre-section">{textes.motif}</legend>
        <div className="liste">
          {motifs.map(([valeur, libelle], rang) => (
            <label key={valeur} className="ligne" style={{ margin: 0 }}>
              <input
                type="radio"
                name="motif"
                value={valeur}
                defaultChecked={rang === 0}
                className="radio-app"
                style={{ minHeight: 0, padding: 0 }}
              />
              <span className="ligne-texte">{libelle}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="champ-texte">
        <span>{textes.details}</span>
        <textarea name="details" maxLength={1000} placeholder={textes.exemple} />
      </label>

      <div className="encart bleu">
        <Icone nom="cadenas" taille={20} />
        <span>{textes.discretion}</span>
      </div>

      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}

      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.envoyer}
      </button>
      <Link href={retour} className="bouton discret">
        {textes.annuler}
      </Link>
    </form>
  );
}
