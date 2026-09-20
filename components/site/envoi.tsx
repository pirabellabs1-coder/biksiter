'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * L'état d'un envoi, partagé entre un formulaire et son bouton.
 *
 * Sur un écran de formulaire, le bouton vit en bas de l'écran, hors du
 * `<form>` : il ne peut donc pas lire l'état d'envoi lui-même. Le formulaire
 * le signale ici, et le bouton se désactive pendant l'envoi puis disparaît
 * une fois le formulaire remplacé par sa confirmation.
 */

type Etat = { enCours: boolean; termine: boolean };
type Suivi = Etat & { signaler: (etat: Etat) => void };

const Contexte = createContext<Suivi>({
  enCours: false,
  termine: false,
  signaler: () => {},
});

export function SuiviDEnvoi({ children }: { children: React.ReactNode }) {
  const [etat, signaler] = useState<Etat>({ enCours: false, termine: false });
  const valeur = useMemo(() => ({ ...etat, signaler }), [etat]);
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

/** À appeler dans le formulaire, avec l'état de son action. */
export function useSignalerLEnvoi(enCours: boolean, termine = false) {
  const { signaler } = useContext(Contexte);
  useEffect(() => {
    signaler({ enCours, termine });
  }, [enCours, termine, signaler]);
}

export function BoutonDEnvoi({
  formulaire,
  enCours: libelleEnCours,
  className = 'btn primary',
  children,
}: {
  formulaire: string;
  enCours: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { enCours, termine } = useContext(Contexte);
  if (termine) {
    return null;
  }
  return (
    <button
      type="submit"
      form={formulaire}
      className={className}
      disabled={enCours}
      aria-busy={enCours || undefined}
    >
      {enCours ? libelleEnCours : children}
    </button>
  );
}
