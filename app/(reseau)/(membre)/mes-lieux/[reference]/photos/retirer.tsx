'use client';

import { Icone } from '@/components/app/icone';

/**
 * Retirer une photo du lieu. La photo disparaît de la fiche publique : on le
 * fait confirmer, un appui malheureux ne doit pas la perdre.
 */
export function RetirerLaPhoto({
  action,
  reference,
  rang,
  libelle,
  confirmation,
}: {
  action: (donnees: FormData) => Promise<void>;
  reference: string;
  rang: number;
  libelle: string;
  confirmation: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(evenement) => {
        if (!window.confirm(confirmation)) evenement.preventDefault();
      }}
    >
      <input type="hidden" name="reference" value={reference} />
      <input type="hidden" name="rang" value={rang} />
      <button type="submit" className="bouton discret texte-rouge">
        <Icone nom="corbeille" taille={18} />
        {libelle}
      </button>
    </form>
  );
}
