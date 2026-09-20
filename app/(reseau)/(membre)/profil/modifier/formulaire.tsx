'use client';

import { startTransition, useActionState, type FormEvent, type ReactNode } from 'react';

import { Icone } from '@/components/app/icone';

import { modifierMonNom, type EtatSimple } from '../actions';

const VIDE: EtatSimple = { erreur: null };

/**
 * L'envoi passe par le formulaire sans le réinitialiser : un nom refusé reste
 * affiché tel qu'il a été saisi, pour qu'on le corrige plutôt que le retaper.
 */
export function FormulaireDuNom({
  prenom,
  nom,
  textes,
  children,
}: {
  prenom: string;
  nom: string;
  textes: { prenom: string; nom: string; enregistrer: string; envoi: string };
  children: ReactNode;
}) {
  const [etat, envoyer, enCours] = useActionState(modifierMonNom, VIDE);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    <form action={envoyer} onSubmit={soumettre} className="pile">
      <label className="champ-app">
        <Icone nom="profil" taille={22} />
        <span className="champ-empile">
          <small>{textes.prenom}</small>
          <input
            name="prenom"
            defaultValue={prenom}
            maxLength={60}
            autoComplete="given-name"
            required
            style={{ minHeight: 26 }}
          />
        </span>
      </label>
      <label className="champ-app">
        <Icone nom="profil" taille={22} />
        <span className="champ-empile">
          <small>{textes.nom}</small>
          <input
            name="nom"
            defaultValue={nom}
            maxLength={60}
            autoComplete="family-name"
            required
            style={{ minHeight: 26 }}
          />
        </span>
      </label>
      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}
      {children}
      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.enregistrer}
      </button>
    </form>
  );
}
