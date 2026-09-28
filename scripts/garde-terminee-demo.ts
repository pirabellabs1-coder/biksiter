/**
 * Une garde terminée de démonstration, pour que l'écran d'avis soit
 * atteignable : sans garde close, il n'y a rien à noter.
 *
 *   npx tsx scripts/garde-terminee-demo.ts <email du bike sitter>
 */
import process from 'node:process';
import { interroger } from '../lib/bd/client';

const EMAIL = process.argv[2];
if (!EMAIL) throw new Error('Usage : <email du bike sitter>');

async function main(): Promise<void> {
  const [sitter] = await interroger<{ id: string; prenom: string }>(
    'select id, prenom from membre where lower(email) = lower($1)',
    [EMAIL],
  );
  if (!sitter) throw new Error(`Aucun membre pour ${EMAIL}`);

  const [lieu] = await interroger<{ id: string }>(
    'select id from emplacement where membre_id = $1 order by cree_le limit 1',
    [sitter.id],
  );
  if (!lieu) throw new Error('Pas d’emplacement');

  const [cycliste] = await interroger<{ id: string; prenom: string }>(
    "select id, prenom from membre where lower(email) = 'camille.renard@exemple.be'",
  );
  if (!cycliste) throw new Error('Pas de cycliste de démonstration');

  const [{ n }] = await interroger<{ n: string }>(
    `select count(*) as n from stationnement
      where emplacement_id = $1 and etat = 'termine'`,
    [lieu.id],
  );
  if (Number(n) > 0) {
    process.stdout.write('· une garde terminée existe déjà\n');
    process.exit(0);
  }

  await interroger(
    `insert into stationnement (
       emplacement_id, cycliste_id, etat, debut, fin, type_velo, message,
       demande_le, repondu_le, depose_le, repris_le
     ) values (
       $1, $2, 'termine',
       now() - interval '2 days' - interval '4 hours',
       now() - interval '2 days',
       'Ville', 'Merci beaucoup, c’était parfait.',
       now() - interval '3 days',
       now() - interval '3 days' + interval '20 minutes',
       now() - interval '2 days' - interval '4 hours',
       now() - interval '2 days'
     )`,
    [lieu.id, cycliste.id],
  );
  process.stdout.write(
    `· garde terminée créée avec ${cycliste.prenom} (il y a 2 jours)\n`,
  );
  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
