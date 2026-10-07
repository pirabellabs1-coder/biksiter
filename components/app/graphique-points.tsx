import type { PointsDUnMois } from '@/lib/depot/progression';

/**
 * La courbe des points gagnés mois par mois. Un graphique SVG net, qui se
 * redimensionne avec son conteneur (viewBox) et se lit en une fois : une aire
 * verte sous une ligne, un repère par mois, le mois en cours mis en avant.
 *
 * Pas d'interactivité : le graphique se rend côté serveur, et une description
 * le résume pour les lecteurs d'écran.
 */
export function GraphiqueDesPoints({ mois }: { mois: PointsDUnMois[] }) {
  const L = 760;
  const H = 240;
  const hautM = 24;
  const basM = 34;
  const coteM = 16;
  const largeurTrace = L - coteM * 2;
  const hauteurTrace = H - hautM - basM;

  const maximum = Math.max(1, ...mois.map((m) => m.points));
  // Un palier « rond » au-dessus du maximum, pour la ligne de repère du haut.
  const palier = maximum <= 5 ? 5 : Math.ceil(maximum / 10) * 10;

  const x = (i: number) =>
    mois.length <= 1
      ? coteM + largeurTrace / 2
      : coteM + (i / (mois.length - 1)) * largeurTrace;
  const y = (v: number) => hautM + hauteurTrace * (1 - v / palier);

  const points = mois.map((m, i) => ({ ...m, cx: x(i), cy: y(m.points) }));
  const ligne = points.map((p) => `${p.cx},${p.cy}`).join(' ');
  const aire = `M ${points[0]?.cx ?? coteM},${hautM + hauteurTrace} L ${ligne} L ${
    points.at(-1)?.cx ?? L - coteM
  },${hautM + hauteurTrace} Z`;

  const total = mois.reduce((somme, m) => somme + m.points, 0);
  const dernier = points.at(-1);

  return (
    <figure className="graphique-points">
      <svg
        viewBox={`0 0 ${L} ${H}`}
        role="img"
        aria-label={`Points gagnés par mois sur ${mois.length} mois : ${total} au total.`}
      >
        <defs>
          <linearGradient id="aire-points" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--trust)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--trust)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Deux lignes de repère discrètes : le palier et la moitié. */}
        {[0, 0.5, 1].map((part) => (
          <line
            key={part}
            x1={coteM}
            x2={L - coteM}
            y1={hautM + hauteurTrace * (1 - part)}
            y2={hautM + hauteurTrace * (1 - part)}
            className="gp-grille"
          />
        ))}

        <path d={aire} fill="url(#aire-points)" />
        <polyline points={ligne} className="gp-ligne" fill="none" />

        {points.map((p, i) => (
          <circle
            key={p.cle}
            cx={p.cx}
            cy={p.cy}
            r={i === points.length - 1 ? 5 : 3.5}
            className={
              i === points.length - 1 ? 'gp-point gp-point-actuel' : 'gp-point'
            }
          />
        ))}

        {/* La valeur du mois en cours, posée au-dessus de son point. */}
        {dernier && dernier.points > 0 ? (
          <text
            x={dernier.cx}
            y={dernier.cy - 12}
            className="gp-valeur"
            textAnchor="end"
          >
            +{dernier.points}
          </text>
        ) : null}

        {/* Les mois, en bas. On allège un mois sur deux quand il y en a beaucoup. */}
        {points.map((p, i) => (
          <text
            key={p.cle}
            x={p.cx}
            y={H - 12}
            className="gp-mois"
            textAnchor="middle"
            opacity={mois.length > 8 && i % 2 === 1 ? 0 : 1}
          >
            {p.libelle}
          </text>
        ))}
      </svg>
    </figure>
  );
}
