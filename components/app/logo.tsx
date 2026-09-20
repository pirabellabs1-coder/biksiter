/**
 * La marque : une maison qui abrite un vélo, et le bouclier bleu de la
 * vérification. Le bleu y dit la même chose que partout ailleurs : protégé.
 */
export function Logo({ taille = 40 }: { taille?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={taille}
      height={taille}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9 28 32 8l23 20v24a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V28Z"
        fill="#fff"
        stroke="#017628"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <g
        fill="none"
        stroke="#017628"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="22" cy="38" r="6" />
        <circle cx="42" cy="38" r="6" />
        <path d="M22 38 27.5 29H37l5 9M27.5 29l4.5 9h-10M35 25h3.5l-1.5 4" />
        <path d="M26 46.5c3.5 2.5 8.5 2.5 12 0" />
      </g>
      <path
        d="M51 41.5 59 44.5v6c0 5-3.4 8.6-8 10.3-4.6-1.7-8-5.3-8-10.3v-6l8-3Z"
        fill="#1677E8"
        stroke="#fff"
        strokeWidth="2"
      />
      <rect x="47.5" y="50" width="7" height="6" rx="1.2" fill="#fff" />
      <path
        d="M49 50v-1.6a2 2 0 0 1 4 0V50"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
      />
    </svg>
  );
}
