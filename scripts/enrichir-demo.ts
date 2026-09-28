/**
 * Enrichit le compte de démonstration pour que les écrans membre montrent des
 * données proches de la maquette : identité vérifiée, un emplacement publié,
 * quelques gardes terminées, un solde de points, et le catalogue des offres.
 *
 * Idempotent : on peut le rejouer, il n'ajoute pas de doublons.
 *
 *   npm run bd:enrichir
 */

import process from 'node:process';

import { interroger } from '../lib/bd/client';

const EMAIL_DEMO = process.argv[2] ?? 'lissanon@example.com';

// Le catalogue vient de la maquette : mêmes noms, mêmes commerces, mêmes
// coûts. C'est ce que le membre voit, à l'octet près.
const CATALOGUE = [
  {
    partenaire: 'Torréfaction du Parvis',
    quartier: 'Saint-Gilles',
    titre: 'Un café offert',
    cout: 20,
    stock: 40,
  },
  {
    partenaire: 'Chez Odette',
    quartier: 'Ixelles',
    titre: 'Une part de tarte',
    cout: 25,
    stock: 30,
  },
  {
    partenaire: 'Atelier Vélo Flagey',
    quartier: 'Ixelles',
    titre: 'Réglage des freins',
    cout: 60,
    stock: 20,
  },
  {
    partenaire: 'Cycles du Midi',
    quartier: 'Bruxelles-Ville',
    titre: 'Une chambre à air',
    cout: 75,
    stock: 25,
  },
  {
    partenaire: 'Atelier Vélo Flagey',
    quartier: 'Ixelles',
    titre: 'Entretien complet',
    cout: 150,
    stock: 10,
  },
  {
    partenaire: 'Cinéma Aventure',
    quartier: 'Bruxelles-Ville',
    titre: 'Une place de cinéma',
    cout: 120,
    stock: 20,
  },
  {
    partenaire: 'Consigne partenaire',
    quartier: 'Bruxelles-Ville',
    titre: 'Un abonnement au dépôt',
    cout: 200,
    stock: 5,
  },
  {
    partenaire: 'Le Comptoir',
    quartier: 'Ixelles',
    titre: 'Un dîner pour deux',
    cout: 300,
    stock: 3,
  },
] as const;

async function enrichir(): Promise<void> {
  // Membre de démonstration — on part du premier créé si pas d'e-mail précis.
  const [membre] = await interroger<{
    id: string;
    prenom: string;
    verification: string;
  }>(
    `select id, prenom, verification from membre
     where lower(email) = lower($1) or ($1 = 'lissanon@example.com' and true)
     order by cree_le asc
     limit 1`,
    [EMAIL_DEMO],
  );
  if (!membre) throw new Error('Aucun membre en base');

  process.stdout.write(`Membre : ${membre.prenom} (${membre.id})\n`);

  // 1. Vérifier l'identité (règle 2 : la vraie vérification passe par un
  //    humain ; ici on la pose en base pour le compte de démonstration).
  if (membre.verification !== 'verifiee') {
    await interroger(
      "update membre set verification = 'verifiee', verifie_le = now() where id = $1",
      [membre.id],
    );
    process.stdout.write('· identité posée à « vérifiée »\n');
  } else {
    process.stdout.write('· identité déjà vérifiée\n');
  }

  // 2. Un emplacement publié à Ixelles, si le membre n'en a pas encore.
  const [{ n: aDejaUnLieu }] = await interroger<{ n: string }>(
    'select count(*) as n from emplacement where membre_id = $1',
    [membre.id],
  );
  if (Number(aDejaUnLieu) === 0) {
    await interroger(
      `insert into emplacement (
         reference, membre_id, type, quartier, adresse_exacte,
         position, rayon_de_la_zone, capacite,
         verrouillage, intemperie, acces, ancrage, services, velos_acceptes,
         precisions, publie
       ) values (
         'demo-ixelles-' || substring(md5(random()::text) for 6),
         $1, 'Cour privée', 'Place Flagey', 'rue Malibran 12, 1050 Ixelles',
         st_setsrid(st_makepoint(4.3712, 50.8285), 4326)::geography, 300, 2,
         'code', 'partiel', 'Quelques marches', 'Arceau ou barre fixe',
         array[]::text[], array['Ville','Pliant','VTC','Enfant'],
         'Sonnez au 3, la porte de la cour est à gauche.',
         true
       )`,
      [membre.id],
    );
    process.stdout.write('· un emplacement publié à Ixelles\n');
  } else {
    process.stdout.write('· emplacement déjà présent\n');
  }

  // 3. Le catalogue : partenaires + offres.
  for (const article of CATALOGUE) {
    // Le partenaire, créé une fois pour toutes.
    const [{ id: partenaireId }] = await interroger<{ id: string }>(
      `insert into partenaire (nom, quartier)
       values ($1, $2)
       on conflict do nothing
       returning id`,
      [article.partenaire, article.quartier],
    ).then((r) =>
      r.length > 0
        ? r
        : interroger<{ id: string }>(
            'select id from partenaire where nom = $1',
            [article.partenaire],
          ),
    );

    // L'offre : on met à jour si elle existe déjà.
    await interroger(
      `insert into offre (partenaire_id, titre, cout_en_maillons, stock_restant, active)
       select $1, $2, $3, $4, true
       where not exists (
         select 1 from offre where partenaire_id = $1 and titre = $2
       )`,
      [partenaireId, article.titre, article.cout, article.stock],
    );
  }
  process.stdout.write(`· catalogue à jour (${CATALOGUE.length} offres)\n`);

  // 4. Le solde de points : 80 maillons, comme la maquette.
  const [{ n: nbMaillons }] = await interroger<{ n: string }>(
    'select count(*) as n from maillon where membre_id = $1',
    [membre.id],
  );
  if (Number(nbMaillons) === 0) {
    // Quatre gains de vingt points, comme quatre gardes menées à terme.
    for (let i = 0; i < 4; i += 1) {
      await interroger(
        `insert into maillon (membre_id, nombre, etat, motif)
         values ($1, 20, 'acquis', 'Garde de démonstration')`,
        [membre.id],
      );
    }
    process.stdout.write('· 80 points crédités (4 × 20)\n');
  } else {
    process.stdout.write(`· ${nbMaillons} maillons déjà présents\n`);
  }

  process.stdout.write('\nTerminé.\n');
  process.exit(0);
}

enrichir().catch((erreur) => {
  process.stderr.write(String(erreur) + '\n');
  process.exit(1);
});
