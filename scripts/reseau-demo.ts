/**
 * Étoffe le réseau de démonstration.
 *
 * Le compte de test possédait les seuls emplacements : une recherche ne
 * pouvait donc rien trouver, puisqu'on ne se propose pas à soi-même. On donne
 * un emplacement à chaque autre membre, et on crée une garde où le compte de
 * test est cycliste — sans quoi le parcours de dépôt, avec ses photos, n'est
 * atteignable depuis aucun écran.
 */
import process from 'node:process';
import { interroger } from '../lib/bd/client';

const EMAIL = process.argv[2];
if (!EMAIL) throw new Error('Usage : <email du compte de test>');

const LIEUX = [
  {
    email: 'camille.renard@exemple.be',
    quartier: 'Bruxelles-Central',
    type: 'Cave privative',
    adresse: 'rue du Marché aux Herbes 42, 1000 Bruxelles',
    lon: 4.3528,
    lat: 50.8467,
    capacite: 2,
    velos: ['Ville', 'Route', 'VTC', 'Pliant'],
  },
  {
    email: 'yanis.benali@exemple.be',
    quartier: 'Parvis de Saint-Gilles',
    type: 'Garage privé fermé',
    adresse: 'rue de Bosnie 41, 1060 Saint-Gilles',
    lon: 4.3452,
    lat: 50.8281,
    capacite: 3,
    velos: ['Ville', 'Électrique', 'Cargo', 'VTC'],
  },
  {
    email: 'aicha.traore@exemple.be',
    quartier: 'Place Flagey',
    type: 'Cour privée',
    adresse: 'rue Malibran 88, 1050 Ixelles',
    lon: 4.3718,
    lat: 50.8272,
    capacite: 1,
    velos: ['Ville', 'Pliant', 'Enfant'],
  },
];

async function main(): Promise<void> {
  const [moi] = await interroger<{ id: string; prenom: string }>(
    'select id, prenom from membre where lower(email) = lower($1)',
    [EMAIL],
  );
  if (!moi) throw new Error('Compte de test introuvable');

  for (const l of LIEUX) {
    const [membre] = await interroger<{ id: string; prenom: string }>(
      'select id, prenom from membre where lower(email) = lower($1)',
      [l.email],
    );
    if (!membre) {
      process.stdout.write(`· ${l.email} absent, ignoré\n`);
      continue;
    }

    const [{ n }] = await interroger<{ n: string }>(
      'select count(*) as n from emplacement where membre_id = $1',
      [membre.id],
    );
    if (Number(n) > 0) {
      process.stdout.write(`· ${membre.prenom} a déjà un emplacement\n`);
      continue;
    }

    await interroger(
      `insert into emplacement (
         reference, membre_id, type, quartier, adresse_exacte,
         position, rayon_de_la_zone, capacite, verrouillage, intemperie,
         acces, ancrage, services, velos_acceptes, precisions, publie,
         jours_d_accueil, heure_d_ouverture, heure_de_fermeture,
         duree_max_heures
       ) values (
         'demo-' || lower(regexp_replace($2, '[^a-zA-Z]', '', 'g')) || '-' ||
           substring(md5(random()::text) for 5),
         $1, $3, $4, $5,
         st_setsrid(st_makepoint($6, $7), 4326)::geography, 300, $8,
         'cle', 'interieur', 'Plain-pied', 'Ancrage mural',
         array[]::text[], $9::text[],
         'Sonnez, je descends vous ouvrir.',
         true, array[1,2,3,4,5,6], '07:00', '22:00', 5
       )`,
      [
        membre.id,
        membre.prenom,
        l.type,
        l.quartier,
        l.adresse,
        l.lon,
        l.lat,
        l.capacite,
        l.velos,
      ],
    );
    process.stdout.write(
      `· emplacement créé chez ${membre.prenom} · ${l.quartier}\n`,
    );
  }

  // Une garde acceptée où le compte de test est cycliste : c'est elle qui
  // ouvre le parcours de dépôt et donc les photos du vélo.
  const [{ n: dejaCycliste }] = await interroger<{ n: string }>(
    "select count(*) as n from stationnement where cycliste_id = $1 and etat = 'accepte'",
    [moi.id],
  );
  if (Number(dejaCycliste) === 0) {
    const [lieuAutre] = await interroger<{ id: string; quartier: string }>(
      `select e.id, e.quartier from emplacement e
        where e.membre_id <> $1 and e.publie
        order by e.cree_le limit 1`,
      [moi.id],
    );
    if (lieuAutre) {
      await interroger(
        `insert into stationnement (
           emplacement_id, cycliste_id, etat, debut, fin, type_velo, message,
           demande_le, repondu_le
         ) values (
           $1, $2, 'accepte',
           now() + interval '3 hours',
           now() + interval '7 hours',
           'Ville', 'Merci ! Je passe en début d’après-midi.',
           now() - interval '5 hours', now() - interval '4 hours'
         )`,
        [lieuAutre.id, moi.id],
      );
      process.stdout.write(
        `· garde acceptée créée : ${moi.prenom} dépose à ${lieuAutre.quartier}\n`,
      );
    }
  } else {
    process.stdout.write('· une garde côté cycliste existe déjà\n');
  }

  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
