/**
 * Remplit ce qui restait vide : messagerie, notifications, favoris.
 *
 * Une page qui répond mais ne montre rien laisse croire que la
 * fonctionnalité manque. Ces quelques lignes suffisent à parcourir
 * l'application de bout en bout.
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

  // --- Messagerie : un échange sur chaque garde en cours ------------------
  const gardes = await interroger<{
    id: string;
    autre: string;
    autrePrenom: string;
  }>(
    `select s.id,
            case when s.cycliste_id = $1 then e.membre_id else s.cycliste_id end as autre,
            m.prenom as "autrePrenom"
       from stationnement s
       join emplacement e on e.id = s.emplacement_id
       join membre m on m.id = case when s.cycliste_id = $1 then e.membre_id else s.cycliste_id end
      where (s.cycliste_id = $1 or e.membre_id = $1)
        and s.etat in ('accepte', 'arrivee', 'en_cours', 'reprise_demandee')`,
    [moi.id],
  );

  let messages = 0;
  for (const g of gardes) {
    const [{ n }] = await interroger<{ n: string }>(
      'select count(*) as n from message where stationnement_id = $1',
      [g.id],
    );
    if (Number(n) > 0) continue;

    await interroger(
      `insert into message (stationnement_id, auteur_id, corps, ecrit_le) values
         ($1, $2, $3, now() - interval '3 hours'),
         ($1, $4, $5, now() - interval '2 hours'),
         ($1, $2, $6, now() - interval '1 hour')`,
      [
        g.id,
        g.autre,
        'Bonjour ! C’est bien confirmé pour tout à l’heure ?',
        moi.id,
        'Oui, tout est prêt. Sonnez en arrivant, je descends.',
        'Parfait, à tout à l’heure. Merci beaucoup !',
      ],
    );
    messages += 3;
  }
  process.stdout.write(`· ${messages} messages écrits\n`);

  // --- Notifications ------------------------------------------------------
  const [{ n: dejaNotifs }] = await interroger<{ n: string }>(
    'select count(*) as n from notification where membre_id = $1',
    [moi.id],
  );
  if (Number(dejaNotifs) === 0) {
    await interroger(
      `insert into notification (membre_id, texte, lien, urgente, creee_le) values
         ($1, 'Camille a demandé une garde pour demain après-midi.', '/demandes', false, now() - interval '2 hours'),
         ($1, 'Yanis a demandé une garde pour jeudi.', '/demandes', false, now() - interval '5 hours'),
         ($1, 'Votre identité est vérifiée. Vous pouvez publier un emplacement.', '/mes-lieux', false, now() - interval '1 day'),
         ($1, 'Une garde s’est terminée. Vous pouvez laisser un avis.', '/profil/avis', false, now() - interval '2 days'),
         ($1, 'Vous avez atteint 80 points. Le catalogue s’ouvre à vous.', '/catalogue', false, now() - interval '3 days')`,
      [moi.id],
    );
    process.stdout.write('· 5 notifications créées\n');
  } else {
    process.stdout.write(`· ${dejaNotifs} notifications déjà là\n`);
  }

  // --- Favoris : deux emplacements enregistrés ----------------------------
  const [{ n: dejaFav }] = await interroger<{ n: string }>(
    'select count(*) as n from favori where membre_id = $1',
    [moi.id],
  );
  if (Number(dejaFav) === 0) {
    const autres = await interroger<{ id: string }>(
      `select id from emplacement where membre_id <> $1 and publie
        order by cree_le limit 2`,
      [moi.id],
    );
    for (const e of autres) {
      await interroger(
        'insert into favori (membre_id, emplacement_id) values ($1, $2) on conflict do nothing',
        [moi.id, e.id],
      );
    }
    process.stdout.write(`· ${autres.length} favoris enregistrés\n`);
  } else {
    process.stdout.write(`· ${dejaFav} favoris déjà là\n`);
  }

  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
