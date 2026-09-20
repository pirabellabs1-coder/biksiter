'use client';

import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

import type { EtatDUnAmenagement } from '../amenagements';

export function FormulaireDeProlongation({
  action,
  heures,
  jourParDefaut,
  heureParDefaut,
  jourMinimal,
  jourMaximal,
  longueur,
  textes,
}: {
  action: (precedent: EtatDUnAmenagement, donnees: FormData) => Promise<EtatDUnAmenagement>;
  heures: readonly string[];
  jourParDefaut: string;
  heureParDefaut: string;
  jourMinimal: string;
  jourMaximal: string;
  longueur: number;
  textes: {
    nouvelleFin: string;
    jour: string;
    heure: string;
    motif: string;
    exemple: string;
    information: string;
    envoyer: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  const [jour, setJour] = useState(jourParDefaut);
  const [heure, setHeure] = useState(heureParDefaut);
  const [motif, setMotif] = useState('');

  return (
    <form action={envoyer} className="pile">
      <fieldset className="carte sans-cadre" style={{ padding: 14, border: '1px solid var(--bord)' }}>
        <legend className="lecteur">{textes.nouvelleFin}</legend>
        <p style={{ margin: '0 0 10px', fontWeight: 700 }}>
          <Icone nom="horloge" taille={20} className="texte-vert" /> {textes.nouvelleFin}
        </p>
        <div className="deux-colonnes">
          <label className="petit" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600 }}>
            <span>{textes.jour}</span>
            <input
              type="date"
              name="jour"
              className="champ-simple"
              min={jourMinimal}
              max={jourMaximal}
              value={jour}
              onChange={(e) => setJour(e.currentTarget.value)}
              required
            />
          </label>
          <label className="petit" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600 }}>
            <span>{textes.heure}</span>
            <select
              name="heure"
              className="champ-simple"
              value={heure}
              onChange={(e) => setHeure(e.currentTarget.value)}
            >
              {heures.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <label className="champ-texte">
        <span>{textes.motif}</span>
        <textarea
          name="motif"
          maxLength={longueur}
          placeholder={textes.exemple}
          value={motif}
          onChange={(e) => setMotif(e.currentTarget.value)}
        />
        <small className="compteur-texte">
          {motif.length} / {longueur}
        </small>
      </label>

      <div className="encart">
        <Icone nom="info" taille={20} />
        <span>{textes.information}</span>
      </div>

      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}

      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.envoyer}
        <Icone nom="chevron" taille={20} />
      </button>
    </form>
  );
}
