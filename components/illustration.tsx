/**
 * Les illustrations du site.
 *
 * Pourquoi des dessins et pas des photographies : nous n'avons pas de photos.
 * Une photo de banque d'images montrerait le garage de quelqu'un qui n'est pas
 * membre, dans une ville qui n'est pas la nôtre, et une association qui
 * demande à des gens d'ouvrir leur porte ne peut pas commencer par une image
 * empruntée. Le jour où des membres nous confieront les leurs, elles
 * remplaceront ces dessins.
 *
 * Elles ont leur propre palette, sous des jetons `--dessin-*` qui ne servent
 * nulle part ailleurs. C'est ce qui leur permet d'être colorées sans casser la
 * règle 6 : une illustration ne porte aucune information, elle ne peut donc
 * pas se tromper de sens. Si l'un de ces jetons apparaît un jour sur un bouton
 * ou une pastille, c'est une erreur — la couleur y voudrait dire quelque chose.
 *
 * On n'y dessine personne. Ce n'est pas de la pudeur : un personnage au trait
 * a forcément un âge, une carrure, une carnation, et le réseau s'adresse à
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

/** L'arbre de rue. */
function Arbre({
  x,
  sol,
  rayon,
}: {
  x: number;
  sol: number;
  rayon: number;
}) {
  return (
    <>
      <path
        d={`M${arrondi(x - rayon * 0.14)} ${sol} v${arrondi(-rayon * 1.9)}h${arrondi(rayon * 0.28)}V${sol}z`}
        className="dessin-bois"
      />
      <circle
        cx={x}
        cy={arrondi(sol - rayon * 2.7)}
        r={rayon}
        className="dessin-feuillage"
      />
      {/* Une ombre portée dans la couronne, en bas à droite : plus grande, elle
          se lirait comme une seconde forme posée sur l'arbre. */}
      <circle
        cx={arrondi(x + rayon * 0.34)}
        cy={arrondi(sol - rayon * 2.36)}
        r={arrondi(rayon * 0.46)}
        className="dessin-feuillage-clair"
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
      <path d="M0 270h420v30H0z" className="dessin-sol" />
      <path d="M8 270h404" />
      <g className="illustration__leger">
        <path d="M40 276v10M120 276v10M210 276v10M300 276v10M380 276v10" />
      </g>

      <Arbre x={32} sol={270} rayon={28} />

      {/* La façade : plate et haute, comme une maison de rangée. */}
      <path d="M60 270V84h300v186" className="dessin-facade" />
      <path d="M50 70h320v14H50z" className="dessin-bandeau" />

      <path d="M92 104h52v46H92z" className="dessin-vitre" />
      <path d="M118 104v46M92 127h52" />
      <path d="M86 150h64v8H86z" className="dessin-bandeau" />

      <path d="M96 270v-78h40v78z" className="dessin-menuiserie" />
      <circle cx="128" cy="234" r="2.8" className="dessin-lumiere" />

      {/* La lampe au-dessus de l'entrée du garage. */}
      <path d="M256 104v10" />
      <path d="M246 114h20l-4 15h-12z" className="dessin-lumiere" />

      {/* Le garage ouvert : le seul creux de la façade, et tout est dedans. */}
      <path d="M190 270V140h146v130z" className="dessin-creux" />
      <path d="M190 140h146v26H190z" className="dessin-bandeau" />
      <g className="illustration__leger">
        <path d="M197 147h132M197 153h132M197 159h132" />
      </g>

      <path d="M204 196h118" />
      <path d="M212 172h30v24h-30z" className="dessin-bandeau" />
      <path d="M252 178h24v18h-24z" className="dessin-terre" />

      <Velo moyeuArriere={[232, 240]} moyeuAvant={[300, 240]} rayon={24} />

      {/* La plante en pot, sur le seuil : personne ne range un vélo dans un
          lieu où il ne met jamais les pieds. */}
      <path d="M162 270v-20h20v20z" className="dessin-terre" />
      <path d="M172 250v-18" />
      <path
        d="M172 240c-9 0-13-6-13-12 7 0 13 4 13 12ZM172 236c0-8 6-13 13-13 0 7-5 13-13 13Z"
        className="dessin-feuillage"
      />
    </>
  );
}

/** La maison, le garage ouvert, et la pluie qui tombe à côté. */
function VeloALAbri() {
  return (
    <>
      <path d="M0 210h340v30H0z" className="dessin-sol" />

      {/* La pluie ne touche pas le toit : c'est tout ce que le dessin dit. */}
      <g className="illustration__leger dessin-trait-pluie">
        <path d="M30 34 24 48M52 22 46 36M74 12 68 26M18 62 12 76M40 50 34 64M62 40 56 54" />
      </g>

      <path d="M56 118h228v92H56z" className="dessin-facade" />
      <path d="M44 118 170 46l126 72z" className="dessin-bandeau" />
      <path d="M44 118 170 46l126 72" />
      <path d="M56 118v92M284 118v92M12 210h316" />
      {/* La cheminée descend jusqu'à la pente : le versant droit vaut
          y = 46 + 0,571 (x − 170), soit 82 en x=232 et 92 en x=250. Sans ce
          calcul, un des deux montants flotte au-dessus du toit. */}
      <path d="M232 58h18v34h-18z" className="dessin-terre" />

      <path d="M120 210V132h112v78z" className="dessin-creux" />
      <path d="M120 132h112v22H120z" className="dessin-bandeau" />
      <g className="illustration__leger">
        <path d="M126 138h100M126 144h100M126 150h100" />
      </g>

      <path d="M72 148h32v28H72z" className="dessin-vitre" />
      <path d="M88 148v28M72 162h32" />
      <path d="M68 176h40v6H68z" className="dessin-bandeau" />

      <Velo moyeuArriere={[152, 191]} moyeuAvant={[200, 191]} rayon={17} />
    </>
  );
}

