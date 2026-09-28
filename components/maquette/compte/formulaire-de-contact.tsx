'use client';

import { useActionState } from 'react';

import {
  envoyerUnMessage,
  type EtatDuContact,
} from '@/app/(reseau)/(public)/contact/actions';
import { LONGUEUR_MAXIMALE_D_UN_MESSAGE } from '@/lib/regles/contact';

const VIERGE: EtatDuContact = { statut: 'vierge' };

/**
 * Les sujets tels qu'ils s'écrivent dans la maquette.
 *
 * Chacun se range dans l'une des catégories que la modération sait traiter :
 * la formulation est celle qu'on lit, la valeur est celle qui aiguille le
 * message vers le bon bénévole.
 */
const SUJETS: readonly { libelle: string; valeur: string }[] = [
  { libelle: 'Une question sur une garde', valeur: 'garde' },
  { libelle: 'Devenir Bike Sitter', valeur: 'question' },
  { libelle: 'Proposer un partenariat', valeur: 'question' },
  { libelle: 'Signaler un problème', valeur: 'abus' },
  { libelle: 'Autre', valeur: 'question' },
];

export function FormulaireDeContact() {
  const [etat, envoyer, enCours] = useActionState(envoyerUnMessage, VIERGE);
  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};
  const saisie = etat.statut === 'erreur' ? etat.saisie : undefined;

  if (etat.statut === 'envoye') {
    return (
      <section className="bloc">
        <h2>Votre message</h2>
        <p className="info-bleue" role="status">
          {etat.message}
        </p>
      </section>
    );
  }

  return (
    <form className="bloc" action={envoyer} noValidate>
      <h2>Votre message</h2>

      {etat.statut === 'erreur' && etat.general ? (
        <p className="msg-erreur" role="alert">
          {etat.general}
        </p>
      ) : null}

      <label className="champ">
        <span>Votre nom</span>
        <input
          type="text"
          name="nom"
          autoComplete="name"
          placeholder="Prénom et initiale"
          maxLength={80}
          required
        />
      </label>
      <label className="champ">
        <span>Votre e-mail</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="vous@exemple.be"
          required
          defaultValue={saisie?.email}
          className={erreurs.email ? 'champ-faux' : undefined}
          aria-invalid={erreurs.email ? true : undefined}
          aria-describedby={erreurs.email ? 'contact-email-erreur' : undefined}
        />
        {erreurs.email ? (
          <span className="msg-erreur" id="contact-email-erreur">
            {erreurs.email}
          </span>
        ) : null}
      </label>
      <label className="champ">
        <span>Sujet</span>
        <select name="sujet" defaultValue={saisie?.sujet ?? 'garde'}>
          {SUJETS.map((sujet) => (
            <option key={sujet.libelle} value={sujet.valeur}>
              {sujet.libelle}
            </option>
          ))}
        </select>
      </label>
      <label className="champ">
        <span>Votre message</span>
        <textarea
          name="message"
          rows={5}
          maxLength={LONGUEUR_MAXIMALE_D_UN_MESSAGE}
          placeholder="Dites-nous tout."
          required
          defaultValue={saisie?.message}
          className={erreurs.message ? 'champ-faux' : undefined}
          aria-invalid={erreurs.message ? true : undefined}
          aria-describedby={
            erreurs.message ? 'contact-message-erreur' : undefined
          }
        />
        {erreurs.message ? (
          <span className="msg-erreur" id="contact-message-erreur">
            {erreurs.message}
          </span>
        ) : null}
      </label>

      {/* Un champ invisible pour une personne, que remplissent les robots. */}
      <div className="vh" aria-hidden="true">
        <label htmlFor="site_web">Site web</label>
        <input id="site_web" name="site_web" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        className="primary"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  );
}
