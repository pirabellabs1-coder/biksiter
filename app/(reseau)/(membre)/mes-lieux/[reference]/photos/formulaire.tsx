'use client';

import { startTransition, useActionState, useEffect, useState, type FormEvent } from 'react';

import { Icone } from '@/components/app/icone';

import type { EtatDuLieu } from '../../actions';

/**
 * Trois emplacements de photo. Chaque case montre la photo déjà enregistrée,
 * ou l'aperçu de celle qu'on vient de choisir.
 */
export function FormulaireDePhotos({
  action,
  reference,
  existantes,
  textes,
}: {
  action: (precedent: EtatDuLieu, donnees: FormData) => Promise<EtatDuLieu>;
  reference: string;
  existantes: readonly number[];
  textes: {
    cases: readonly [string, string][];
    choisir: string;
    remplacer: string;
    envoyer: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreurs: {} });
  const [apercus, setApercus] = useState<Record<number, string>>({});

  useEffect(
    () => () => Object.values(apercus).forEach((adresse) => URL.revokeObjectURL(adresse)),
    [apercus],
  );

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    <form action={envoyer} onSubmit={soumettre} className="pile">
      {textes.cases.map(([titre, conseil], rang) => {
        const apercu = apercus[rang];
        const existe = existantes.includes(rang);
        return (
          <label key={rang} className="carte case-photo">
            <span className="case-photo-image">
              {apercu ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={apercu} alt="" />
              ) : existe ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/emplacements/${reference}/photo/${rang}`} alt="" />
              ) : (
                <Icone nom="photo" taille={30} />
              )}
            </span>
            <span className="ligne-texte">
              <strong>{titre}</strong>
              <span>{conseil}</span>
              <span className="bouton contour petit">
                <Icone nom={existe || apercu ? 'reglages' : 'plus'} taille={16} />
                {existe || apercu ? textes.remplacer : textes.choisir}
              </span>
            </span>
            <input
              type="file"
              name={`photo-${rang}`}
              accept="image/jpeg,image/png,image/webp"
              className="lecteur"
              onChange={(e) => {
                const fichier = e.currentTarget.files?.[0];
                if (!fichier) return;
                setApercus((a) => ({ ...a, [rang]: URL.createObjectURL(fichier) }));
              }}
            />
          </label>
        );
      })}

      {etat.erreurs.photo ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={20} />
          <span>{etat.erreurs.photo}</span>
        </div>
      ) : null}

      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.envoyer}
        <Icone nom="chevron" taille={20} />
      </button>
    </form>
  );
}
