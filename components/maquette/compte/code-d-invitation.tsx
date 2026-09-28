'use client';

import { useEffect, useState } from 'react';

import { Icone } from '@/components/app/icone';
import { copierLeTexte } from '@/components/app/presse-papiers';

import { Avertisseur, useAvertissement } from './avertisseur';

/**
 * Un code d'invitation et son lien, avec de quoi les transmettre.
 *
 * Le lien est la façon la plus simple d'inviter : il ouvre l'inscription avec
 * le code déjà rempli. « Partager » ouvre la feuille de partage du téléphone
 * quand il en a une ; sinon, le lien est copié. Si la copie est refusée, le
 * lien s'affiche, sélectionnable, pour être recopié à la main.
 */
export function CodeDInvitation({
  code,
  lien,
  expireLe,
  principal = false,
}: {
  code: string;
  lien: string;
  expireLe: string;
  principal?: boolean;
}) {
  const [message, avertir] = useAvertissement();
  const [partageDisponible, setPartageDisponible] = useState(false);
  const [aRecopier, setARecopier] = useState<string | null>(null);

  useEffect(() => {
    setPartageDisponible(typeof navigator.share === 'function');
  }, []);

  async function copier(texte: string, confirmation: string) {
    if (await copierLeTexte(texte)) {
      setARecopier(null);
      avertir(confirmation);
    } else {
      setARecopier(texte);
      avertir(
        'La copie n’est pas possible ici : sélectionnez le texte ci-dessous.',
      );
    }
  }

  async function partager() {
    try {
      await navigator.share({
        title: 'Rejoindre Bike Sitters',
        text: `Je t’invite à rejoindre Bike Sitters, le réseau d’entraide entre cyclistes à Bruxelles. Ton code : ${code}`,
        url: lien,
      });
    } catch (erreur) {
      // Un partage abandonné n'est pas une erreur ; un partage impossible,
      // si : on copie le lien à la place.
      if (erreur instanceof DOMException && erreur.name === 'AbortError')
        return;
      await copier(lien, 'Lien d’invitation copié');
    }
  }

  return (
    <div
      className={principal ? 'invitation invitation-principale' : 'invitation'}
    >
      <div className="invitation-code">
        <span className="invitation-libelle">Code</span>
        <b>{code}</b>
        <span className="invitation-validite">Valable jusqu’au {expireLe}</span>
      </div>
      {principal ? (
        <div className="invitation-actions">
          {partageDisponible ? (
            <button type="button" className="primary" onClick={partager}>
              <Icone nom="envoyer" taille={18} strokeWidth={2.2} />
              Partager
            </button>
          ) : null}
          <button
            type="button"
            className={partageDisponible ? 'outline' : 'primary'}
            onClick={() => copier(lien, 'Lien d’invitation copié')}
          >
            Copier le lien
          </button>
          <button
            type="button"
            className="outline"
            onClick={() => copier(code, `Code ${code} copié`)}
          >
            Copier le code
          </button>
        </div>
      ) : (
        // Les codes de réserve tiennent sur une ligne, avec une seule action :
        // cinq cartes à trois boutons feraient un mur de boutons.
        <button
          type="button"
          className="outline petit"
          onClick={() => copier(lien, 'Lien d’invitation copié')}
        >
          Copier le lien
        </button>
      )}
      {aRecopier ? (
        <input
          className="invitation-a-recopier"
          value={aRecopier}
          readOnly
          aria-label="Texte à copier"
          onFocus={(evenement) => evenement.currentTarget.select()}
        />
      ) : null}
      <Avertisseur message={message} />
    </div>
  );
}
