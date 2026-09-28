import 'server-only';

import { interroger, uneLigne } from '@/lib/bd/client';
import { nettoyerLaPhotoDeProfil } from '@/lib/securite/image';

/**
 * La photo de profil d'un membre : facultative, une seule, ré-encodée à
 * l'arrivée (règle 4 : aucune métadonnée ne survit, GPS compris).
 */

const IDENTIFIANT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * La « version » d'une photo : l'instant de sa dernière mise à jour, en
 * secondes. Elle entre dans l'adresse de l'image, pour qu'une nouvelle photo
 * remplace l'ancienne sans attendre la fin du cache.
 */
export const VERSION_DE_LA_PHOTO = (alias: string) =>
  `(select extract(epoch from pp.mise_a_jour_le)::bigint
      from photo_de_profil pp where pp.membre_id = ${alias}.id)`;

export async function enregistrerMaPhoto(
  membreId: string,
  original: Buffer,
): Promise<void> {
  const nettoyee = await nettoyerLaPhotoDeProfil(original);
  await interroger(
    `insert into photo_de_profil (membre_id, contenu, largeur, hauteur)
     values ($1, $2, $3, $4)
     on conflict (membre_id) do update
        set contenu = excluded.contenu,
            largeur = excluded.largeur,
            hauteur = excluded.hauteur,
            mise_a_jour_le = now()`,
    [membreId, nettoyee.contenu, nettoyee.largeur, nettoyee.hauteur],
  );
}

export async function retirerMaPhoto(membreId: string): Promise<void> {
  await interroger('delete from photo_de_profil where membre_id = $1', [
    membreId,
  ]);
}

/** La version de sa propre photo, ou null s'il n'en a pas. */
export async function versionDeMaPhoto(membreId: string): Promise<number | null> {
  const ligne = await uneLigne<{ version: string }>(
    `select extract(epoch from mise_a_jour_le)::bigint as version
       from photo_de_profil where membre_id = $1`,
    [membreId],
  );
  return ligne ? Number(ligne.version) : null;
}

/**
 * Le contenu d'une photo, pour un membre connecté. Elle suit la règle du
 * profil (`profilPublic`) : on voit le visage d'un bike sitter, de quelqu'un
 * avec qui on partage une garde, le sien — et la modération voit tout. Un
 * membre suspendu ou supprimé ne montre plus son visage, pas plus qu'un
 * membre qui en a bloqué un autre (dans un sens comme dans l'autre).
 */
export async function lirePhotoDeProfil(
  lecteurId: string,
  membreId: string,
): Promise<Buffer | null> {
  if (!IDENTIFIANT.test(membreId)) return null;
  const ligne = await uneLigne<{ contenu: Buffer }>(
    `select pp.contenu
       from photo_de_profil pp
       join membre m on m.id = pp.membre_id
      where pp.membre_id = $2
        and not m.suspendu and m.supprime_le is null
        and not exists (
          select 1 from blocage b
           where (b.membre_id = $1 and b.bloque_id = $2)
              or (b.membre_id = $2 and b.bloque_id = $1))
        and (m.id = $1
             or (select moderateur from membre where id = $1)
             or exists (select 1 from emplacement e
                         where e.membre_id = m.id and e.publie)
             or exists (select 1 from stationnement s
                          join emplacement e on e.id = s.emplacement_id
                         where (s.cycliste_id = m.id and e.membre_id = $1)
                            or (s.cycliste_id = $1 and e.membre_id = m.id)))`,
    [lecteurId, membreId],
  );
  return ligne?.contenu ?? null;
}
