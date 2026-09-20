'use client';

import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

type EtatDUneDecision = { erreur: string | null };

export function FormulaireDeCorrection({
  action,
  maximum,
  textes,
}: {
  action: (precedent: EtatDUneDecision, donnees: FormData) => Promise<EtatDUneDecision>;
  maximum: number;
  textes: {
    ajouter: string;
    retirer: string;
    nombre: string;
    motif: string;
    aide: string;
    enregistrer: string;
    envoi: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  const [sens, setSens] = useState<'ajouter' | 'retirer'>('ajouter');
  const [nombre, setNombre] = useState('');
  const [motif, setMotif] = useState('');

  return (
    <form action={envoyer} className="pile">
      <div className="segments" role="radiogroup" aria-label={textes.nombre}>
        {(['ajouter', 'retirer'] as const).map((valeur) => (
          <label
            key={valeur}
            className="bouton"
            style={{
              minHeight: 38,
              background: sens === valeur ? 'var(--trust)' : 'transparent',
              color: sens === valeur ? '#fff' : 'var(--texte-doux)',
            }}
          >
            <input
              type="radio"
              name="sens"
              value={valeur}
              checked={sens === valeur}
              onChange={() => setSens(valeur)}
              className="lecteur"
            />
            {valeur === 'ajouter' ? textes.ajouter : textes.retirer}
          </label>
        ))}
      </div>
      <label className="petit" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 700 }}>
        <span>{textes.nombre}</span>
        <input
          type="number"
          name="nombre"
          min={1}
          max={maximum}
          step={1}
          required
          className="champ-simple"
          value={nombre}
          onChange={(e) => setNombre(e.currentTarget.value)}
        />
      </label>
      <label className="champ-texte">
        <span>{textes.motif}</span>
        <textarea name="motif" maxLength={600} required value={motif} onChange={(e) => setMotif(e.currentTarget.value)} />
        <small className="aide-champ">{textes.aide}</small>
      </label>
      {etat.erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{etat.erreur}</span>
        </div>
      ) : null}
      <button type="submit" className="bouton plein" disabled={enCours}>
        {enCours ? textes.envoi : textes.enregistrer}
      </button>
    </form>
  );
}
