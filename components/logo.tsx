/**
 * La marque : un vélo sous un toit.
 *
 * Les deux couleurs du logo lui appartiennent en propre et ne participent pas
 * au code couleur de l’interface (règle 6) : elles ne disent ni « action », ni
 * « vérifié », ni « gardé ». C’est pour cela qu’elles sont écrites en dur ici
 * plutôt que prises dans les variables du système.
 */
export default function Logo({ taille = 22 }: { taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 66 66"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="33" cy="33" r="32" fill="#1C5B85" />
      <path
        d="M14 22 33 12l19 10"
        stroke="#E8A33D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 46a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm22 0a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
        stroke="#fff"
        strokeWidth="2.4"
      />
      <path
        d="M22 38.5h8.5L37 29h-5m5 0h5.5L44 38.5"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
