'use client';

import Link from 'next/link';
import { startTransition, useActionState, useState, type FormEvent } from 'react';

import { Icone } from '@/components/app/icone';

import type { EtatSimple } from '../../actions';

/**
 * Un texte à écrire puis à envoyer : la réponse à un avis, sa contestation.
 * L'action arrive déjà liée à l'avis. L'envoi passe par le formulaire sans le
 * réinitialiser : un texte refusé reste en place pour être corrigé.
 */
export function FormulaireDeTexte({
  action,
  nom,
  longueurMaximale,
  retour,
  textes,
}: {
  action: (precedent: EtatSimple, donnees: FormData) => Promise<EtatSimple>;
  nom: string;
  longueurMaximale: number;
  retour: string;
  textes: {
    libelle: string;
    exemple: string;
    envoyer: string;
    envoi: string;
    revenir: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  const [texte, setTexte] = useState('');

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    <form action={envoyer} onSubmit={soumettre} className="pile">
      <label className="champ-texte">
        <span>{textes.libelle}</span>
        <textarea
          name={nom}
          maxLength={longueurMaximale}
          placeholder={textes.exemple}
          value={texte}
          onChange={(e) => setTexte(e.currentTarget.value)}
          aria-describedby={`${nom}-compteur`}
          required
          style={{ minHeight: 140 }}
        />
      </label>
      <small id={`${nom}-compteur`} className="compteur-texte" style={{ marginTop: 4 }}>
        {texte.length}/{longueurMaximale}
      </small>
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
        {textes.revenir}
      </Link>
    </form>
  );
}
