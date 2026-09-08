'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { ChampTexte } from '@/components/champs';
import MessageDeFormulaire from '@/components/message-de-formulaire';
import { FORMULAIRE_VIERGE } from '@/lib/formulaires/etat';

import { creerLeCompte } from './actions';

export default function FormulaireDInscription({
  codeDInvitation,
}: {
  codeDInvitation: string;
}) {
  const [etat, envoyer, enCours] = useActionState(
    creerLeCompte,
    FORMULAIRE_VIERGE,
  );

  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};

  return (
    <form action={envoyer} noValidate>
      <MessageDeFormulaire etat={etat} />

      <div className="duo">
        <ChampTexte
          id="prenom"
          label="Prénom"
          autoComplete="given-name"
          erreur={erreurs.prenom}
        />
        <ChampTexte
          id="nom"
          label="Nom"
          autoComplete="family-name"
          erreur={erreurs.nom}
        />
      </div>

      <ChampTexte
        id="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        erreur={erreurs.email}
      />

      <ChampTexte
        id="motDePasse"
        name="motDePasse"
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        aide="Douze caractères au minimum. Une phrase dont vous vous souvenez vaut mieux qu’un mot compliqué."
        erreur={erreurs.motDePasse}
      />

      <ChampTexte
        id="code"
        label="Code d’invitation"
        defaultValue={codeDInvitation}
        autoComplete="off"
        spellCheck={false}
        aide="Transmis par le membre qui vous invite."
        erreur={erreurs.code}
      />

      <div className="champ">
        <div className="case">
          <input
            type="checkbox"
            id="conditions"
            name="conditions"
            value="acceptees"
            aria-invalid={erreurs.conditions ? true : undefined}
            aria-describedby={
              erreurs.conditions ? 'conditions-erreur' : undefined
            }
          />
          <label htmlFor="conditions">
            J’accepte les{' '}
            <Link href="/conditions-generales" className="lien">
              conditions générales
            </Link>
            .
          </label>
        </div>
        {erreurs.conditions ? (
          <span id="conditions-erreur" className="champ__erreur">
            {erreurs.conditions}
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        className="bouton bouton--principal bouton--large"
        disabled={enCours}
      >
        {enCours ? 'Envoi…' : 'Créer mon compte'}
      </button>
    </form>
  );
}
