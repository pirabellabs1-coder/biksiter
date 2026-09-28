/**
 * Deux gardes de démonstration placées aux états qui ouvrent les photos :
 * `arrivee` pour le constat du dépôt, `reprise_demandee` pour celui du
 * retour. Sans elles, ces deux écrans restent inatteignables et on croit que
 * la fonctionnalité manque.
 */
import process from 'node:process';
import { interroger } from '../lib/bd/client';

const EMAIL = process.argv[2];
if (!EMAIL) throw new Error('Usage : <email du compte de test>');

async function main(): Promise<void> {
  const [moi] = await interroger<{ id: string; prenom: string }>(
    'select id, prenom from membre where lower(email) = lower($1)',
    [EMAIL],
  );
  if (!moi) throw new Error('Compte de test introuvable');

  const lieux = await interroger<{ id: string; quartier: string }>(
    `select id, quartier from emplacement
      where membre_id <> $1 and publie order by cree_le`,
    [moi.id],
  );
  if (lieux.length < 2) throw new Error('Il faut au moins deux emplacements tiers');

  const etapes = [
    {
      etat: 'arrivee',
      lieu: lieux[0]!,
      quoi: 'photos du dépôt',
      arriveLe: "now() - interval '5 minutes'",
    },
    {
      etat: 'reprise_demandee',
      lieu: lieux[1]!,
      quoi: 'photos du retour',
      arriveLe: 'null',
    },
  ] as const;

  for (const e of etapes) {
    const [{ n }] = await interroger<{ n: string }>(
      'select count(*) as n from stationnement where cycliste_id = $1 and etat = $2',
      [moi.id, e.etat],
    );
    if (Number(n) > 0) {
      process.stdout.write(`· une garde « ${e.etat} » existe déjà\n`);
      continue;
    }

    await interroger(
      `insert into stationnement (
         emplacement_id, cycliste_id, etat, debut, fin, type_velo, message,
         demande_le, repondu_le, arrive_le, depose_le
       ) values (
         $1, $2, $3,
         now() - interval '1 hour', now() + interval '3 hours',
         'Ville', 'Je suis devant la porte.',
         now() - interval '1 day', now() - interval '23 hours',
         ${e.arriveLe},
         ${e.etat === 'reprise_demandee' ? "now() - interval '1 hour'" : 'null'}
       )`,
      [e.lieu.id, moi.id, e.etat],
    );
    process.stdout.write(
      `· garde « ${e.etat} » créée à ${e.lieu.quartier} → ${e.quoi}\n`,
    );
  }
  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
