/**
 * Complète les emplacements de démonstration : jours d'accueil et horaires.
 * Sans eux, aucune recherche ne peut aboutir — le lieu n'est jamais ouvert.
 */
import process from 'node:process';
import { interroger } from '../lib/bd/client';

const EMAIL = process.argv[2];
if (!EMAIL) throw new Error('Usage : <email du bike sitter>');

async function main(): Promise<void> {
  const [membre] = await interroger<{ id: string }>(
    'select id from membre where lower(email) = lower($1)',
    [EMAIL],
  );
  if (!membre) throw new Error('Membre introuvable');

  // Lundi au samedi, 8h → 20h : de quoi tomber sur un créneau ouvert.
  const majs = await interroger<{ reference: string }>(
    `update emplacement
        set jours_d_accueil = array[1,2,3,4,5,6],
            heure_d_ouverture = '08:00',
            heure_de_fermeture = '20:00',
            duree_max_heures = 5
      where membre_id = $1
      returning reference`,
    [membre.id],
  );
  process.stdout.write(`· ${majs.length} emplacement(s) complété(s)\n`);

  // Un second lieu, à Bruxelles-Central, pour que la recherche par défaut
  // trouve quelque chose.
  const [{ n }] = await interroger<{ n: string }>(
    "select count(*) as n from emplacement where membre_id = $1 and quartier = 'Bruxelles-Central'",
    [membre.id],
  );
  if (Number(n) === 0) {
    await interroger(
      `insert into emplacement (
         reference, membre_id, type, quartier, adresse_exacte,
         position, rayon_de_la_zone, capacite, verrouillage, intemperie,
         acces, ancrage, services, velos_acceptes, precisions, publie,
         jours_d_accueil, heure_d_ouverture, heure_de_fermeture,
         duree_max_heures
       ) values (
         'demo-central-' || substring(md5(random()::text) for 6),
         $1, 'Garage privé fermé', 'Bruxelles-Central',
         'rue de l''Écuyer 8, 1000 Bruxelles',
         st_setsrid(st_makepoint(4.3548, 50.8487), 4326)::geography, 300, 3,
         'cle', 'interieur', 'Plain-pied', 'Ancrage mural',
         array['Gonflage des pneus']::text[],
         array['Ville','Route','VTC','Électrique','Cargo'],
         'Porte latérale à gauche du garage, sonnez au 2.',
         true, array[1,2,3,4,5,6], '08:00', '20:00', 5
       )`,
      [membre.id],
    );
    process.stdout.write('· un emplacement ajouté à Bruxelles-Central\n');
  } else {
    process.stdout.write('· Bruxelles-Central déjà pourvu\n');
  }
  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
