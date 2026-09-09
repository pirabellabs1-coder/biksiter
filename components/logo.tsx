/**
 * La marque : un vélo sous un toit.
 *
 * La couleur du logo lui appartient en propre et ne participe pas au code
 * couleur de l'interface (règle 6) : elle ne dit ni « action », ni « vérifié »,
 * ni « gardé ». C'est pour cela qu'elle est écrite en dur ici plutôt que prise
 * dans les variables du système — un jeton sémantique détourné pour une marque
 * finirait par brouiller les deux.
 */
const VERT_DE_LA_MARQUE = '#007D38';

export default function Logo({ taille = 26 }: { taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      fill="none"
      stroke={VERT_DE_LA_MARQUE}
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
