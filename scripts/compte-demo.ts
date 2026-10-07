/**
 * Un compte de démonstration complet, à confier au client.
 *
 * Il porte les deux rôles : il possède un emplacement — donc il est bike
 * sitter et reçoit des demandes — et il a une garde acceptée chez quelqu'un
 * d'autre, donc il est cycliste. La bascule de l'en-tête fait passer de l'un
 * à l'autre.
 *
 *   MOT_DE_PASSE_DEMO=… npx tsx --env-file-if-exists=.env.local scripts/compte-demo.ts
 *
 * Le mot de passe n'est jamais écrit ici : un dépôt git garde tout ce qu'on
 * y a mis, et ce compte existe en production.
 */
import process from 'node:process';

import { interroger } from '../lib/bd/client';
import { empreinteDuMotDePasse } from '../lib/securite/mot-de-passe';

const EMAIL = 'demo@bikesitters.be';

async function main(): Promise<void> {
  const MOT_DE_PASSE = process.env.MOT_DE_PASSE_DEMO ?? '';
  if (MOT_DE_PASSE.length < 12) {
    process.stderr.write(
      'Indiquez le mot de passe du compte de démonstration dans MOT_DE_PASSE_DEMO (12 caractères au moins).\n',
    );
    process.exitCode = 1;
    return;
  }
  const empreinte = await empreinteDuMotDePasse(MOT_DE_PASSE);

  // Le compte. S'il existe, on réécrit son empreinte : un mot de passe de
  // démonstration doit rester celui qu'on annonce.
  let [compte] = await interroger<{ id: string }>(
    'select id from membre where lower(email) = lower($1)',
    [EMAIL],
  );
  if (compte) {
    await interroger(
      `update membre
          set empreinte = $2, verification = 'verifiee', verifie_le = now()
        where id = $1`,
      [compte.id, empreinte],
    );
    process.stdout.write('· compte existant, mot de passe réinitialisé\n');
  } else {
    [compte] = await interroger<{ id: string }>(
      `insert into membre (prenom, nom, email, empreinte, verification, verifie_le)
       values ('Alex', 'Martin', $1, $2, 'verifiee', now())
       returning id`,
      [EMAIL, empreinte],
    );
    process.stdout.write('· compte créé\n');
  }
  if (!compte) throw new Error('Compte non créé');
  const moi = compte.id;

  // --- Côté bike sitter : un emplacement publié --------------------------
  let [lieu] = await interroger<{ id: string }>(
    'select id from emplacement where membre_id = $1 limit 1',
    [moi],
  );
  if (!lieu) {
    [lieu] = await interroger<{ id: string }>(
      `insert into emplacement (
         reference, membre_id, type, quartier, adresse_exacte,
         position, rayon_de_la_zone, capacite, verrouillage, intemperie,
         acces, ancrage, services, velos_acceptes, precisions, publie,
         jours_d_accueil, heure_d_ouverture, heure_de_fermeture, duree_max_heures
       ) values (
         'demo-compte-' || substring(md5(random()::text) for 5),
         $1, 'Garage privé fermé', 'Place Flagey',
         'rue Malibran 20, 1050 Ixelles',
         st_setsrid(st_makepoint(4.3722, 50.8276), 4326)::geography, 300, 2,
         'cle', 'interieur', 'Plain-pied', 'Ancrage mural',
         array['Gonflage des pneus']::text[],
         array['Ville', 'Route', 'VTC', 'Électrique', 'Pliant'],
         'Sonnez au 2, je descends ouvrir le garage.',
         true, array[1, 2, 3, 4, 5, 6], '07:00', '22:00', 5
       ) returning id`,
      [moi],
    );
    process.stdout.write('· emplacement publié · Place Flagey\n');
  }
  if (!lieu) throw new Error('Emplacement non créé');

  // --- Des demandes reçues, à accepter ou refuser ------------------------
  const demandeurs = await interroger<{ id: string; prenom: string }>(
    `select id, prenom from membre
      where lower(email) in ('camille.renard@exemple.be', 'yanis.benali@exemple.be')
      order by prenom`,
  );
  const VELOS = ['Ville', 'Électrique'];
  const MESSAGES = [
    'Bonjour ! Un rendez-vous à deux rues, je repasse en fin d’après-midi.',
    'Bonjour, vélo électrique un peu lourd. Je peux le porter si besoin.',
  ];
  for (const [rang, qui] of demandeurs.entries()) {
    const [{ n }] = await interroger<{ n: string }>(
      `select count(*) as n from stationnement
        where emplacement_id = $1 and cycliste_id = $2`,
      [lieu.id, qui.id],
    );
    if (Number(n) > 0) continue;
    await interroger(
      `insert into stationnement (
         emplacement_id, cycliste_id, etat, debut, fin, type_velo, message,
         demande_le
       ) values (
         $1, $2, 'demande',
         now() + ($3 || ' hours')::interval,
         now() + ($4 || ' hours')::interval,
         $5, $6, now() - interval '90 minutes'
       )`,
      [
        lieu.id,
        qui.id,
        String(20 + rang * 24),
        String(23 + rang * 24),
        VELOS[rang] ?? 'Ville',
        MESSAGES[rang] ?? 'Bonjour !',
      ],
    );
    process.stdout.write(`· demande reçue de ${qui.prenom}\n`);
  }

  // --- Côté cycliste : une garde acceptée ailleurs -----------------------
  const [{ n: dejaCycliste }] = await interroger<{ n: string }>(
    `select count(*) as n from stationnement
      where cycliste_id = $1 and etat = 'accepte'`,
    [moi],
  );
  if (Number(dejaCycliste) === 0) {
    const [ailleurs] = await interroger<{ id: string; quartier: string }>(
      `select id, quartier from emplacement
        where membre_id <> $1 and publie order by cree_le limit 1`,
      [moi],
    );
    if (ailleurs) {
      await interroger(
        `insert into stationnement (
           emplacement_id, cycliste_id, etat, debut, fin, type_velo, message,
           demande_le, repondu_le
         ) values (
           $1, $2, 'accepte',
           now() + interval '4 hours', now() + interval '8 hours',
           'Ville', 'Merci ! Je passe en début d’après-midi.',
           now() - interval '6 hours', now() - interval '5 hours'
         )`,
        [ailleurs.id, moi],
      );
      process.stdout.write(
        `· garde acceptée côté cycliste · ${ailleurs.quartier}\n`,
      );
    }
  }

  // --- Des points gagnés mois par mois (pour la courbe de progression) ---
  // On réécrit à chaque passage l'historique de démonstration, étalé sur les
  // douze derniers mois, pour que le graphique raconte une progression.
  await interroger(
    `delete from maillon
      where membre_id = $1 and nature = 'garde' and stationnement_id is null`,
    [moi],
  );
  // Du plus ancien au mois en cours : un total de 80 points, en hausse.
  const PARMOIS = [0, 0, 5, 0, 10, 5, 0, 15, 5, 10, 10, 20];
  for (const [rang, gagnes] of PARMOIS.entries()) {
    if (gagnes === 0) continue;
    const moisAvant = PARMOIS.length - 1 - rang;
    await interroger(
      `insert into maillon (membre_id, nombre, etat, nature, motif, cree_le)
       values ($1, $2, 'acquis', 'garde', 'Garde de démonstration',
               date_trunc('month', now()) - make_interval(months => $3)
                 + interval '12 days')`,
      [moi, gagnes, moisAvant],
    );
  }
  process.stdout.write('· 80 points, répartis sur douze mois\n');

  // --- Des notifications -------------------------------------------------
  const [{ n: notifs }] = await interroger<{ n: string }>(
    'select count(*) as n from notification where membre_id = $1',
    [moi],
  );
  if (Number(notifs) === 0) {
    await interroger(
      `insert into notification (membre_id, texte, lien, creee_le) values
         ($1, 'Une demande de garde attend votre réponse.', '/demandes',
          now() - interval '90 minutes'),
         ($1, 'Une seconde demande est arrivée.', '/demandes',
          now() - interval '4 hours'),
         ($1, 'Votre identité est vérifiée.', '/profil/verifications',
          now() - interval '2 days'),
         ($1, 'Vous avez atteint 80 points.', '/catalogue',
          now() - interval '3 days')`,
      [moi],
    );
    process.stdout.write('· 4 notifications\n');
  }

  // --- Des favoris -------------------------------------------------------
  const [{ n: favoris }] = await interroger<{ n: string }>(
    'select count(*) as n from favori where membre_id = $1',
    [moi],
  );
  if (Number(favoris) === 0) {
    const autres = await interroger<{ id: string }>(
      `select id from emplacement where membre_id <> $1 and publie
        order by cree_le limit 2`,
      [moi],
    );
    for (const e of autres) {
      await interroger(
        `insert into favori (membre_id, emplacement_id) values ($1, $2)
         on conflict do nothing`,
        [moi, e.id],
      );
    }
    process.stdout.write(`· ${autres.length} favoris\n`);
  }

  process.stdout.write(`\nIDENTIFIANTS\n  ${EMAIL}\n  ${MOT_DE_PASSE}\n`);
  process.exit(0);
}

main().catch((erreur) => {
  process.stderr.write(String(erreur) + '\n');
  process.exit(1);
});
