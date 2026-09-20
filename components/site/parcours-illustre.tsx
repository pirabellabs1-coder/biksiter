'use client';

import { animate, stagger, svg } from 'animejs';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Le parcours illustré : six scènes qui racontent, l'une après l'autre, la
 * remise d'un vélo entre cyclistes.
 *
 * Sur ordinateur (à partir de 1200 px), les scènes forment une bande dessinée
 * en zigzag : trois en haut, trois en bas, reliées par une piste en pointillé
 * qui se dessine au scroll (anime.js) ; les personnages entrent avec un
 * léger décalage. Sur écran plus étroit, la bande se replie en grille de deux
 * puis d'une colonne, et les animations restent — plus courtes, plus douces.
 * `prefers-reduced-motion` désactive tout : les scènes s'affichent nettes.
 */
export type EtapeIllustree = { titre: string; texte: string };

export function ParcoursIllustre({ etapes }: { etapes: EtapeIllustree[] }) {
  const conteneur = useRef<HTMLDivElement | null>(null);
  const piste = useRef<SVGPathElement | null>(null);
  const dejaJoue = useRef(false);

  useEffect(() => {
    if (!conteneur.current || dejaJoue.current) return;
    const reduit =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduit) {
      conteneur.current
        .querySelectorAll<HTMLElement>('.zig-scene')
        .forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      if (piste.current) {
        piste.current.style.strokeDashoffset = '0';
      }
      dejaJoue.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting || dejaJoue.current) continue;
          dejaJoue.current = true;
          observer.disconnect();

          // Les personnages entrent d'un demi-mouvement, avec un stagger.
          animate('.zig-scene', {
            opacity: [0, 1],
            translateY: [24, 0],
            duration: 720,
            ease: 'out(3)',
            delay: stagger(120),
          });

          // La piste se dessine en même temps, du premier au dernier point.
          if (piste.current) {
            animate(svg.createDrawable(piste.current), {
              draw: ['0 0', '0 1'],
              duration: 1400,
              ease: 'inOutQuad',
            });
          }

          // Petits éléments qui pulsent dans chaque scène (téléphone,
          // épingle, écusson) : un souffle discret, pas une distraction.
          animate('.zig-pulse', {
            scale: [
              { to: 1.06, duration: 800, ease: 'inOutQuad' },
              { to: 1, duration: 800, ease: 'inOutQuad' },
            ],
            delay: stagger(200, { start: 800 }),
            loop: true,
          });
        }
      },
      { rootMargin: '-80px 0px', threshold: 0.12 },
    );

    observer.observe(conteneur.current);
    return () => observer.disconnect();
  }, []);

  const illustrations: ReactNode[] = [
    <SceneCherchez key="1" />,
    <SceneChoisissez key="2" />,
    <SceneDemandez key="3" />,
    <SceneDeposez key="4" />,
    <SceneProfitez key="5" />,
    <SceneReprenez key="6" />,
  ];

  return (
    <div className="parcours-zig" ref={conteneur}>
      {/* La piste en pointillé qui coule sous les scènes. */}
      <svg
        className="parcours-zig-piste"
        viewBox="0 0 1200 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={piste}
          d="M60 100 C 180 60, 260 40, 380 100 S 580 180, 700 100 S 900 20, 1020 100 S 1160 160, 1180 120"
          fill="none"
          stroke="var(--trust)"
          strokeWidth="2"
          strokeDasharray="5 8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.55"
        />
      </svg>

      <ol className="parcours-zig-liste">
        {etapes.map(({ titre, texte }, rang) => (
          <li
            key={titre}
            className={`zig-scene zig-scene-${rang + 1}`}
            data-parite={rang % 2 === 0 ? 'haut' : 'bas'}
          >
            <div className="zig-scene-illustration">{illustrations[rang]}</div>
            <div className="zig-scene-legende">
              <span className="zig-scene-numero" aria-hidden="true">
                <span>{String(rang + 1).padStart(2, '0')}</span>
              </span>
              <h3>{titre}</h3>
              <p>{texte}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* --- Palette et personnage de base -----------------------------------------
   Les six scènes partagent une palette (vert marque, bleu vérification,
   neutre chaud) et un personnage stylisé — corps rond, tête ronde, cheveux
   variés. Aucune photo, aucune ressemblance : c'est une illustration.
   ------------------------------------------------------------------------- */

const VERT = '#017628';
const VERT_CLAIR = '#e8f5ec';
const BLEU = '#1677e8';
const OMBRE = '#0b190f';
const PEAU = '#f6d3b3';
const PEAU_2 = '#e0b48a';
const HABIT = '#017628';
const HABIT_2 = '#1a3d24';
const CHEVEUX_A = '#3b2418';
const CHEVEUX_B = '#8a5a2b';
const FOND_CHAUD = '#fbf7ef';

type Personnage = {
  x: number;
  y: number;
  peau: string;
  cheveux: string;
  cheveuxForme?: 'court' | 'longs' | 'queue';
  habit: string;
  regarde?: 'gauche' | 'droite' | 'face';
};

function Personnage({
  x,
  y,
  peau,
  cheveux,
  cheveuxForme = 'court',
  habit,
  regarde = 'face',
}: Personnage) {
  const oeilDx = regarde === 'gauche' ? -1.5 : regarde === 'droite' ? 1.5 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Torse : forme douce, épaules arrondies. */}
      <path
        d="M-24 42 C-24 20 -18 8 0 8 C18 8 24 20 24 42 L24 60 L-24 60 Z"
        fill={habit}
        stroke={OMBRE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Encolure. */}
      <path d="M-8 12 Q0 18 8 12" fill="none" stroke={OMBRE} strokeWidth="1.2" />
      {/* Cou. */}
      <rect x="-6" y="-4" width="12" height="14" rx="4" fill={peau} stroke={OMBRE} strokeWidth="1.2" />
      {/* Tête. */}
      <circle cx="0" cy="-14" r="16" fill={peau} stroke={OMBRE} strokeWidth="1.5" />
      {/* Yeux. */}
      <circle cx={-5 + oeilDx} cy="-15" r="1.6" fill={OMBRE} />
      <circle cx={5 + oeilDx} cy="-15" r="1.6" fill={OMBRE} />
      {/* Bouche. */}
      <path d="M-3 -8 Q0 -5 3 -8" fill="none" stroke={OMBRE} strokeWidth="1.3" strokeLinecap="round" />
      {/* Cheveux. */}
      {cheveuxForme === 'court' ? (
        <path
          d="M-16 -18 Q-14 -30 0 -30 Q14 -30 16 -18 Q10 -22 0 -22 Q-10 -22 -16 -18 Z"
          fill={cheveux}
          stroke={OMBRE}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      ) : cheveuxForme === 'longs' ? (
        <>
          <path
            d="M-16 -18 Q-18 -32 0 -32 Q18 -32 16 -18 L18 4 L14 6 L12 -14 Q0 -20 -12 -14 L-14 6 L-18 4 Z"
            fill={cheveux}
            stroke={OMBRE}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M-16 -18 Q-14 -30 0 -30 Q14 -30 16 -18 Q10 -22 0 -22 Q-10 -22 -16 -18 Z"
            fill={cheveux}
            stroke={OMBRE}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M14 -20 Q22 -14 20 -4 Q18 2 14 2 Z"
            fill={cheveux}
            stroke={OMBRE}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </>
      )}
    </g>
  );
}

function Velo({
  x,
  y,
  echelle = 1,
}: {
  x: number;
  y: number;
  echelle?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${echelle})`} fill="none" stroke={OMBRE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="30" r="20" />
      <circle cx="60" cy="30" r="20" />
      <path d="M0 30 L28 -8 L60 30 M28 -8 L44 -8" />
      <path d="M28 -8 L34 -18 L46 -18" />
      <path d="M0 30 L20 6" />
      {/* Rayons vite fait pour donner du relief. */}
      <line x1="-14" y1="30" x2="14" y2="30" opacity="0.35" />
      <line x1="46" y1="30" x2="74" y2="30" opacity="0.35" />
    </g>
  );
}

/* --- Scène 1 : Cherchez ------------------------------------------------- */

function SceneCherchez() {
  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="320" height="260" fill={VERT_CLAIR} rx="16" />
      {/* Sol. */}
      <path d="M0 216 Q160 200 320 216 L320 260 L0 260 Z" fill="#d9ecd9" />
      <Personnage x={112} y={148} peau={PEAU} cheveux={CHEVEUX_A} cheveuxForme="queue" habit={HABIT} regarde="droite" />
      {/* Téléphone tenu devant. */}
      <g transform="translate(150 168)" className="zig-pulse" style={{ transformOrigin: '178px 210px' }}>
        <rect x="0" y="0" width="52" height="80" rx="8" fill="#fff" stroke={OMBRE} strokeWidth="1.8" />
        <rect x="4" y="6" width="44" height="66" rx="4" fill={FOND_CHAUD} />
        {/* Traits de carte. */}
        <path d="M6 20 Q18 12 30 18 T46 14" stroke={VERT} strokeWidth="1.2" fill="none" opacity="0.6" />
        <path d="M8 38 Q22 30 34 40 T48 46" stroke={VERT} strokeWidth="1.2" fill="none" opacity="0.6" />
        <path d="M10 60 Q22 54 32 64" stroke={VERT} strokeWidth="1.2" fill="none" opacity="0.6" />
        {/* Épingle qui pulse. */}
        <g transform="translate(20 26)">
          <path d="M0 0 C0 -8 12 -8 12 0 C12 8 6 14 6 14 C6 14 0 8 0 0 Z" fill={VERT} stroke={OMBRE} strokeWidth="1.2" />
          <circle cx="6" cy="0" r="2.4" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

/* --- Scène 2 : Choisissez ----------------------------------------------- */

function SceneChoisissez() {
  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="320" height="260" fill={FOND_CHAUD} rx="16" />
      <path d="M0 216 Q160 200 320 216 L320 260 L0 260 Z" fill="#efe6ce" />
      <Personnage x={72} y={148} peau={PEAU_2} cheveux={CHEVEUX_B} cheveuxForme="court" habit={HABIT_2} regarde="droite" />
      {/* Trois fiches de bike sitters. */}
      <g transform="translate(140 88)">
        {[0, 42, 84].map((y, i) => (
          <g key={i} transform={`translate(${i * 6} ${y})`}>
            <rect x="0" y="0" width="160" height="38" rx="8" fill="#fff" stroke={OMBRE} strokeWidth="1.5" />
            <circle cx="20" cy="19" r="10" fill={VERT_CLAIR} stroke={VERT} strokeWidth="1.4" />
            <rect x="38" y="10" width="70" height="6" rx="3" fill={OMBRE} opacity="0.85" />
            <rect x="38" y="22" width="46" height="4.5" rx="2.3" fill={OMBRE} opacity="0.35" />
            {/* Petite étoile de note. */}
            <g transform="translate(122 15)">
              <path d="M6 0 L7.5 4 L12 4.4 L8.4 7.2 L9.6 11.4 L6 9 L2.4 11.4 L3.6 7.2 L0 4.4 L4.5 4 Z" fill="#f0b400" />
            </g>
          </g>
        ))}
      </g>
      {/* Encart bleu « vérifié » qui pulse sur la première. */}
      <g transform="translate(276 96)" className="zig-pulse" style={{ transformOrigin: '286px 106px' }}>
        <circle cx="10" cy="10" r="12" fill={BLEU} />
        <path d="M4 10 L8 14 L16 6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* --- Scène 3 : Demandez ------------------------------------------------- */

function SceneDemandez() {
  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="320" height="260" fill={VERT_CLAIR} rx="16" />
      <path d="M0 216 Q160 200 320 216 L320 260 L0 260 Z" fill="#d9ecd9" />
      <Personnage x={90} y={148} peau={PEAU} cheveux={CHEVEUX_B} cheveuxForme="longs" habit={HABIT} regarde="droite" />
      {/* Téléphone tenu, avec bulle « Demande envoyée ». */}
      <g transform="translate(128 168)">
        <rect x="0" y="0" width="48" height="72" rx="7" fill="#fff" stroke={OMBRE} strokeWidth="1.6" />
        <rect x="4" y="4" width="40" height="60" rx="4" fill={FOND_CHAUD} />
        {/* Avion en papier. */}
        <path d="M12 32 L36 20 L26 44 L22 36 L14 40 Z" fill={VERT} stroke={OMBRE} strokeWidth="1.3" strokeLinejoin="round" />
      </g>
      {/* Bulle de dialogue vers la droite. */}
      <g transform="translate(198 76)" className="zig-pulse" style={{ transformOrigin: '260px 96px' }}>
        <path
          d="M0 20 L14 6 Q22 -2 30 -2 L114 -2 Q124 -2 124 8 L124 26 Q124 36 114 36 L38 36 L20 52 L26 36 Q14 36 8 32 Q0 26 0 20 Z"
          fill="#fff"
          stroke={OMBRE}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <text x="18" y="24" fill={OMBRE} fontSize="11" fontFamily="ui-sans-serif" fontWeight="600">Demande envoyée</text>
      </g>
      {/* Trajet en pointillé du téléphone vers la bulle. */}
      <path d="M170 190 Q220 150 250 118" stroke={VERT} strokeWidth="1.6" strokeDasharray="3 5" fill="none" opacity="0.6" />
    </svg>
  );
}

/* --- Scène 4 : Déposez (la remise à la porte, entre deux personnes) ------ */

function SceneDeposez() {
  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="320" height="260" fill={FOND_CHAUD} rx="16" />
      {/* Mur + porte. */}
      <path d="M0 216 L320 216 L320 260 L0 260 Z" fill="#efe6ce" />
      <g transform="translate(212 60)">
        <path d="M0 0 L64 -6 L64 156 L0 156 Z" fill="#fff" stroke={OMBRE} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="10" cy="80" r="2.5" fill={OMBRE} />
        {/* Numéro 12 en vignette verte. */}
        <g transform="translate(22 26)">
          <rect x="-14" y="-12" width="28" height="22" rx="6" fill={VERT} />
          <text x="0" y="4" fill="#fff" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif" textAnchor="middle">12</text>
        </g>
      </g>
      {/* Bike sitter à droite, sur le seuil. */}
      <Personnage x={244} y={148} peau={PEAU_2} cheveux={CHEVEUX_A} cheveuxForme="court" habit={HABIT_2} regarde="gauche" />
      {/* Cycliste à gauche, tient le vélo. */}
      <Personnage x={80} y={148} peau={PEAU} cheveux={CHEVEUX_B} cheveuxForme="queue" habit={HABIT} regarde="droite" />
      {/* Vélo au milieu, transmis. */}
      <Velo x={112} y={176} echelle={0.9} />
      {/* Bulle bleue avec le code. */}
      <g transform="translate(148 74)" className="zig-pulse" style={{ transformOrigin: '188px 92px' }}>
        <rect x="0" y="0" width="90" height="36" rx="18" fill={BLEU} stroke={OMBRE} strokeWidth="1.5" />
        <text x="45" y="24" fill="#fff" fontSize="14" fontWeight="700" fontFamily="ui-sans-serif" textAnchor="middle" letterSpacing="1.5">482 913</text>
      </g>
      <path d="M180 108 L214 158" stroke={BLEU} strokeWidth="1.6" strokeDasharray="3 5" fill="none" opacity="0.7" />
    </svg>
  );
}

/* --- Scène 5 : Profitez (café / terrasse) --------------------------------- */

function SceneProfitez() {
  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="320" height="260" fill={VERT_CLAIR} rx="16" />
      <path d="M0 216 Q160 200 320 216 L320 260 L0 260 Z" fill="#d9ecd9" />
      {/* Table ronde. */}
      <ellipse cx="220" cy="212" rx="68" ry="10" fill={OMBRE} opacity="0.15" />
      <g transform="translate(152 180)">
        <rect x="0" y="0" width="140" height="12" rx="6" fill="#fff" stroke={OMBRE} strokeWidth="1.5" />
        <path d="M40 12 L34 60" stroke={OMBRE} strokeWidth="2" fill="none" />
        <path d="M100 12 L106 60" stroke={OMBRE} strokeWidth="2" fill="none" />
      </g>
      {/* Personnage assis à gauche de la table. */}
      <Personnage x={96} y={148} peau={PEAU} cheveux={CHEVEUX_A} cheveuxForme="longs" habit={HABIT} regarde="droite" />
      {/* Tasse fumante sur la table. */}
      <g transform="translate(200 152)" className="zig-pulse" style={{ transformOrigin: '218px 176px' }}>
        <path d="M2 12 H30 V32 A10 10 0 0 1 20 42 H12 A10 10 0 0 1 2 32 Z" fill="#fff" stroke={OMBRE} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M30 18 H36 A6 6 0 0 1 36 30 H30" fill="#fff" stroke={OMBRE} strokeWidth="1.6" />
        <ellipse cx="16" cy="12" rx="14" ry="3" fill={VERT} opacity="0.35" />
        <path d="M8 4 Q6 -2 10 -6" stroke={OMBRE} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M18 4 Q22 -2 18 -6" stroke={OMBRE} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    </svg>
  );
}

/* --- Scène 6 : Reprenez (reprise à la porte) ----------------------------- */

function SceneReprenez() {
  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="320" height="260" fill={FOND_CHAUD} rx="16" />
      <path d="M0 216 L320 216 L320 260 L0 260 Z" fill="#efe6ce" />
      {/* Porte à gauche cette fois. */}
      <g transform="translate(30 60)">
        <path d="M0 -6 L64 0 L64 156 L0 156 Z" fill="#fff" stroke={OMBRE} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="52" cy="80" r="2.5" fill={OMBRE} />
        <g transform="translate(42 26)">
          <rect x="-14" y="-12" width="28" height="22" rx="6" fill={VERT} />
          <text x="0" y="4" fill="#fff" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif" textAnchor="middle">12</text>
        </g>
      </g>
      {/* Bike sitter sur le seuil qui rend le vélo. */}
      <Personnage x={112} y={148} peau={PEAU_2} cheveux={CHEVEUX_A} cheveuxForme="court" habit={HABIT_2} regarde="droite" />
      {/* Cycliste à droite. */}
      <Personnage x={264} y={148} peau={PEAU} cheveux={CHEVEUX_B} cheveuxForme="queue" habit={HABIT} regarde="gauche" />
      <Velo x={148} y={176} echelle={0.9} />
      {/* Écusson vert qui pulse : garde terminée. */}
      <g transform="translate(200 62)" className="zig-pulse" style={{ transformOrigin: '218px 80px' }}>
        <circle cx="18" cy="18" r="18" fill={VERT} stroke={OMBRE} strokeWidth="1.5" />
        <path d="M9 18 L15 24 L27 12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
