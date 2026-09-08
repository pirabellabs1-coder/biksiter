/**
 * Règle 4 — on ne montre jamais un point d'adresse, seulement une zone.
 *
 * Ce composant ne reçoit que des centres de zone déjà arrondis par la vue
 * `emplacement_visible` (maille d'environ 500 mètres). Il n'existe aucun
 * chemin par lequel une position exacte pourrait lui arriver, et c'est
 * volontaire : le jour où une vraie carte remplacera ce fond, elle devra
 * garder la même entrée.
 *
 * Ce n'est pas une carte : c'est une figure qui situe les zones les unes par
 * rapport aux autres. La liste qui suit porte l'information réelle, et c'est
 * elle que lit un lecteur d'écran.
 */

export type CentreDeZone = {
  latitude: number;
  longitude: number;
};

/** Marge autour des points, pour qu'aucune tache ne colle au bord. */
const MARGE = 0.18;

function etendue(valeurs: number[]): { minimum: number; amplitude: number } {
  const minimum = Math.min(...valeurs);
  const maximum = Math.max(...valeurs);
  // Toutes les zones au même endroit (ou une seule) : on évite la division
  // par zéro en donnant une amplitude arbitraire, le rendu est alors centré.
  const amplitude = maximum - minimum;
  return { minimum, amplitude: amplitude === 0 ? 1 : amplitude };
}

export default function ZoneApproximative({
  taches,
  haute = false,
}: {
  taches: readonly CentreDeZone[];
  haute?: boolean;
}) {
  const horizontal = etendue(taches.map((t) => t.longitude));
  const vertical = etendue(taches.map((t) => t.latitude));

  const place = (tache: CentreDeZone) => {
    const part = (valeur: number, axe: { minimum: number; amplitude: number }) =>
      taches.length < 2 ? 0.5 : (valeur - axe.minimum) / axe.amplitude;

    return {
      // La latitude croît vers le nord, l'écran vers le bas : on inverse.
      gauche: (MARGE + part(tache.longitude, horizontal) * (1 - 2 * MARGE)) * 100,
      haut: (MARGE + (1 - part(tache.latitude, vertical)) * (1 - 2 * MARGE)) * 100,
    };
  };

  return (
    <div
      className={haute ? 'zone zone--haute' : 'zone'}
      role="img"
      aria-label={
        taches.length === 0
          ? 'Aucune zone d’accueil à afficher.'
          : `Figure indicative : ${taches.length} zone${taches.length > 1 ? 's' : ''} d’accueil. Les emplacements sont listés juste en dessous.`
      }
    >
      {taches.map((tache, index) => {
        const { gauche, haut } = place(tache);
        return (
          <span
            key={`${tache.latitude}-${tache.longitude}-${index}`}
            className="zone__tache"
            style={{
              left: `calc(${gauche}% - 40px)`,
              top: `calc(${haut}% - 40px)`,
              width: 80,
              height: 80,
            }}
          />
        );
      })}
      <span className="zone__legende">Zones approximatives</span>
    </div>
  );
}
