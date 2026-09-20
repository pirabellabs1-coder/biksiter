import type { Textes } from '@/lib/i18n/langue';
import { placerLesZones } from '@/lib/carte/projection';
import type { ZoneOuverte } from '@/lib/depot/reseau-public';

/**
 * Les zones où un emplacement est ouvert, sur une carte figurée.
 *
 * Règle 4 : les zones arrivent déjà arrondies de la base, et la carte ne
 * montre que des taches. Ce n'est pas un plan : elle situe les zones les unes
 * par rapport aux autres, et son texte alternatif dit ce qu'elle montre.
 */
export function CarteDesZones({
  zones,
  p,
  haute = false,
}: {
  zones: readonly ZoneOuverte[];
  p: Textes['p'];
  haute?: boolean;
}) {
  const placees = placerLesZones(zones);
  const description =
    zones.length === 0
      ? p('Carte des zones : aucun emplacement n’est encore ouvert.')
      : `${p('Carte des zones')} : ${zones.length} ${p(
          zones.length > 1 ? 'zones approximatives' : 'zone approximative',
        )}`;

  return (
    <div
      className={haute ? 'map tall' : 'map'}
      role="img"
      aria-label={description}
    >
      {placees.map((place, rang) => (
        <span key={rang}>
          <span
            className="blob"
            style={{
              left: `calc(${place.gauche}% - 26px)`,
              top: `calc(${place.haut}% - 26px)`,
              width: 52,
              height: 52,
            }}
          />
          <span
            className="pin"
            style={{
              left: `calc(${place.gauche}% - 6px)`,
              top: `calc(${place.haut}% - 6px)`,
            }}
          />
        </span>
      ))}
      <span className="maplabel" aria-hidden="true">
        {p('Zones approximatives')}
      </span>
    </div>
  );
}
