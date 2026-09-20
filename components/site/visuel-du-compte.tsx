import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { Logo } from '@/components/app/logo';
import type { Textes } from '@/lib/i18n/langue';

/**
 * Le volet gauche des écrans du compte, sur ordinateur : la marque, une
 * illustration et trois garanties. Une illustration plutôt qu'une photo : les
 * visages des maquettes ne sont pas des membres, et on n'en invente pas.
 */
export function VisuelDuCompte({ p }: { p: Textes['p'] }) {
  const garanties = [
    p('Entièrement gratuit'),
    p('Membres vérifiés par l’association'),
    p('Adresse exacte après acceptation'),
  ];

  return (
    <aside className="compte-visuel">
      <Link href="/" className="compte-visuel-marque">
        <span className="compte-visuel-logo">
          <Logo taille={34} />
        </span>
        Bike Sitters
      </Link>

      <IllustrationDuCompte />

      <div className="compte-visuel-texte">
        <p className="compte-visuel-titre">
          {p('Votre vélo n’est jamais seul.')}
        </p>
        <p className="compte-visuel-chapeau">
          {p('Un espace fermé. Une personne présente.')}
        </p>
        <ul className="compte-visuel-garanties">
          {garanties.map((garantie) => (
            <li key={garantie}>
              <span className="compte-visuel-coche" aria-hidden="true">
                <Icone nom="coche" taille={14} strokeWidth={3} />
              </span>
              {garantie}
            </li>
          ))}
        </ul>
      </div>

      <p className="compte-visuel-pied">
        Bike Sitters · {p('association sans but lucratif')} · Bruxelles
      </p>
    </aside>
  );
}

/**
 * Un garage ouvert sur un vélo à l'abri, et le bouclier de la vérification.
 * Le bleu y garde son sens : ce qui protège.
 */
function IllustrationDuCompte() {
  return (
    <svg
      className="compte-visuel-illustration"
      viewBox="0 0 480 360"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="240" cy="200" r="150" fill="rgba(255,255,255,0.04)" />
      <circle cx="240" cy="200" r="104" fill="rgba(255,255,255,0.04)" />
      <path
        d="M40 322H440"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M110 176 240 72l130 104v146H110V176Z"
        fill="#0e3a1d"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <rect x="156" y="196" width="168" height="126" rx="6" fill="#082512" />
      <g stroke="#96cfa9" strokeWidth="5" strokeLinecap="round">
        <path d="M164 208h152" />
        <path d="M164 224h152" />
        <path d="M164 240h152" />
      </g>

      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="198" cy="292" r="21" />
        <circle cx="282" cy="292" r="21" />
        <path d="M198 292l22-36h40l22 36M220 256l18 36h-40M252 246h14l-6 10" />
        <path d="M228 246h-14" />
      </g>

      <path
        d="M372 214l40 15v30c0 25-17 43-40 52-23-9-40-27-40-52v-30l40-15Z"
        fill="#1677e8"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M356 262l11 11 22-24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
