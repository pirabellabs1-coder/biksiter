/**
 * Règle 4 — la carte ne montre jamais un point, seulement une zone.
 *
 * Ce composant ne sait pas afficher une adresse : il ne reçoit que des taches
 * floues. Le jour où une vraie carte remplacera ce fond, elle devra garder la
 * même signature — c’est ce qui empêche qu’un point exact s’y glisse.
 */

type Tache = { x: number; y: number };

export default function ZoneApproximative({
  taches,
  haute = false,
}: {
  taches: readonly Tache[];
  haute?: boolean;
}) {
  return (
    <div
      className={haute ? 'zone zone--haute' : 'zone'}
      role="img"
      aria-label={`Carte indicative : ${taches.length} zones d’accueil autour de ce point. Les emplacements sont listés juste en dessous.`}
    >
      {taches.map((tache, index) => (
        <span
          key={`${tache.x}-${tache.y}-${index}`}
          className="zone__tache"
          style={{
            left: `${tache.x - 4}%`,
            top: `${tache.y - 7}%`,
            width: 80,
            height: 80,
          }}
        />
      ))}
      <span className="zone__legende">Zones approximatives</span>
    </div>
  );
}
