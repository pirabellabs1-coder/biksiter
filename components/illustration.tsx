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
 * On n'y dessine personne. Ce n'est pas de la pudeur : un personnage au trait
 * a forcément un âge, une carrure, une silhouette, et le réseau s'adresse à
 * tout le monde. Les lieux et les vélos disent la même chose sans que
 * quiconque ait à se reconnaître ou non dedans.
 *
 * Elles sont décoratives : `aria-hidden`, et jamais porteuses d'une
 * information qui ne serait pas déjà écrite à côté.
 */

export type Scene =
  | 'la-remise'
  | 'velo-a-labri'
  | 'la-cave'
  | 'la-rue'
  | 'confier'
  | 'garder'
  | 'ensemble';

/** Le cadrage propre à chaque scène : un dessin large ne tient pas au carré. */
const CADRAGES: Record<Scene, string> = {
  'la-remise': '0 0 420 300',
  'velo-a-labri': '0 0 340 240',
  'la-cave': '0 0 340 240',
  'la-rue': '0 0 340 240',
  confier: '0 0 200 140',
  garder: '0 0 200 140',
  ensemble: '0 0 200 140',
};

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

/**
 * La grande scène du haut de page : une maison de rangée, garage ouvert.
 *
 * C'est le seul dessin qui a le droit d'être détaillé. Il porte à lui seul ce
 * que fait le service — une porte ouverte chez quelqu'un — et il est vu en
 * grand, donc chaque approximation s'y verrait.
 */
function LaRemise() {
  return (
    <>
      <path d="M8 270h404" />
      <g className="illustration__leger">
        <path d="M30 270v8M120 270v8M210 270v8M300 270v8M390 270v8" />
      </g>

      {/* L'arbre de rue. Sa couronne reste vide : deux branches dessinées
          dedans faisaient un cercle coché, et un cercle coché veut dire
          « vérifié » partout ailleurs sur ce site (règle 6). */}
      <circle cx="32" cy="192" r="28" />
      <path d="M32 220v50" />
      <g className="illustration__leger">
        <circle cx="32" cy="192" r="18" />
      </g>

      {/* La façade : plate et haute, comme une maison de rangée. */}
      <path d="M60 270V78h300v192" />
      <path d="M50 78h320" />
      <g className="illustration__leger">
        <path d="M54 88h312" />
      </g>

      <rect x="92" y="104" width="52" height="46" />
      <path d="M118 104v46M92 127h52M86 154h64" />

      <path d="M96 270v-78h40v78" />
      <circle cx="128" cy="234" r="2.6" />
      <g className="illustration__leger">
        <path d="M92 270v-6h48v6" />
      </g>

      {/* La lampe au-dessus de l'entrée du garage. */}
      <path d="M256 104v10" />
      <path d="M246 114h20l-4 14h-12z" />

      {/* Le garage ouvert : le seul creux de la façade, et tout est dedans. */}
      <rect
        x="190"
        y="140"
        width="146"
        height="130"
        className="illustration__creux"
      />
      <path d="M190 270V140h146v130" />
      <g className="illustration__leger">
        <path d="M197 148h132M197 156h132M197 164h132" />
      </g>

      <path d="M204 196h118" />
      <rect x="212" y="172" width="30" height="24" />
      <rect x="252" y="178" width="24" height="18" />

      <Velo moyeuArriere={[232, 240]} moyeuAvant={[300, 240]} rayon={24} />

      {/* La plante en pot, sur le seuil : personne ne range un vélo dans un
          lieu où il ne met jamais les pieds. */}
      <path d="M162 270v-20h20v20z" />
      <path d="M172 250v-18" />
      <path d="M172 240c-9 0-13-6-13-12 7 0 13 4 13 12ZM172 236c0-8 6-13 13-13 0 7-5 13-13 13Z" />
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

/** Confier : un vélo, et l'étiquette qu'on lui accroche le temps d'une garde. */
function Confier() {
  return (
    <>
      <path d="M20 124h160" />
      <Velo moyeuArriere={[68, 100]} moyeuAvant={[132, 100]} rayon={22} />
      <path d="M128 62v12" />
      <path d="M118 74h22l-4 18h-14z" />
      <g className="illustration__leger">
        <path d="M124 81h10M124 86h7" />
      </g>
    </>
  );
}

/** Garder : sa propre porte, ouverte pour le vélo de quelqu'un d'autre. */
function Garder() {
  return (
    <>
      <path d="M14 124h172" />
      <path d="M36 50 100 16l64 34" />
      <path d="M44 50v74M156 50v74" />
      <rect
        x="60"
        y="66"
        width="80"
        height="58"
        className="illustration__creux"
      />
      <path d="M60 124V66h80v58" />
      <g className="illustration__leger">
        <path d="M65 71h70M65 77h70" />
      </g>
      <Velo moyeuArriere={[80, 106]} moyeuAvant={[120, 106]} rayon={14} />
    </>
  );
}

/** Ensemble : plusieurs vélos rangés côte à côte, donc plusieurs personnes. */
function Ensemble() {
  return (
    <>
      <path d="M14 124h172" />
      <Velo moyeuArriere={[38, 104]} moyeuAvant={[62, 104]} rayon={11} />
      <Velo moyeuArriere={[88, 104]} moyeuAvant={[112, 104]} rayon={11} />
      <Velo moyeuArriere={[138, 104]} moyeuAvant={[162, 104]} rayon={11} />
      <g className="illustration__leger">
        <path d="M26 118h148" />
      </g>
    </>
  );
}

const SCENES: Record<Scene, () => React.ReactElement> = {
  'la-remise': LaRemise,
  'velo-a-labri': VeloALAbri,
  'la-cave': LaCave,
  'la-rue': LaRue,
  confier: Confier,
  garder: Garder,
  ensemble: Ensemble,
};

export default function Illustration({ scene }: { scene: Scene }) {
  const Dessin = SCENES[scene];

  return (
    <svg
      className="illustration"
      viewBox={CADRAGES[scene]}
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