/** La cave voûtée, l'escalier, l'ampoule. */
function LaCave() {
  return (
    <>
      <path
        d="M60 200v-70a110 110 0 0 1 220 0v70z"
        className="dessin-creux"
      />
      <path d="M0 200h340v40H0z" className="dessin-sol" />
      <path d="M40 200h260" />
      <path d="M60 200v-70a110 110 0 0 1 220 0v70" />

      <path d="M64 152h22v16h22v16h22v16h22v16H64z" className="dessin-facade" />
      <path d="M64 152h22v16h22v16h22v16h22" />

      <path d="M170 22v36" />
      <circle cx="170" cy="66" r="8" className="dessin-lumiere" />
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
      <path d="M0 210h340v30H0z" className="dessin-sol" />
      <path d="M10 210h320" />

      <path d="M30 210V96h88v114z" className="dessin-facade" />
      <path d="M26 90h96v10H26z" className="dessin-bandeau" />
      <path d="M46 118h24v26H46zM82 118h24v26H82z" className="dessin-vitre" />
      <path d="M60 168h32v42H60z" className="dessin-menuiserie" />

      <path d="M126 210V70h96v140z" className="dessin-facade" />
      <path d="M122 64h104v10H122z" className="dessin-bandeau" />
      <path d="M140 92h24v26h-24zM184 92h24v26h-24z" className="dessin-vitre" />

      {/* La porte ouverte : le seul creux de la rue, et un vélo dedans. */}
      <path d="M146 210v-62h60v62z" className="dessin-creux" />
      <path d="M146 210v-62h60v62" />
      <Velo moyeuArriere={[164, 196]} moyeuAvant={[190, 196]} rayon={12} />

      <path d="M230 210V110h82v100z" className="dessin-facade" />
      <path d="M226 104h90v10h-90z" className="dessin-bandeau" />
      <path d="M244 132h24v26h-24zM280 132h24v26h-24z" className="dessin-vitre" />
      <path d="M256 176h32v34h-32z" className="dessin-menuiserie" />

      <Arbre x={324} sol={210} rayon={17} />
    </>
  );
}

/** Confier : un vélo, et l'étiquette qu'on lui accroche le temps d'une garde. */
function Confier() {
  return (
    <>
      <path d="M0 124h200v16H0z" className="dessin-sol" />
      <path d="M14 124h172" />
      <Arbre x={176} sol={124} rayon={15} />
      <Velo moyeuArriere={[62, 100]} moyeuAvant={[126, 100]} rayon={22} />
      <path d="M122 62v12" />
      <path d="M112 74h22l-4 18h-14z" className="dessin-lumiere" />
      <g className="illustration__leger">
        <path d="M118 81h10M118 86h7" />
      </g>
    </>
  );
}

/** Garder : sa propre porte, ouverte pour le vélo de quelqu'un d'autre. */
function Garder() {
  return (
    <>
      <path d="M0 124h200v16H0z" className="dessin-sol" />
      <path d="M44 50h112v74H44z" className="dessin-facade" />
      <path d="M36 50 100 16l64 34z" className="dessin-bandeau" />
      <path d="M36 50 100 16l64 34" />
      <path d="M44 50v74M156 50v74M14 124h172" />
      <path d="M60 124V66h80v58z" className="dessin-creux" />
      <path d="M60 66h80v14H60z" className="dessin-bandeau" />
      <g className="illustration__leger">
        <path d="M65 70h70M65 76h70" />
      </g>
      <Velo moyeuArriere={[80, 106]} moyeuAvant={[120, 106]} rayon={14} />
    </>
  );
}

/** Ensemble : plusieurs vélos rangés côte à côte, donc plusieurs personnes. */
function Ensemble() {
  return (
    <>
      <path d="M0 124h200v16H0z" className="dessin-sol" />
      <path d="M14 124h172" />
      <Velo moyeuArriere={[38, 104]} moyeuAvant={[62, 104]} rayon={11} />
      <Velo moyeuArriere={[88, 104]} moyeuAvant={[112, 104]} rayon={11} />
      <Velo moyeuArriere={[138, 104]} moyeuAvant={[162, 104]} rayon={11} />
      <path d="M22 112h4v12h-4zM174 112h4v12h-4z" className="dessin-menuiserie" />
      <path d="M22 112h156" />
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
