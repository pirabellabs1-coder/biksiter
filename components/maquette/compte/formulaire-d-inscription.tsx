'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
} from 'react';

import { LONGUEUR_MINIMALE_DU_MOT_DE_PASSE } from '@/lib/regles/comptes';

import {
  creerLeCompte,
  type ChampDInscription,
  type EtatDeLInscription,
} from '@/app/(reseau)/(public)/inscription/actions';

const VIERGE: EtatDeLInscription = { statut: 'vierge' };

/**
 * Le formulaire de création de compte des maquettes définitives.
 *
 * La maquette validait les champs à l'envoi et affichait l'erreur sous le
 * champ concerné ; ici c'est le serveur qui décide, et la réponse revient au
 * même endroit. Le mot de passe n'est jamais renvoyé par le serveur.
 *
 * L'envoi ne passe pas par la réinitialisation automatique du formulaire :
 * après une erreur (un code d'invitation faux, par exemple), tout ce qui a
 * été saisi reste en place, case de la charte comprise.
 */
export function FormulaireDInscription({
  code,
  codeObligatoire,
}: {
  code: string;
  /** Pendant un lancement sur invitation, le code est exigé. */
  codeObligatoire: boolean;
}) {
  const [etat, envoyer, enCours] = useActionState(creerLeCompte, VIERGE);
  const formulaire = useRef<HTMLFormElement>(null);
  const saisie = etat.statut === 'erreur' ? etat.saisie : undefined;
  const message = (champ: ChampDInscription) =>
    etat.statut === 'erreur' ? etat.parChamp[champ] : undefined;
  const enFaute = (champ: ChampDInscription) => Boolean(message(champ));

  const classe = (champ: ChampDInscription) =>
    enFaute(champ) ? 'champ-faux' : undefined;
  const decrit = (champ: ChampDInscription) =>
    enFaute(champ) ? `inscription-${champ}-erreur` : undefined;
  const erreurDe = (champ: ChampDInscription) =>
    enFaute(champ) ? (
      <span className="msg-erreur" id={`inscription-${champ}-erreur`}>
        {message(champ)}
      </span>
    ) : null;

  // Le message d'un champ est écrit dans son <label> : il fait partie de son
  // nom accessible, sans `aria-describedby` qui le ferait lire deux fois. Seule
  // la case de la charte, dont le message suit le libellé, y renvoie.

  // Après un refus, on se retrouve sur le premier champ à revoir : son
  // message est lu, et on corrige sans avoir à le chercher.
  useEffect(() => {
    if (etat.statut !== 'erreur') return;
    formulaire.current
      ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
      ?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    // `action` reste posé : avant l'hydratation, l'envoi passe tout de même
    // par l'action serveur — jamais en GET, mot de passe dans l'URL.
    <form
      ref={formulaire}
      className="bloc"
      action={envoyer}
      onSubmit={soumettre}
      noValidate
    >
      <h2>Votre compte</h2>
      <div className="deux">
        <label className="champ">
          <span>Prénom</span>
          <input
            type="text"
            name="prenom"
            autoComplete="given-name"
            placeholder="Laurent"
            maxLength={80}
            required
            defaultValue={saisie?.prenom}
            className={classe('prenom')}
            aria-invalid={enFaute('prenom') || undefined}
          />
          {erreurDe('prenom')}
        </label>
        <label className="champ">
          <span>Initiale du nom</span>
          <input
            type="text"
            name="nom"
            autoComplete="family-name"
            maxLength={2}
            placeholder="M."
            required
            defaultValue={saisie?.nom}
            className={classe('nom')}
            aria-invalid={enFaute('nom') || undefined}
          />
          {erreurDe('nom')}
        </label>
      </div>
      <label className="champ">
        <span>Adresse e-mail</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="vous@exemple.be"
          required
          defaultValue={saisie?.email}
          className={classe('email')}
          aria-invalid={enFaute('email') || undefined}
        />
        {erreurDe('email')}
      </label>
      <label className="champ">
        <span>Mot de passe</span>
        <input
          type="password"
          name="motDePasse"
          autoComplete="new-password"
          placeholder={`Au moins ${LONGUEUR_MINIMALE_DU_MOT_DE_PASSE} caractères`}
          required
          className={classe('motDePasse')}
          aria-invalid={enFaute('motDePasse') || undefined}
        />
        {erreurDe('motDePasse')}
      </label>
      <label className="champ">
        <span>
          {codeObligatoire ? 'Code d’invitation' : 'Code d’invitation (facultatif)'}
        </span>
        <input
          type="text"
          name="code"
          placeholder="KARI-7K2MQX"
          autoCapitalize="characters"
          required={codeObligatoire}
          defaultValue={code}
          className={classe('code')}
          aria-invalid={enFaute('code') || undefined}
        />
        {erreurDe('code')}
      </label>
      <p className="notice">
        {codeObligatoire
          ? 'Pendant le lancement, l’inscription se fait avec le code d’un membre. Sans code, vous pouvez demander à être prévenu de l’ouverture.'
          : code
            ? 'Le code de la personne qui vous a invité est déjà rempli.'
            : 'Un membre vous a invité ? Indiquez son code ; sinon, laissez ce champ vide.'}
      </p>
      <label className="fc-case">
        <input
          type="checkbox"
          name="charte"
          required
          aria-invalid={enFaute('charte') || undefined}
          aria-describedby={decrit('charte')}
        />
        <span>J’accepte les règles du réseau et la charte de garde.</span>
      </label>
      {erreurDe('charte')}

      {etat.statut === 'erreur' && etat.erreurs.length > 0 ? (
        <p className="msg-erreur" role="alert">
          {etat.erreurs.join(' ')}
        </p>
      ) : null}

      <button
        type="submit"
        className="primary"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? 'Création…' : 'Continuer'}
      </button>
      <p className="notice">
        Seuls votre prénom et l’initiale de votre nom sont visibles par les
        autres membres. Votre adresse ne l’est jamais.
      </p>
    </form>
  );
}
