/**
 * Les pictogrammes des caractéristiques d'un emplacement.
 *
 * Un trait, pas de remplissage, la couleur du texte qui les entoure : ils
 * accompagnent une étiquette, ils ne la remplacent jamais. C'est ce qui permet
 * de ne pas dépendre d'eux — un lecteur d'écran ne lit que le mot.
 */

export type Pictogramme =
  | 'fermeture'
  | 'abri'
  | 'ancrage'
  | 'acces'
  | 'capacite'
  | 'prive'
  | 'compte'
  | 'carte'
  | 'message'
  | 'code'
  | 'identite'
  | 'journal'
  | 'tableau'
  | 'calendrier'
  | 'etiquette'
  | 'sortie';

const TRACES: Record<Pictogramme, React.ReactNode> = {
  fermeture: (
    <>
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </>
  ),
  abri: (
    <>
      <path d="M3 9.5 10 4l7 5.5V17H3z" />
      <path d="M7.5 17v-4h5v4" />
    </>
  ),
  ancrage: (
    <>
      <circle cx="10" cy="5" r="2" />
      <path d="M10 7v9" />
      <path d="M5 12a5 5 0 0 0 10 0" />
    </>
  ),
  acces: (
    <>
      <path d="M3 16.5h14" />
      <path d="M5.5 16.5V11l4.5-3.5L14.5 11v5.5" />
    </>
  ),
  capacite: (
    <>
      <circle cx="5.5" cy="13" r="3" />
      <circle cx="14.5" cy="13" r="3" />
      <path d="M5.5 13h3.5l2.5-4.5H9m2.5 0h2.5l1 4.5" />
    </>
  ),
  prive: (
    <>
      <path d="M4 17V8.5L10 4l6 4.5V17" />
      <path d="M8 17v-4.5h4V17" />
    </>
  ),
  compte: (
    <>
      <rect x="3" y="4.5" width="14" height="11" rx="2" />
      <circle cx="7.6" cy="9" r="1.8" />
      <path d="M4.9 13.2a2.7 2.7 0 0 1 5.4 0" />
      <path d="M12.4 8.4h2.8M12.4 11.4h2.8" />
    </>
  ),
  carte: (
    <>
      <path d="M10 17.2s5.2-4.8 5.2-8.7a5.2 5.2 0 0 0-10.4 0c0 3.9 5.2 8.7 5.2 8.7Z" />
      <circle cx="10" cy="8.4" r="1.9" />
    </>
  ),
  message: (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <path d="m3.9 6.3 6.1 4.5 6.1-4.5" />
    </>
  ),
  code: (
    <>
      <rect x="4.5" y="3" width="11" height="14" rx="2" />
      <circle cx="8" cy="8" r="0.9" />
      <circle cx="12" cy="8" r="0.9" />
      <circle cx="8" cy="11.5" r="0.9" />
      <circle cx="12" cy="11.5" r="0.9" />
      <path d="M8.5 14.6h3" />
    </>
  ),
  identite: (
    <>
      <path d="M10 3 4.2 5.4v4.1c0 3.4 2.3 5.9 5.8 7.2 3.5-1.3 5.8-3.8 5.8-7.2V5.4L10 3Z" />
      <path d="m7.5 9.9 1.9 1.9 3.3-3.6" />
    </>
  ),
  journal: (
    <>
      <rect x="4" y="3" width="12" height="14" rx="2" />
      <path d="M7 7.2h6M7 10.2h6M7 13.2h3.2" />
    </>
  ),
  tableau: (
    <>
      <rect x="3" y="3" width="6.2" height="6.2" rx="1.6" />
      <rect x="10.8" y="3" width="6.2" height="6.2" rx="1.6" />
      <rect x="3" y="10.8" width="6.2" height="6.2" rx="1.6" />
      <rect x="10.8" y="10.8" width="6.2" height="6.2" rx="1.6" />
    </>
  ),
  calendrier: (
    <>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
      <path d="M3 8.4h14M6.8 2.8v3.2M13.2 2.8v3.2" />
    </>
  ),
  etiquette: (
    <>
      <path d="M10.4 3H16a1 1 0 0 1 1 1v5.6a2 2 0 0 1-.6 1.4l-5.4 5.4a2 2 0 0 1-2.8 0l-4.6-4.6a2 2 0 0 1 0-2.8L9 3.6a2 2 0 0 1 1.4-.6Z" />
      <circle cx="13.4" cy="6.6" r="1.2" />
    </>
  ),
  sortie: (
    <>
      <path d="M12 4.5H15a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
      <path d="M8.6 13.4 4.2 10l4.4-3.4M4.6 10h7.6" />
    </>
  ),
};

export default function IconeCaracteristique({
  pictogramme,
}: {
  pictogramme: Pictogramme;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {TRACES[pictogramme]}
    </svg>
  );
}
