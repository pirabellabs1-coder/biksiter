'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { Icone } from '@/components/app/icone';
import {
  motifsDuConstat,
  TAILLE_MAXIMALE_D_UNE_PHOTO_DE_CONSTAT,
} from '@/lib/regles/constat';
import type { Phase } from '@/lib/regles/garde';

import { validerLeConstat, type EtatDUneAction } from '../../actions';

const VIDE: EtatDUneAction = { erreur: null };

export function FormulaireDeConstat({
  id,
  phase,
  electrique,
  emplacements,
  etats,
  textes,
}: {
  id: string;
  phase: Phase;
  electrique: boolean;
  /** Le rang, le titre, vrai si la photo est indispensable, et le nom du champ. */
  emplacements: readonly (readonly [number, string, boolean, string])[];
  etats: readonly (readonly [string, string])[];
  textes: {
    photos: string;
    facultative: string;
    ajoutee: string;
    tropLourde: string;
    etat: string;
    defaut: string;
    defautExemple: string;
    batterie: string;
    valider: string;
    envoi: string;
    /** Les motifs de la règle, traduits : la vérification se fait avant l'envoi. */
    motifs: Readonly<Record<string, string>>;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(
    validerLeConstat.bind(null, id, phase),
    VIDE,
  );
  // Tout est tenu ici : un refus du serveur ne vide ni les photos ni l'état.
  const [fichiers, setFichiers] = useState<Record<number, File>>({});
  const [apercus, setApercus] = useState<Record<number, string>>({});
  const [etatChoisi, setEtatChoisi] = useState('');
  const [note, setNote] = useState('');
  const [batterie, setBatterie] = useState(false);
  const [motifLocal, setMotifLocal] = useState<string | null>(null);
  const [preparation, setPreparation] = useState(false);
  const apercusCourants = useRef(apercus);
  apercusCourants.current = apercus;

  // Les aperçus sont des adresses locales : on les libère en partant.
  useEffect(
    () => () => Object.values(apercusCourants.current).forEach((adresse) => URL.revokeObjectURL(adresse)),
    [],
  );

  function choisir(rang: number, fichier: File | undefined) {
    if (!fichier) return;
    // Hors de la fonction de mise à jour : React peut la rejouer, et une
    // adresse créée deux fois ne serait libérée qu'une fois.
    const precedente = apercusCourants.current[rang];
    if (precedente) URL.revokeObjectURL(precedente);
    const adresse = URL.createObjectURL(fichier);
    setFichiers((avant) => ({ ...avant, [rang]: fichier }));
    setApercus((avant) => ({ ...avant, [rang]: adresse }));
  }

  // L'envoi passe par ici : les photos partent réduites, et elles restent
  // jointes si le serveur refuse.
  async function envoyerLeConstat(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const [motif] = motifsDuConstat({
      rangs: Object.keys(fichiers).map(Number),
      etat: etatChoisi,
      note,
      electrique,
      batterieVerifiee: batterie,
    });
    setMotifLocal(motif ? (textes.motifs[motif] ?? motif) : null);
    if (motif) return;

    setPreparation(true);
    const donnees = new FormData();
    donnees.set('etat', etatChoisi);
    // Une description abandonnée en changeant d'état ne part pas avec le constat.
    donnees.set('note', etatChoisi === 'defaut' ? note : '');
    if (batterie) donnees.set('batterie', 'oui');
    for (const [rang, fichier] of Object.entries(fichiers)) {
      const reduite = await reduire(fichier);
      // Trop lourde, l'envoi entier serait rejeté avant d'atteindre le serveur.
      if (reduite.size > TAILLE_MAXIMALE_D_UNE_PHOTO_DE_CONSTAT) {
        setPreparation(false);
        setMotifLocal(textes.tropLourde);
        return;
      }
      donnees.set(`photo-${rang}`, reduite);
    }
    setPreparation(false);
    startTransition(() => envoyer(donnees));
  }

  const erreur = motifLocal ?? etat.erreur;

  return (
    <form onSubmit={envoyerLeConstat} className="pile">
      <h2 className="titre-section" style={{ marginTop: 0 }}>{textes.photos}</h2>
      <div className="grille-photos">
        {emplacements.map(([rang, titre, requise, libelle]) => (
          <label key={rang} className={apercus[rang] ? 'emplacement-photo remplie' : 'emplacement-photo'}>
            <strong>
              {titre}
              {requise ? null : <small>{textes.facultative}</small>}
            </strong>
            <span className="emplacement-photo-image">
              {apercus[rang] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={apercus[rang]} alt="" />
              ) : (
                <Icone nom="velo" taille={34} strokeWidth={1.4} />
              )}
              <span className="emplacement-photo-bouton" aria-hidden="true">
                <Icone nom={apercus[rang] ? 'coche' : 'photo'} taille={18} />
              </span>
            </span>
            {apercus[rang] ? <span className="lecteur">{textes.ajoutee}</span> : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="lecteur"
              aria-label={libelle}
              aria-required={requise}
              onChange={(e) => choisir(rang, e.currentTarget.files?.[0])}
            />
          </label>
        ))}
      </div>

      <fieldset className="groupe-de-filtres sans-cadre">
        <legend className="titre-section">{textes.etat}</legend>
        <div className="choix-puces">
          {etats.map(([valeur, libelle]) => (
            <label key={valeur} className="puce-choix">
              <input
                type="radio"
                name="etat"
                value={valeur}
                checked={etatChoisi === valeur}
                onChange={() => setEtatChoisi(valeur)}
              />
              {libelle}
            </label>
          ))}
        </div>
      </fieldset>

      {etatChoisi === 'defaut' ? (
        <label className="champ-texte">
          <span>{textes.defaut}</span>
          <textarea
            maxLength={600}
            placeholder={textes.defautExemple}
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
          />
        </label>
      ) : null}

      {electrique ? (
        <label className="check carte">
          <input type="checkbox" checked={batterie} onChange={(e) => setBatterie(e.currentTarget.checked)} />
          <span>{textes.batterie}</span>
        </label>
      ) : null}

      {erreur ? (
        <div className="encart rouge" role="alert">
          <Icone nom="alerte" taille={22} />
          <span>{erreur}</span>
        </div>
      ) : null}

      <button type="submit" className="bouton plein" disabled={enCours || preparation}>
        {enCours || preparation ? textes.envoi : textes.valider}
        <Icone nom="chevron" taille={20} />
      </button>
    </form>
  );
}

/** Deux mille pixels de large suffisent à voir une rayure sur un cadre. */
const LARGEUR_ENVOYEE = 2000;

async function reduire(photo: File): Promise<File> {
  try {
    const image = await createImageBitmap(photo);
    const echelle = Math.min(1, LARGEUR_ENVOYEE / image.width);
    const toile = document.createElement('canvas');
    toile.width = Math.round(image.width * echelle);
    toile.height = Math.round(image.height * echelle);
    toile.getContext('2d')?.drawImage(image, 0, 0, toile.width, toile.height);
    image.close();
    const blob = await new Promise<Blob | null>((resoudre) =>
      toile.toBlob(resoudre, 'image/jpeg', 0.85),
    );
    return blob && blob.size < photo.size
      ? new File([blob], 'constat.jpg', { type: 'image/jpeg' })
      : photo;
  } catch {
    // Un format que le navigateur ne sait pas lire part tel quel : le serveur
    // dira s'il l'accepte.
    return photo;
  }
}
