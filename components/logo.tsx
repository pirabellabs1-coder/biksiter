/**
 * La marque : un vélo sous un toit.
 *
 * Le trait prend la couleur du texte qui l'entoure. Le logo vit sur deux fonds
 * — clair dans une page, vert sombre dans l'en-tête et le pied — et un vert
 * écrit en dur ici disparaîtrait sur le second. C'est donc la règle CSS qui
 * décide, et le composant n'a plus d'avis sur la question.
 */

export default function Logo({ taille = 26 }: { taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M14 46 L50 16 L86 46 V86 H14 Z"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="64" r="12" strokeWidth="6" />
      <circle cx="66" cy="64" r="12" strokeWidth="6" />
      <path
        d="M36 64 H50 L60 46 h-7 m7 0 h9 l7 18"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
