import type { ReactNode, SVGProps } from 'react';

/**
 * Les pictogrammes de l'application, dessinés au trait comme dans les
 * maquettes. Ils sont décoratifs par défaut : le texte à côté dit la même
 * chose, et un lecteur d'écran n'a pas à le lire deux fois.
 */

const TRACES = {
  accueil: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v11h5v-6h4v6h5V9" />
    </>
  ),
  recherche: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  gardes: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="m9.5 14 2 2 3.5-4" />
    </>
  ),
  messages: <path d="M4 5h16v11H9l-5 4V5Z" />,
  profil: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  demandes: (
    <>
      <path d="M6 3h9l4 4v14H6V3Z" />
      <path d="M9 11h7M9 15h7M9 7h4" />
    </>
  ),
  progression: <path d="M5 20v-6M10 20V10M15 20V6M20 20V3" />,
  cloche: (
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  retour: <path d="m15 5-7 7 7 7" />,
  bouclier: <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />,
  verifie: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  etoile: (
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
  ),
  velo: (
    <>
      <circle cx="6" cy="16" r="3.5" />
      <circle cx="18" cy="16" r="3.5" />
      <path d="M6 16 9.5 9H15l3 7M9.5 9 12 16h-6M14 6h2.5l-1.5 3" />
    </>
  ),
  horloge: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendrier: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  epingle: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  cadenas: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  photo: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  trophee: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8" />
    </>
  ),
  cadeau: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S9 9 12 9Zm0 0c2-4 6-4 6-1.5S15 9 12 9Z" />
    </>
  ),
  telephone: (
    <path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />
  ),
  alerte: (
    <>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v4M12 17v.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </>
  ),
  reglages: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  coeur: (
    <path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20Z" />
  ),
  filtre: <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  coche: <path d="m5 12 5 5 9-10" />,
  croix: <path d="M6 6l12 12M18 6 6 18" />,
  position: <path d="M3 11 21 3l-8 18-2-8-8-2Z" />,
  maison: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  cle: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9M17 6l2 2M15 8l2 2" />
    </>
  ),
  deconnexion: (
    <>
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4M18 12H9" />
    </>
  ),
  corbeille: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </>
  ),
  aide: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.7M12 17v.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h9l4 4v14H6V3Z" />
      <path d="M15 3v4h4" />
    </>
  ),
  envoyer: <path d="M4 12 20 4l-4 16-4-6-8-2Z" />,
  enveloppe: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  utilisateurs: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.2 2.5 3.8 5.5" />
    </>
  ),
  batterie: (
    <>
      <rect x="7" y="4" width="10" height="17" rx="2" />
      <path d="M10 2h4M10 14h4M10 10h4" />
    </>
  ),
  oeil: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  drapeau: <path d="M5 21V4h11l-2 4 2 4H5" />,
  balance: (
    <>
      <path d="M12 4v16M8 20h8M5 7h14" />
      <path d="m5 7-3 7a3 3 0 0 0 6 0L5 7ZM19 7l-3 7a3 3 0 0 0 6 0l-3-7Z" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type NomDIcone = keyof typeof TRACES;

export function Icone({
  nom,
  taille = 22,
  plein = false,
  ...props
}: {
  nom: NomDIcone;
  taille?: number;
  /** Un pictogramme rempli : l'onglet courant, une étoile donnée. */
  plein?: boolean;
} & Omit<SVGProps<SVGSVGElement>, 'children'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={taille}
      height={taille}
      fill={plein ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {TRACES[nom]}
    </svg>
  );
}
