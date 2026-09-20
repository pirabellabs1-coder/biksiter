'use client';

import Link from 'next/link';
import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
} from 'react';

import { Icone } from '@/components/app/icone';

import { EncartDErreurs } from '../../ecran-de-compte';
import { envoyerLaPiece, type EtatDeLaPiece } from './actions';

const VIERGE: EtatDeLaPiece = { statut: 'vierge' };

export function FormulaireDeLaPiece({
  suite,
  libelles,
}: {
  /** Où mène « Le faire plus tard », et la suite après l'envoi. */
  suite: string;
  libelles: {
    photographier: string;
    choisi: string;
    documentSupprime: string;
    majeur: string;
    envoyer: string;
    enCours: string;
    plusTard: string;
    continuer: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(envoyerLaPiece, VIERGE);
  const [nomDuFichier, setNomDuFichier] = useState<string | null>(null);

  // L'envoi passe par ici plutôt que par le formulaire : React viderait sinon
  // le champ du fichier après un refus, alors que l'écran afficherait encore
  // le nom du document choisi. La pièce et la case cochée restent jointes.
  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  if (etat.statut === 'envoyee') {
    return (
      <div className="pile">
        <div className="encart" role="status">
          <Icone nom="coche" taille={20} />
          <span>{etat.message}</span>
        </div>
        <Link href={suite} className="bouton plein">
          {libelles.continuer}
          <Icone nom="chevron" taille={20} />
        </Link>
      </div>
    );
  }

  return (
    <form action={envoyer} onSubmit={soumettre} noValidate className="pile">
      <label className="depot-photos" htmlFor="piece-fichier">
        <Icone nom={nomDuFichier ? 'coche' : 'document'} taille={34} />
        <span className="depot-photos-texte" style={{ overflowWrap: 'anywhere' }}>
          {nomDuFichier
            ? libelles.choisi.replace('{nom}', nomDuFichier)
            : libelles.photographier}
        </span>
        <input
          id="piece-fichier"
          name="piece"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="lecteur"
          onChange={(evenement) =>
            setNomDuFichier(evenement.currentTarget.files?.[0]?.name ?? null)
          }
        />
      </label>

      <div className="encart bleu">
        <Icone nom="cadenas" taille={20} />
        <span>{libelles.documentSupprime}</span>
      </div>

      <label className="check" style={{ margin: '14px 0 0' }}>
        <input type="checkbox" name="majeur" value="oui" />
        <span style={{ fontSize: 15, lineHeight: 1.45 }}>{libelles.majeur}</span>
      </label>

      {etat.statut === 'erreur' ? (
        <EncartDErreurs erreurs={[etat.erreur]} />
      ) : null}

      <button
        type="submit"
        className="bouton plein"
        disabled={enCours}
        aria-busy={enCours || undefined}
      >
        {enCours ? libelles.enCours : libelles.envoyer}
      </button>
      <Link href={suite} className="bouton discret">
        {libelles.plusTard}
      </Link>
    </form>
  );
}
