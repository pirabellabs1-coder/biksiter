import 'server-only';

import { dansUneTransaction } from '@/lib/bd/client';
import { alerteConcernee, type AlerteAPrevenir } from '@/lib/regles/alertes';
import { jourABruxelles } from '@/lib/temps';

import { notifier } from './notifications';

/**
 * Prévenir les alertes de recherche quand un lieu devient visible.
 *
 * On lit la zone du lieu dans `emplacement_visible`, jamais sa position
 * exacte (règle 4) : l'alerte dit qu'un lieu a ouvert près de l'endroit
 * cherché et renvoie vers sa fiche, rien de plus. Un membre bloqué, dans un
 * sens ou dans l'autre, n'est pas prévenu.
 */
export async function prevenirLesAlertesPour(references: readonly string[]): Promise<number> {
  if (references.length === 0) return 0;
  return dansUneTransaction(async (client) => {
    let prevenues = 0;
    for (const reference of references) {
      const { rows: lieux } = await client.query<{
        bike_sitter_id: string;
        latitude: number;
        longitude: number;
      }>(
        `select v.bike_sitter_id,
                v.latitude_de_zone::float8 as latitude,
                v.longitude_de_zone::float8 as longitude
           from emplacement_visible v join membre m on m.id = v.bike_sitter_id
          where v.reference = $1 and not m.suspendu`,
        [reference],
      );
      const lieu = lieux[0];
      if (!lieu) continue;

      // Le verrou évite qu'une même alerte parte deux fois si deux lieux
      // proches ouvrent au même instant.
      const { rows: alertes } = await client.query<{
        id: string;
        lieu: string;
        membre_id: string;
        latitude: number;
        longitude: number;
        jour: string | null;
      }>(
        `select a.id, a.lieu, a.membre_id, a.latitude, a.longitude,
                to_char(a.jour, 'YYYY-MM-DD') as jour
           from alerte_de_recherche a join membre m on m.id = a.membre_id
          where a.prevenue_le is null and not m.suspendu and m.supprime_le is null
            and not exists (select 1 from blocage b
                             where (b.membre_id = a.membre_id and b.bloque_id = $1)
                                or (b.membre_id = $1 and b.bloque_id = a.membre_id))
          for update of a skip locked`,
        [lieu.bike_sitter_id],
      );
      const aujourdhui = jourABruxelles();
      for (const alerte of alertes) {
        const aPrevenir: AlerteAPrevenir = {
          membreId: alerte.membre_id,
          latitude: alerte.latitude,
          longitude: alerte.longitude,
          jour: alerte.jour,
          prevenueLe: null,
        };
        if (
          !alerteConcernee(
            aPrevenir,
            { latitude: lieu.latitude, longitude: lieu.longitude, bikeSitterId: lieu.bike_sitter_id },
            aujourdhui,
          )
        ) {
          continue;
        }
        await client.query('update alerte_de_recherche set prevenue_le = now() where id = $1', [
          alerte.id,
        ]);
        await notifier(client, alerte.membre_id, {
          texte: 'Un Bike Sitter vient d’ouvrir près de {lieu}.',
          valeurs: { lieu: alerte.lieu },
          lien: `/emplacements/${reference}`,
        });
        prevenues += 1;
      }
    }
    return prevenues;
  });
}
