'use client';

import { useActionState, useEffect, useRef } from 'react';

import { Icone } from '@/components/app/icone';
import { LONGUEUR_MAXIMALE_D_UN_MESSAGE } from '@/lib/regles/contact';

import { BORD_EN_ERREUR } from '../ecran-de-compte';
import { envoyerUnMessage, type EtatDuContact } from './actions';

type Libelles = {
  email: string;
  sujet: string;
  message: string;
  messageExemple: string;
  envoyer: string;
  envoi: string;
  sujets: readonly (readonly [string, string])[];
};

const VIERGE: EtatDuContact = { statut: 'vierge' };

export function FormulaireDeContact({ libelles }: { libelles: Libelles }) {
  const [etat, envoyer, enCours] = useActionState(envoyerUnMessage, VIERGE);
  const erreurs = etat.statut === 'erreur' ? etat.erreurs : {};
  const saisie = etat.statut === 'erreur' ? etat.saisie : undefined;
  const formulaire = useRef<HTMLFormElement>(null);

  // Après un envoi refusé, le focus va au premier champ à corriger (ou au
  // message général) : sans cela, il reste sur un bouton qui vient d'être
  // désactivé, et un lecteur d'écran n'annonce rien.
  useEffect(() => {
    if (etat.statut !== 'erreur') {
      return;
    }
    const cible = formulaire.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"], [role="alert"]',
    );
    cible?.focus();
  }, [etat]);

  if (etat.statut === 'envoye') {
    return (
      <div className="encart" role="status">
        <Icone nom="coche" taille={22} />
        <span>{etat.message}</span>
      </div>
    );
  }

  return (
    <form ref={formulaire} action={envoyer} noValidate className="pile">
      {etat.statut === 'erreur' && etat.general ? (
        <div className="encart rouge" role="alert" tabIndex={-1}>
          <Icone nom="alerte" taille={22} />
          <span>{etat.general}</span>
        </div>
      ) : null}

      <div>
        <label className="champ-app" style={erreurs.email ? BORD_EN_ERREUR : undefined}>
          <Icone nom="enveloppe" taille={22} />
          <span className="champ-empile">
            <small>{libelles.email}</small>
            <input
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nom@exemple.be"
              defaultValue={saisie?.email}
              aria-invalid={erreurs.email ? true : undefined}
              aria-describedby={erreurs.email ? 'contact-email-erreur' : undefined}
              style={{ minHeight: 26 }}
            />
          </span>
        </label>
        {erreurs.email ? (
          <p id="contact-email-erreur" className="erreur-champ">
            {erreurs.email}
          </p>
        ) : null}
      </div>

      <div>
        <label className="champ-app" style={erreurs.sujet ? BORD_EN_ERREUR : undefined}>
          <Icone nom="document" taille={22} />
          <span className="champ-empile">
            <small>{libelles.sujet}</small>
            <select
              key={saisie?.sujet ?? 'vierge'}
              name="sujet"
              defaultValue={saisie?.sujet ?? 'question'}
              aria-invalid={erreurs.sujet ? true : undefined}
              aria-describedby={erreurs.sujet ? 'contact-sujet-erreur' : undefined}
              style={{ minHeight: 26 }}
            >
              {libelles.sujets.map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
          </span>
        </label>
        {erreurs.sujet ? (
          <p id="contact-sujet-erreur" className="erreur-champ">
            {erreurs.sujet}
          </p>
        ) : null}
      </div>

      <div>
        <label className="champ-texte">
          <span style={{ marginTop: 0 }}>{libelles.message}</span>
          <textarea
            name="message"
            rows={6}
            maxLength={LONGUEUR_MAXIMALE_D_UN_MESSAGE}
            placeholder={libelles.messageExemple}
            defaultValue={saisie?.message}
            aria-invalid={erreurs.message ? true : undefined}
            aria-describedby={erreurs.message ? 'contact-message-erreur' : undefined}
            style={erreurs.message ? { ...BORD_EN_ERREUR, minHeight: 150 } : { minHeight: 150 }}
          />
        </label>
        {erreurs.message ? (
          <p id="contact-message-erreur" className="erreur-champ">
            {erreurs.message}
          </p>
        ) : null}
      </div>

      {/* Un champ invisible pour une personne, que remplissent les robots. */}
      <div className="lecteur" aria-hidden="true">
        <label htmlFor="site_web">Site web</label>
        <input id="site_web" name="site_web" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="bouton plein" disabled={enCours}>
        <Icone nom="envoyer" taille={20} />
        {enCours ? libelles.envoi : libelles.envoyer}
      </button>
    </form>
  );
}
