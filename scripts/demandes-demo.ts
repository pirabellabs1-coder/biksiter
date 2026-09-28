/**
 * Crée des demandes de garde de démonstration sur l'emplacement du membre de
 * test, pour que le parcours bike sitter soit parcourable de bout en bout :
 * demande reçue → fiche de la demande → profil du cycliste → accepter,
 * écrire ou refuser.
 *
 * Idempotent : il ne recrée pas ce qui existe déjà.
 *
 *   npx tsx scripts/demandes-demo.ts <email du bike sitter>
 */

import process from 'node:process';

import { interroger } from '../lib/bd/client';
import { empreinteDuMotDePasse } from '../lib/securite/mot-de-passe';

const EMAIL_SITTER = process.argv[2];
if (!EMAIL_SITTER) {
  throw new Error('Usage : demandes-demo.ts <email du bike sitter>');
}

/** Les cyclistes qui demandent. Des personnes fictives, clairement. */
const CYCLISTES = [
  {
    prenom: 'Camille',
    nom: 'Renard',
    email: 'camille.renard@exemple.be',
    velo: 'Ville',
    message:
      'Bonjour ! Je viens pour un rendez-vous à deux rues, je repasse en fin d’après-midi. Merci beaucoup.',
    dansHeures: 26,
    duree: 3,
    etat: 'demande' as const,
  },
  {
    prenom: 'Yanis',
    nom: 'Benali',
    email: 'yanis.benali@exemple.be',
    velo: 'Électrique',
    message:
      'Bonjour, c’est un vélo électrique, un peu lourd. Je peux le porter si besoin.',
    dansHeures: 50,
    duree: 5,
    etat: 'demande' as const,
  },
  {
    prenom: 'Aïcha',
    nom: 'Traoré',
    email: 'aicha.traore@exemple.be',
    velo: 'Pliant',
    message: 'Merci d’avance ! Je serai là à l’heure.',
    dansHeures: 8,
    duree: 4,
    etat: 'accepte' as const,
  },
];

const MOT_DE_PASSE = 'un velo a l abri';

async function creer(): Promise<void> {
  const [sitter] = await interroger<{ id: string; prenom: string }>(
    'select id, prenom from membre where lower(email) = lower($1)',
    [EMAIL_SITTER],
  );
  if (!sitter) throw new Error(`Aucun membre pour ${EMAIL_SITTER}`);

  const [lieu] = await interroger<{ id: string; reference: string }>(
    'select id, reference from emplacement where membre_id = $1 order by cree_le limit 1',
    [sitter.id],
  );
  if (!lieu) {
    throw new Error(
      'Ce membre n’a pas d’emplacement — lancez d’abord enrichir-demo.ts',
    );
  }

  process.stdout.write(
    `Bike sitter : ${sitter.prenom} · emplacement ${lieu.reference}\n`,
  );

  const empreinte = await empreinteDuMotDePasse(MOT_DE_PASSE);

  for (const c of CYCLISTES) {
    // Le cycliste, créé une seule fois.
    let [membre] = await interroger<{ id: string }>(
      'select id from membre where lower(email) = lower($1)',
      [c.email],
    );
    if (!membre) {
      [membre] = await interroger<{ id: string }>(
        `insert into membre (prenom, nom, email, empreinte, verification, verifie_le)
         values ($1, $2, $3, $4, 'verifiee', now())
         returning id`,
        [c.prenom, c.nom, c.email, empreinte],
      );
      process.stdout.write(`· cycliste créé : ${c.prenom} ${c.nom}\n`);
    }
    if (!membre) continue;

    // Une seule demande par cycliste sur cet emplacement.
    const [{ n }] = await interroger<{ n: string }>(
      'select count(*) as n from stationnement where emplacement_id = $1 and cycliste_id = $2',
      [lieu.id, membre.id],
    );
    if (Number(n) > 0) {
      process.stdout.write(`· demande de ${c.prenom} déjà présente\n`);
      continue;
    }

    await interroger(
      `insert into stationnement (
         emplacement_id, cycliste_id, etat, debut, fin, type_velo, message,
         demande_le, repondu_le
       ) values (
         $1, $2, $3,
         now() + ($4 || ' hours')::interval,
         now() + ($5 || ' hours')::interval,
         $6, $7,
         now() - interval '2 hours',
         case when $3 = 'accepte' then now() - interval '1 hour' else null end
       )`,
      [
        lieu.id,
        membre.id,
        c.etat,
        String(c.dansHeures),
        String(c.dansHeures + c.duree),
        c.velo,
        c.message,
      ],
    );
    process.stdout.write(
      `· demande ${c.etat} de ${c.prenom} (${c.velo}, ${c.duree} h)\n`,
    );
  }

  process.stdout.write('\nTerminé.\n');
  process.exit(0);
}

creer().catch((erreur) => {
  process.stderr.write(String(erreur) + '\n');
  process.exit(1);
});
