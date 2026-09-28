/**
 * Deux cas limites de démonstration, côté bike sitter :
 *  — une garde « en_cours » dont l'heure de fin est passée, pour l'écran
 *    « vélo non récupéré » ;
 *  — l'écran « personne au rendez-vous » s'atteint depuis la garde acceptée
 *    qui existe déjà.
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
  if (!moi) throw new Error('Compte introuvable');

  const [lieu] = await interroger<{ id: string }>(
    'select id from emplacement where membre_id = $1 order by cree_le limit 1',
    [moi.id],
  );
  if (!lieu) throw new Error('Pas d’emplacement');

  const [cycliste] = await interroger<{ id: string; prenom: string }>(
    "select id, prenom from membre where lower(email) = 'yanis.benali@exemple.be'",
  );
  if (!cycliste) throw new Error('Pas de cycliste de démonstration');

  const [{ n }] = await interroger<{ n: string }>(
    `select count(*) as n from stationnement
      where emplacement_id = $1 and etat = 'en_cours' and fin < now()`,
    [lieu.id],
  );
  if (Number(n) > 0) {
    process.stdout.write('· une garde dépassée existe déjà\n');
  } else {
    await interroger(
      `insert into stationnement (
         emplacement_id, cycliste_id, etat, debut, fin, type_velo, message,
         demande_le, repondu_le, arrive_le, depose_le
       ) values (
         $1, $2, 'en_cours',
         now() - interval '6 hours', now() - interval '70 minutes',
         'Ville', 'Je repasse en fin de journée.',
         now() - interval '1 day', now() - interval '23 hours',
         now() - interval '6 hours', now() - interval '6 hours'
       )`,
      [lieu.id, cycliste.id],
    );
    process.stdout.write(
      `· garde dépassée créée : ${cycliste.prenom} devait reprendre il y a 1 h 10\n`,
    );
  }

  // Les identifiants utiles, pour tester directement.
  const cas = await interroger<{ id: string; etat: string; role: string }>(
    `select s.id, s.etat,
            case when s.cycliste_id = $1 then 'cycliste' else 'bike_sitter' end as role
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
      where (s.cycliste_id = $1 or e.membre_id = $1)
      order by s.demande_le desc`,
    [moi.id],
  );
  process.stdout.write('\nGardes du compte :\n');
  for (const c of cas) {
    process.stdout.write(`  ${c.id}  ${c.etat.padEnd(18)} ${c.role}\n`);
  }
  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
