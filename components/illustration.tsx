/**
 * Les illustrations du site.
 *
 * Pourquoi des dessins et pas des photographies : nous n'avons pas de photos.
 * Une photo de banque d'images montrerait le garage de quelqu'un qui n'est pas
 * membre, dans une ville qui n'est pas la nôtre, et une association qui
 * demande à des gens d'ouvrir leur porte ne peut pas commencer par une image
 * empruntée. Le jour où des membres nous confieront leurs photos, elles
 * remplaceront ces dessins.
 *
 * Elles prolongent le trait des pictogrammes (`icone-caracteristique.tsx`) :
 * même absence de remplissage, mêmes extrémités arrondies, et la couleur du
 * texte qui les entoure. Elles sont grises pour la même raison que la figure
 * cartographique l'est (règle 6) — une illustration n'est ni une action, ni
 * une vérification, ni un vélo gardé. Les seules variations sont des valeurs,
 * jamais des teintes.
 *
 * Elles sont décoratives : `aria-hidden`, et jamais porteuses d'une
 * information qui ne serait pas déjà écrite à côté.
 */

export type Scene = 'velo-a-labri' | 'la-cave' | 'la-rue';

/**
 * Deux décimales suffisent à un dessin, et évitent qu'un `0.29` produise un
 * « 160.57000000000002 » dans le fichier envoyé au navigateur.
 */
function arrondi(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

/** Le vélo d'un cycliste, dessiné entre deux moyeux. */
function Velo({
  moyeuArriere,
  moyeuAvant,
  rayon,
}: {
  moyeuArriere: [number, number];
  moyeuAvant: [number, number];
  rayon: number;
}) {
  const [xa, y] = moyeuArriere;
  const [xv] = moyeuAvant;

  // Le cadre est construit à partir de l'écartement des roues, pour qu'un vélo
  // dessiné petit garde exactement les mêmes proportions qu'un grand.
  const empattement = xv - xa;
  const pedalier: [number, number] = [arrondi(xa + empattement * 0.52), y];
  const selle: [number, number] = [
    arrondi(xa + empattement * 0.29),
    arrondi(y - rayon * 1.5),
  ];
  const cintre: [number, number] = [
    arrondi(xa + empattement * 0.9),
    arrondi(y - rayon * 1.62),
  ];

  return (
    <>
      <circle cx={xa} cy={y} r={rayon} />
      <circle cx={xv} cy={y} r={rayon} />
      <path
        d={[
          `M${xa} ${y} L${pedalier[0]} ${pedalier[1]}`,
          `M${pedalier[0]} ${pedalier[1]} L${selle[0]} ${selle[1]}`,
          `M${xa} ${y} L${selle[0]} ${selle[1]}`,
          `M${selle[0]} ${selle[1]} L${cintre[0]} ${cintre[1]}`,
          `M${pedalier[0]} ${pedalier[1]} L${cintre[0]} ${cintre[1]}`,
          `M${cintre[0]} ${cintre[1]} L${xv} ${y}`,
        ].join(' ')}
      />
      <path
        d={`M${arrondi(selle[0] - rayon * 0.42)} ${arrondi(selle[1] - rayon * 0.17)} h${arrondi(rayon * 0.84)}`}
      />
      <path
        d={`M${arrondi(cintre[0] - rayon * 0.42)} ${arrondi(cintre[1] - rayon * 0.17)} h${arrondi(rayon * 0.84)}`}
      />
    </>
  );
}

/** La maison, le garage ouvert, et la pluie qui tombe à côté. */
function VeloALAbri() {
  return (
    <>
      {/* La pluie ne touche pas le toit : c'est tout ce que le dessin dit. */}
      <g className="illustration__leger">
        <path d="M30 34 24 48M52 22 46 36M74 12 68 26M18 62 12 76M40 50 34 64M62 40 56 54" />
      </g>

      <path d="M12 210h316" />
      <path d="M44 118 170 46l126 72" />
      <path d="M56 118v92M284 118v92" />
      {/* La cheminée descend jusqu'à la pente : le versant droit vaut
          y = 46 + 0,571 (x − 170), soit 82 en x=232 et 92 en x=250. Sans ce
          calcul, un des deux montants flotte au-dessus du toit. */}
      <path d="M232 58v24M250 58v34M232 58h18" />

      {/* Le creux du garage : une valeur plus sombre, pas une couleur. */}
      <rect
        x="120"
        y="132"
        width="112"
        height="78"
        className="illustration__creux"
      />
      <path d="M120 210V132h112v78" />
      <g className="illustration__leger">
        <path d="M126 138h100M126 144h100M126 150h100" />
      </g>

      <rect x="72" y="148" width="32" height="28" />
      <path d="M88 148v28M72 162h32M68 180h40" />

      <Velo moyeuArriere={[152, 191]} moyeuAvant={[200, 191]} rayon={17} />
    </>
  );
}

/** La cave voûtée, l'escalier, l'ampoule. */
function LaCave() {
  return (
    <>
      <path d="M40 200h260" />
      <path d="M60 200v-70a110 110 0 0 1 220 0v70" />

      <path d="M64 152h22v16h22v16h22v16h22" />

      <path d="M170 22v36" />
      <circle cx="170" cy="66" r="8" />
      <g className="illustration__leger">
        <path d="M158 78 152 88M182 78l6 10M170 80v12" />
      </g>

      <Velo moyeuArriere={[200, 180]} moyeuAvant={[250, 180]} rayon={18} />
    </>
  );
}

/** Une rue, et une porte ouverte parmi les autres. */
function LaRue() {
  return (
    <>
      <path d="M10 210h320" />

      <path d="M30 210V96h88v114M26 96h96" />
      <rect x="46" y="118" width="24" height="26" />
      <rect x="82" y="118" width="24" height="26" />
      <rect x="60" y="168" width="32" height="42" />

      <path d="M126 210V70h96v140M122 70h104" />
      <rect x="140" y="92" width="24" height="26" />
      <rect x="184" y="92" width="24" height="26" />

      {/* La porte ouverte : le seul creux de la rue, et un vélo dedans. */}
      <rect
        x="146"
        y="148"
        width="60"
        height="62"
        className="illustration__creux"
      />
      <path d="M146 210v-62h60v62" />
      <Velo moyeuArriere={[164, 196]} moyeuAvant={[190, 196]} rayon={12} />

      <path d="M230 210V110h82v100M226 110h90" />
      <rect x="244" y="132" width="24" height="26" />
      <rect x="280" y="132" width="24" height="26" />
      <rect x="256" y="176" width="32" height="34" />
    </>
  );
}

const SCENES: Record<Scene, () => React.ReactElement> = {
  'velo-a-labri': VeloALAbri,
  'la-cave': LaCave,
  'la-rue': LaRue,
};

export default function Illustration({ scene }: { scene: Scene }) {
  const Dessin = SCENES[scene];

  return (
    <svg
      className="illustration"
      viewBox="0 0 340 240"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <Dessin />
    </svg>
  );
}
