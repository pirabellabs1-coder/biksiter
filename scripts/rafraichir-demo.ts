/**
 * Remet les données du compte de démonstration à la date du jour.
 *
 * Les gardes de démonstration vieillissent : au bout d'un jour, les demandes
 * expirent et la garde acceptée paraît « en retard ». Avant chaque
 * présentation, ce script replace tout dans l'avenir proche :
 *   - côté bike sitter : les demandes de Camille et de Yanis, à traiter,
 *     pour demain matin et demain après-midi ;
 *   - côté cycliste : la garde acceptée, dans quelques heures.
 *
 *   npx tsx --env-file-if-exists=.env.local scripts/rafraichir-demo.ts
 */
import process from 'node:process';

import { interroger } from '../lib/bd/client';

const EMAIL = 'demo@bikesitters.be';

/** Un instant à Bruxelles : aujourd'hui + `jours`, à `heure` h. */
const aBruxelles = (jours: number, heure: number) =>
  `((date_trunc('day', now() at time zone 'Europe/Brussels')
      + interval '${jours} day' + interval '${heure} hour') at time zone 'Europe/Brussels')`;

async function main(): Promise<void> {
  const [moi] = await interroger<{ id: string }>(
    'select id from membre where lower(email) = lower($1)',
    [EMAIL],
  );
  if (!moi) throw new Error('Compte de démonstration absent : lancez scripts/compte-demo.ts');

  const [lieu] = await interroger<{ id: string }>(
    'select id from emplacement where membre_id = $1 order by cree_le limit 1',
    [moi.id],
  );
  if (!lieu) throw new Error('Emplacement de démonstration absent');

  // --- Côté bike sitter : deux demandes à traiter, demain -----------------
  const demandeurs = await interroger<{ id: string; prenom: string }>(
    `select id, prenom from membre
      where lower(email) in ('camille.renard@exemple.be', 'yanis.benali@exemple.be')
      order by prenom`,
  );
  for (const [rang, qui] of demandeurs.entries()) {
    const heure = rang === 0 ? 10 : 15;
    const lignes = await interroger<{ id: string }>(
      `update stationnement
          set etat = 'demande',
              debut = ${aBruxelles(1, heure)},
              fin = ${aBruxelles(1, heure + 3)},
              demande_le = now() - interval '${rang === 0 ? 90 : 240} minutes',
              repondu_le = null, depose_le = null, repris_le = null,
              annule_le = null, arrive_le = null, retard_annonce_le = null,
              motif = null, desistement_tardif = false
        where emplacement_id = $1 and cycliste_id = $2
        returning id`,
      [lieu.id, qui.id],
    );
    process.stdout.write(
      lignes.length > 0
        ? `· demande de ${qui.prenom} : demain à ${heure} h\n`
        : `· aucune demande de ${qui.prenom} à rafraîchir (lancez compte-demo.ts)\n`,
    );
  }

  // --- Côté cycliste : la garde acceptée, dans quelques heures ------------
  // Pendant la journée, dans trois heures ; le soir, demain à 11 h.
  const gardes = await interroger<{ id: string }>(
    `select s.id from stationnement s
       join emplacement e on e.id = s.emplacement_id
      where s.cycliste_id = $1 and e.membre_id <> $1
      order by s.demande_le desc
      limit 1`,
    [moi.id],
  );
  const garde = gardes[0];
  if (garde) {
    await interroger('delete from code_de_remise where stationnement_id = $1', [garde.id]);
    await interroger('delete from constat where stationnement_id = $1', [garde.id]);
    await interroger(
      `update stationnement
          set etat = 'accepte',
              debut = case
                when extract(hour from now() at time zone 'Europe/Brussels') between 6 and 17
                  then date_trunc('hour', now()) + interval '3 hours'
                else ${aBruxelles(1, 11)}
              end,
              fin = case
                when extract(hour from now() at time zone 'Europe/Brussels') between 6 and 17
                  then date_trunc('hour', now()) + interval '6 hours'
                else ${aBruxelles(1, 14)}
              end,
              demande_le = now() - interval '6 hours',
              repondu_le = now() - interval '5 hours',
              depose_le = null, repris_le = null, annule_le = null,
              arrive_le = null, retard_annonce_le = null, motif = null,
              desistement_tardif = false
        where id = $1`,
      [garde.id],
    );
    process.stdout.write('· garde acceptée côté cycliste : remise dans l’avenir proche\n');
  }

  process.stdout.write('\nDonnées de démonstration à jour.\n');
  process.exit(0);
}

main().catch((erreur) => {
  process.stderr.write(String(erreur) + '\n');
  process.exit(1);
});
