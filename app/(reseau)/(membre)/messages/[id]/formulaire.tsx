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
  FORMATS_DEMANDES,
  POIDS_MAXIMAL_D_UN_ENVOI,
  reduireUnePhoto,
} from '@/components/app/reduire-une-photo';

import { envoyerUnMessage, type EtatDuMessage } from './actions';

const VIDE: EtatDuMessage = { erreur: null, envoye: 0 };

export function FormulaireDeMessage({
  id,
  textes,
}: {
  id: string;
  textes: {
    placeholder: string;
    envoyer: string;
    libelle: string;
    joindre: string;
    retirer: string;
  };
}) {
  const [etat, envoyer, enCours] = useActionState(
    envoyerUnMessage.bind(null, id),
    VIDE,
  );
  // Le texte est tenu ici : un envoi refusé ne doit pas effacer le message.
  const [corps, setCorps] = useState('');
  // L'aperçu de la photo choisie, le temps de l'envoyer.
  const [apercu, setApercu] = useState<string | null>(null);
  // Une photo refusée avant l'envoi (type, taille) : dit tout de suite.
  const [refus, setRefus] = useState<string | null>(null);
  // Le temps d'alléger la photo choisie : l'envoi attend qu'elle soit prête.
  const [preparation, setPreparation] = useState(false);
  const champ = useRef<HTMLInputElement>(null);
  const fichier = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (etat.envoye === 0) return;
    setCorps('');
    viderLaPhoto();
    champ.current?.focus();
  }, [etat.envoye]);

  // L'URL d'aperçu est libérée quand elle change ou disparaît.
  useEffect(() => {
    return () => {
      if (apercu) URL.revokeObjectURL(apercu);
    };
  }, [apercu]);

  async function choisirLaPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const champPhoto = e.currentTarget;
    const f = champPhoto.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setRefus('Joignez une image : une photo JPEG, PNG ou WebP.');
      viderLaPhoto();
      return;
    }
    // Allégée ici, puis remise dans le champ : c'est elle qui part.
    setPreparation(true);
    const allegee = await reduireUnePhoto(f, 'message.jpg');
    setPreparation(false);
    if (allegee.size > POIDS_MAXIMAL_D_UN_ENVOI) {
      setRefus('Cette photo est trop lourde pour être envoyée. Essayez-en une autre.');
      viderLaPhoto();
      return;
    }
    if (allegee !== f) {
      const transfert = new DataTransfer();
      transfert.items.add(allegee);
      champPhoto.files = transfert.files;
    }
    setRefus(null);
    setApercu((precedent) => {
      if (precedent) URL.revokeObjectURL(precedent);
      return URL.createObjectURL(allegee);
    });
  }

  function viderLaPhoto() {
    if (fichier.current) fichier.current.value = '';
    setApercu((precedent) => {
      if (precedent) URL.revokeObjectURL(precedent);
      return null;
    });
  }

  const rienASoumettre = corps.trim() === '' && apercu === null;

  // L'envoi ne passe pas par la réinitialisation automatique du formulaire :
  // après une erreur, React vidait le fichier mais laissait la vignette, et
  // le message suivant partait sans la photo qu'on voyait encore.
  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (rienASoumettre) return;
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  const erreur = refus ?? etat.erreur;

  return (
    <form
      action={envoyer}
      onSubmit={soumettre}
      className="barre-d-action compositeur"
    >
      {erreur ? (
        <p className="petit texte-rouge" role="alert">
          {erreur}
        </p>
      ) : null}
      {/* Une photo met quelques secondes à partir : on le dit, pour que
          personne ne l'envoie deux fois. */}
      <p className="compositeur-etat" role="status">
        {enCours ? (apercu ? 'Envoi de la photo…' : 'Envoi…') : ''}
      </p>

      {apercu ? (
        <div className="compositeur-apercu" aria-busy={enCours || undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={apercu} alt="" />
          {/* Pendant l'envoi, la photo ne se retire plus : la croix
              disparaît plutôt que de promettre un geste sans effet. */}
          {enCours ? null : (
            <button
              type="button"
              className="compositeur-retirer"
              onClick={viderLaPhoto}
              aria-label={textes.retirer}
            >
              <Icone nom="croix" taille={16} />
            </button>
          )}
        </div>
      ) : null}

      <div className="compositeur-ligne">
        <label htmlFor="message-a-envoyer" className="lecteur">
          {textes.libelle}
        </label>

        <button
          type="button"
          className="compositeur-joindre"
          onClick={() => fichier.current?.click()}
          // Pendant l'envoi, joindre une photo l'effacerait sans rien dire :
          // l'effet qui vide le compositeur après l'envoi la supprimerait.
          disabled={enCours}
          aria-label={textes.joindre}
        >
          <Icone nom="photo" taille={22} />
        </button>
        <input
          ref={fichier}
          type="file"
          name="photo"
          accept={FORMATS_DEMANDES}
          className="lecteur"
          tabIndex={-1}
          aria-hidden="true"
          onChange={choisirLaPhoto}
        />

        <input
          ref={champ}
          id="message-a-envoyer"
          name="corps"
          maxLength={2000}
          placeholder={textes.placeholder}
          autoComplete="off"
          value={corps}
          onChange={(e) => setCorps(e.currentTarget.value)}
        />
        <button
          type="submit"
          className="bouton-envoyer"
          disabled={enCours || preparation || rienASoumettre}
          aria-label={textes.envoyer}
        >
          <Icone nom="envoyer" taille={22} />
        </button>
      </div>
    </form>
  );
}
