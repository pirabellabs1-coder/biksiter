'use client';

import { useActionState, useState } from 'react';

import { Icone } from '@/components/app/icone';

type EtatDUneDecision = { erreur: string | null };

export type ValeursDeLOffre = {
  titre: string;
  partenaire: string;
  categorie: string;
  description: string;
  retrait: string;
  cout: string;
  stock: string;
  active: boolean;
};

export function FormulaireDOffre({
  action,
  initial,
  categories,
  textes,
}: {
  action: (precedent: EtatDUneDecision, donnees: FormData) => Promise<EtatDUneDecision>;
  initial: ValeursDeLOffre;
  categories: readonly (readonly [string, string])[];
  textes: Record<
    'titre' | 'partenaire' | 'categorie' | 'description' | 'retrait' | 'cout' | 'stock' | 'active' | 'activeAide' | 'enregistrer' | 'envoi',
    string
  >;
}) {
  const [etat, envoyer, enCours] = useActionState(action, { erreur: null });
  // Tous les champs sont tenus ici : une erreur du serveur ne vide pas la fiche.
  const [valeurs, setValeurs] = useState(initial);
  const changer =
    (nom: keyof ValeursDeLOffre) =>
    (e: { currentTarget: { value: string } }) => {
      const valeur = e.currentTarget.value;
      setValeurs((avant) => ({ ...avant, [nom]: valeur }));
    };
  const champ = { display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 700 } as const;

  return (
    <form action={envoyer} className="pile">
      <input type="hidden" name="stockLu" value={initial.stock} />
      <label className="petit" style={champ}>
        <span>{textes.titre}</span>
        <input name="titre" className="champ-simple" maxLength={80} required value={valeurs.titre} onChange={changer('titre')} />
      </label>
      <label className="petit" style={champ}>
        <span>{textes.partenaire}</span>
        <input name="partenaire" className="champ-simple" maxLength={80} required value={valeurs.partenaire} onChange={changer('partenaire')} />
      </label>
      <label className="petit" style={champ}>
        <span>{textes.categorie}</span>
        <select name="categorie" className="champ-simple" value={valeurs.categorie} onChange={changer('categorie')}>
          {categories.map(([cle, titre]) => (
            <option key={cle} value={cle}>
              {titre}
            </option>
          ))}
        </select>
      </label>
      <label className="champ-texte">
        <span>{textes.description}</span>
        <textarea name="description" maxLength={600} value={valeurs.description} onChange={changer('description')} />
      </label>
      <label className="champ-texte">
        <span>{textes.retrait}</span>
        <textarea name="retrait" maxLength={300} style={{ minHeight: 64 }} value={valeurs.retrait} onChange={changer('retrait')} />
      </label>
      <div className="deux-colonnes">
        <label className="petit" style={champ}>
          <span>{textes.cout}</span>
          <input name="cout" type="number" min={1} max={1000} className="champ-simple" required value={valeurs.cout} onChange={changer('cout')} />
        </label>
        <label className="petit" style={champ}>
          <span>{textes.stock}</span>
          <input name="stock" type="number" min={0} max={10000} className="champ-simple" required value={valeurs.stock} onChange={changer('stock')} />
        </label>
      </div>
      <label className="ligne carte">
        <span className="ligne-texte">
          <strong>{textes.active}</strong>
          <span>{textes.activeAide}</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          name="active"
          value="oui"
          className="sw"
          checked={valeurs.active}
          onChange={(e) => {
            const coche = e.currentTarget.checked;
            setValeurs((avant) => ({ ...avant, active: coche }));
          }}
        />
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
