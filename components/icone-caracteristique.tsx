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
  | 'prive';

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
