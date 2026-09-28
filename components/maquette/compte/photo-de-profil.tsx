'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import {
  changerMaPhoto,
  retirerLaPhotoDeProfil,
  type EtatDeLaPhoto,
} from '@/app/(reseau)/(membre)/profil/actions';
import { Icone } from '@/components/app/icone';
import { Confirmation } from '@/components/maquette/confirmation';
import {
  FORMATS_DEMANDES,
  POIDS_MAXIMAL_D_UN_ENVOI,
  reduireUnePhoto,
} from '@/components/app/reduire-une-photo';

const VIERGE: EtatDeLaPhoto = { erreur: null };

/**
 * La photo de profil, en tête du compte : le visage (ou l'initiale), un
 * bouton pour la choisir, un aperçu avant d'enregistrer, et de quoi la
 * retirer. Rien ne part tant qu'on n'a pas confirmé.
 */
export function PhotoDeProfil({
  membreId,
  prenom,
  nomPublic,
  version,
}: {
  membreId: string;
  prenom: string;
  nomPublic: string;
  version: number | null;
}) {
  const [etat, envoyer, enCours] = useActionState(changerMaPhoto, VIERGE);
  const [retrait, retirer, retraitEnCours] = useActionState(
    retirerLaPhotoDeProfil,
    VIERGE,
  );
  const [apercu, setApercu] = useState<string | null>(null);
  // L'aperçu envoyé : une fois enregistré, il cède la place à la photo
  // servie, sans qu'on ait à le retirer à la main.
  const [soumis, setSoumis] = useState<string | null>(null);
  const [refus, setRefus] = useState<string | null>(null);
  const [preparation, setPreparation] = useState(false);
  const fichier = useRef<HTMLInputElement>(null);
  const visage = useRef<HTMLButtonElement>(null);

  useEffect(
    () => () => {
      if (apercu) URL.revokeObjectURL(apercu);
    },
    [apercu],
  );

  async function choisir(evenement: React.ChangeEvent<HTMLInputElement>) {
    const champ = evenement.currentTarget;
    const choisi = champ.files?.[0];
    if (!choisi) return;
    // Refusé tout de suite, avant tout envoi : un fichier qui n'est pas une
    // image.
    if (!choisi.type.startsWith('image/')) {
      setRefus('Choisissez une image : une photo JPEG, PNG ou WebP.');
      annuler();
      return;
    }
    // La photo est allégée ici, puis remise dans le champ : c'est elle que
    // le formulaire envoie, qu'il passe par JavaScript ou non.
    setPreparation(true);
    const allegee = await reduireUnePhoto(choisi, 'profil.jpg');
    setPreparation(false);
    if (allegee.size > POIDS_MAXIMAL_D_UN_ENVOI) {
      setRefus('Cette photo est trop lourde pour être envoyée. Essayez-en une autre, ou une capture de celle-ci.');
      annuler();
      return;
    }
    if (allegee !== choisi) {
      const transfert = new DataTransfer();
      transfert.items.add(allegee);
      champ.files = transfert.files;
    }
    setRefus(null);
    setApercu((precedent) => {
      if (precedent) URL.revokeObjectURL(precedent);
      return URL.createObjectURL(allegee);
    });
  }

  function annuler() {
    if (fichier.current) fichier.current.value = '';
    setApercu(null);
  }

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    setSoumis(apercu);
    startTransition(() => envoyer(donnees));
  }

  const enregistree =
    !enCours && etat.faitLe !== undefined && soumis !== null && soumis === apercu;
  const apercuAffiche = enregistree ? null : apercu;
  const image =
    apercuAffiche ??
    (version ? `/membres/${membreId}/photo?v=${version}` : null);
  const dernierGeste = [etat, retrait]
    .filter((geste) => geste.faitLe !== undefined)
    .sort((a, b) => (b.faitLe ?? 0) - (a.faitLe ?? 0))[0];

  // Après un enregistrement ou un retrait, la page ne navigue plus : on remet
  // le champ à zéro (rechoisir la même photo doit redéclencher le change) et
  // on rend le focus au visage, dont le bouton d'action vient de disparaître.
  const reussiteLe = dernierGeste?.faitLe;
  useEffect(() => {
    if (reussiteLe === undefined) return;
    if (fichier.current) fichier.current.value = '';
    setApercu(null);
    setSoumis(null);
    visage.current?.focus();
  }, [reussiteLe]);

  const occupe = enCours || retraitEnCours;

  return (
    <section className="profil-tete" aria-labelledby="profil-nom">
      {dernierGeste ? (
        <Confirmation
          key={dernierGeste.faitLe}
          texte={
            dernierGeste.geste === 'retiree'
              ? 'Photo retirée.'
              : 'Photo enregistrée.'
          }
        />
      ) : null}
      <form action={envoyer} onSubmit={soumettre} className="profil-photo">
        <button
          ref={visage}
          type="button"
          className="profil-visage"
          onClick={() => fichier.current?.click()}
          disabled={occupe}
          aria-label={
            version || apercuAffiche
              ? 'Changer ma photo de profil'
              : 'Ajouter une photo de profil'
          }
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              width={104}
              height={104}
              onError={() => {
                // Un fichier qui se dit image mais ne se lit pas (un texte
                // renommé en .jpg) : on le dit, et on revient à l'état initial.
                // On ne réagit qu'à l'aperçu affiché : la photo déjà
                // enregistrée n'est plus à corriger.
                if (apercuAffiche) {
                  setRefus('Cette image n’a pas pu être lue. Essayez une autre photo.');
                  annuler();
                }
              }}
            />
          ) : (
            <span aria-hidden="true">{prenom.charAt(0).toUpperCase()}</span>
          )}
          <span className="profil-visage-badge" aria-hidden="true">
            <Icone nom="photo" taille={16} strokeWidth={2.2} />
          </span>
        </button>
        <input
          ref={fichier}
          type="file"
          name="photo"
          accept={FORMATS_DEMANDES}
          className="lecteur"
          // Le bouton du visage ouvre ce champ : il n'a pas à recevoir le
          // focus ni à être annoncé une seconde fois.
          tabIndex={-1}
          aria-hidden="true"
          onChange={choisir}
        />

        <div className="profil-identite">
          <h1 id="profil-nom">{nomPublic}</h1>
          {apercuAffiche ? (
            <div className="profil-actions">
              <button
                type="submit"
                className="primary"
                disabled={enCours || preparation}
              >
                {enCours ? 'Enregistrement…' : 'Enregistrer la photo'}
              </button>
              <button
                type="button"
                className="lien"
                onClick={annuler}
                disabled={enCours}
              >
                Annuler
              </button>
            </div>
          ) : (
            <p>
              {version
                ? 'Votre photo aide les autres membres à vous reconnaître à la porte.'
                : 'Ajoutez une photo : elle aide les autres membres à vous reconnaître à la porte.'}
            </p>
          )}
          {refus ?? etat.erreur ? (
            <p className="profil-erreur" role="alert">
              {refus ?? etat.erreur}
            </p>
          ) : null}
        </div>
      </form>

      {version && !apercuAffiche ? (
        <form
          action={retirer}
          className="profil-retirer"
          onSubmit={(evenement) => {
            if (!window.confirm('Retirer votre photo de profil ?')) {
              evenement.preventDefault();
            }
          }}
        >
          <button type="submit" className="lien" disabled={retraitEnCours}>
            {retraitEnCours ? 'Un instant…' : 'Retirer la photo'}
          </button>
        </form>
      ) : null}
    </section>
  );
}
