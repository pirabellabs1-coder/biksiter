'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

import { BORD_EN_ERREUR, EncartDErreurs } from '../ecran-de-compte';
import { creerLeCompte, type EtatDeLInscription } from './actions';

type Libelles = {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  motDePasseAide: string;
  conditionsAvant: string;
  cgu: string;
  conditionsEntre: string;
  confidentialite: string;
  continuer: string;
  enCours: string;
};

const VIERGE: EtatDeLInscription = { statut: 'vierge' };

export function FormulaireDInscription({
  code,
  libelles,
}: {
  code: string;
  libelles: Libelles;
}) {
  const [etat, envoyer, enCours] = useActionState(creerLeCompte, VIERGE);

  const saisie = etat.statut === 'erreur' ? etat.saisie : undefined;
  // L'adresse est tenue par l'écran : React vide le formulaire au retour
  // d'une erreur. Le prénom et le nom reviennent de la réponse du serveur ; le
  // mot de passe, jamais renvoyé, s'efface.
  const [email, setEmail] = useState(saisie?.email ?? '');
  const invalide = (champ: string) =>
    etat.statut === 'erreur' && etat.champs.includes(champ) ? true : undefined;
  const decrit = (champ: string, ...autres: string[]) =>
    [...autres, ...(invalide(champ) ? ['erreurs-inscription'] : [])].join(
      ' ',
    ) || undefined;

  return (
    <form action={envoyer} noValidate className="pile">
      <input type="hidden" name="code" value={code} />

      <label
        className="champ-app"
        style={invalide('prenom') ? BORD_EN_ERREUR : undefined}
      >
        <Icone nom="profil" taille={22} />
        <span className="champ-empile">
          <small>{libelles.prenom}</small>
          <input
            name="prenom"
            autoComplete="given-name"
            placeholder="Lucas"
            maxLength={80}
            required
            defaultValue={saisie?.prenom}
            aria-invalid={invalide('prenom')}
            aria-describedby={decrit('prenom')}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      <label
        className="champ-app"
        style={invalide('nom') ? BORD_EN_ERREUR : undefined}
      >
        <Icone nom="profil" taille={22} />
        <span className="champ-empile">
          <small>{libelles.nom}</small>
          <input
            name="nom"
            autoComplete="family-name"
            placeholder="Dubois"
            maxLength={80}
            required
            defaultValue={saisie?.nom}
            aria-invalid={invalide('nom')}
            aria-describedby={decrit('nom')}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      <label
        className="champ-app"
        style={invalide('email') ? BORD_EN_ERREUR : undefined}
      >
        <Icone nom="enveloppe" taille={22} />
        <span className="champ-empile">
          <small>{libelles.email}</small>
          <input
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nom@exemple.be"
            required
            value={email}
            onChange={(evenement) => setEmail(evenement.currentTarget.value)}
            aria-invalid={invalide('email')}
            aria-describedby={decrit('email')}
            style={{ minHeight: 26 }}
          />
        </span>
      </label>

      <div>
        <label
          className="champ-app"
          style={invalide('motDePasse') ? BORD_EN_ERREUR : undefined}
        >
          <Icone nom="cadenas" taille={22} />
          <span className="champ-empile">
            <small>{libelles.motDePasse}</small>
            <input
              name="motDePasse"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={invalide('motDePasse')}
              aria-describedby={decrit('motDePasse', 'aide-mot-de-passe')}
              style={{ minHeight: 26 }}
            />
          </span>
        </label>
        <small id="aide-mot-de-passe" className="aide-champ">
          {libelles.motDePasseAide}
        </small>
      </div>

      {etat.statut === 'erreur' ? (
        <EncartDErreurs id="erreurs-inscription" erreurs={etat.erreurs} />
      ) : null}

      <p className="petit texte-doux" style={{ margin: '14px 0 0', lineHeight: 1.6 }}>
        {libelles.conditionsAvant}{' '}
        <Link href="/conditions-generales" className="lien-souligne texte-vert">
          {libelles.cgu}
        </Link>{' '}
        {libelles.conditionsEntre}{' '}
        <Link href="/confidentialite" className="lien-souligne texte-vert">
          {libelles.confidentialite}
        </Link>
        .
      </p>

      <button
        type="submit"
        className="bouton plein"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? libelles.enCours : libelles.continuer}
        {enCours ? null : <Icone nom="chevron" taille={20} />}
      </button>
    </form>
  );
}
