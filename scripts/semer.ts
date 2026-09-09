/**
 * Remplit une base vide de quoi parcourir le site.
 *
 * Ce sont des données de démonstration, pas des données réelles : le script
 * refuse de tourner si la table `membre` n'est pas vide, pour qu'il ne puisse
 * pas être lancé par mégarde sur autre chose qu'un poste de développement.
 *
 *   npm run bd:semer
 */

import process from 'node:process';

import { Pool } from 'pg';

import { QUARTIERS } from '../lib/contenu/quartiers';
import { empreinteDuMotDePasse } from '../lib/securite/mot-de-passe';

const MOT_DE_PASSE_DE_DEMONSTRATION = 'un velo a l abri';

const MEMBRES = [
  // Thomas modère : sans au moins une personne qui relit les pièces, la
  // règle 2 bloque tout le monde et le jeu de démonstration est inutilisable.
  { prenom: 'Thomas', nom: 'Lemaire', email: 'thomas@exemple.be', modere: true },
  { prenom: 'Manoelle', nom: 'Dubois', email: 'manoelle@exemple.be', modere: false },
  { prenom: 'Yanis', nom: 'Benali', email: 'yanis@exemple.be', modere: false },
  { prenom: 'Aïcha', nom: 'Traoré', email: 'aicha@exemple.be', modere: false },
];

const EMPLACEMENTS = [
  {
    proprietaire: 'thomas@exemple.be',
    reference: 'bruxelles-central-thomas',
    quartier: 'Bruxelles-Central',
    type: 'Garage privé fermé',
    adresse: 'rue de l’Écuyer 8, 1000 Bruxelles',
    capacite: 3,
    verrouillage: 'cle',
    intemperie: 'interieur',
    acces: 'Plain-pied',
    ancrage: 'Ancrage mural',
    services: ['Gonflage des pneus'],
    velos: ['Ville', 'Route', 'VTC', 'Électrique', 'Cargo'],
    precisions: 'Porte latérale à gauche du garage, sonnez au 2.',
  },
  {
    proprietaire: 'manoelle@exemple.be',
    reference: 'place-flagey-manoelle',
    quartier: 'Place Flagey',
    type: 'Cour privée',
    adresse: 'rue Malibran 12, 1050 Ixelles',
    capacite: 2,
    verrouillage: 'code',
    intemperie: 'partiel',
    acces: 'Quelques marches',
    ancrage: 'Arceau ou barre fixe',
    services: [],
    velos: ['Ville', 'Pliant', 'VTC', 'Enfant'],
    precisions: null,
  },
  {
    proprietaire: 'yanis@exemple.be',
    reference: 'parvis-de-saint-gilles-yanis',
    quartier: 'Parvis de Saint-Gilles',
    type: 'Cave privative',
    adresse: 'rue de Bosnie 41, 1060 Saint-Gilles',
    capacite: 1,
    verrouillage: 'cle',
    intemperie: 'interieur',
    acces: 'Escalier',
    ancrage: 'Ancrage au sol',
    services: ['Petit outillage à disposition'],
    velos: ['Ville', 'Route', 'Pliant', 'Gravel'],
    precisions: 'Escalier raide : un cargo ne passe pas.',
  },
  {
    proprietaire: 'aicha@exemple.be',
    reference: 'gare-du-nord-aicha',
    quartier: 'Gare du Nord',
    type: 'Box de garage individuel',
    adresse: 'rue du Progrès 210, 1030 Schaerbeek',
    capacite: 4,
    verrouillage: 'cle',
    intemperie: 'interieur',
    acces: 'Rampe',
    ancrage: 'Râtelier fixe',
    services: ['Recharge VAE', 'Gonflage des pneus'],
    velos: ['Ville', 'Route', 'VTT', 'VTC', 'Électrique', 'Cargo', 'Longtail'],
    precisions: null,
  },
];

/**
 * Des commerçants de quartier, et ce qu'ils offrent. Les vrais partenaires
 * remplaceront ceux-ci ; les montants en maillons sont à caler avec eux.
 */
const PARTENAIRES = [
  {
    nom: 'Cycles Delcourt',
    quartier: 'Ixelles',
    offres: [
      { titre: 'Contrôle vélo complet', cout: 25, stock: 8 },
      { titre: 'Réglage des freins', cout: 10, stock: 12 },
    ],
  },
  {
    nom: 'Vélo Sud',
    quartier: 'Saint-Gilles',
    offres: [{ titre: 'Antivol U certifié', cout: 40, stock: 3 }],
  },
  {
    nom: 'Le Comptoir',
    quartier: 'Flagey',
    offres: [{ titre: 'Café offert', cout: 5, stock: 20 }],
  },
  {
    nom: 'Atelier Flagey',
    quartier: 'Flagey',
    offres: [{ titre: 'Nettoyage complet', cout: 15, stock: 6 }],
  },
];

/**
 * Trois gardes terminées chez Thomas, pour que le profil et le catalogue
 * montrent l'état « bike sitter » sans qu'on ait à jouer le parcours complet.
 */
const GARDES_PASSEES = [
  { cycliste: 'manoelle@exemple.be', jours: 2, velo: 'Cargo', ilYA: 1 },
  { cycliste: 'yanis@exemple.be', jours: 1, velo: 'Ville', ilYA: 4 },
  { cycliste: 'aicha@exemple.be', jours: 3, velo: 'Ville', ilYA: 7 },
];

async function semer(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL n’est pas défini.');
    process.exitCode = 1;
    return;
  }

  const reserve = new Pool({ connectionString: url });

  try {
    const dejaLa = await reserve.query<{ combien: string }>(
      'select count(*) as combien from membre',
    );

    if (Number(dejaLa.rows[0].combien) > 0) {
      console.error(
        'La table « membre » n’est pas vide : le script s’arrête plutôt que\n' +
          'de mélanger des données de démonstration à des données réelles.',
      );
      process.exitCode = 1;
      return;
    }

    const empreinte = await empreinteDuMotDePasse(MOT_DE_PASSE_DE_DEMONSTRATION);
    const identifiants = new Map<string, string>();

    for (const membre of MEMBRES) {
      const cree = await reserve.query<{ id: string }>(
        `insert into membre
           (prenom, nom, email, empreinte, verification, verifie_le, moderateur)
         values ($1, $2, $3, $4, 'verifiee', now(), $5)
         returning id`,
        [membre.prenom, membre.nom, membre.email, empreinte, membre.modere],
      );
      identifiants.set(membre.email, cree.rows[0].id);
    }

    for (const emplacement of EMPLACEMENTS) {
      const quartier = QUARTIERS.find((q) => q.nom === emplacement.quartier);
      if (!quartier) {
        throw new Error(`Quartier inconnu : ${emplacement.quartier}`);
      }

      await reserve.query(
        `insert into emplacement (
            membre_id, reference, type, quartier, adresse_exacte, position,
            rayon_de_la_zone, capacite, verrouillage, intemperie, acces,
            ancrage, services, velos_acceptes, precisions, publie)
         values ($1, $2, $3, $4, $5,
                 st_setsrid(st_makepoint($7, $6), 4326)::geography,
                 400, $8, $9, $10, $11, $12, $13, $14, $15, true)`,
        [
          identifiants.get(emplacement.proprietaire),
          emplacement.reference,
          emplacement.type,
          emplacement.quartier,
          emplacement.adresse,
          quartier.latitude,
          quartier.longitude,
          emplacement.capacite,
          emplacement.verrouillage,
          emplacement.intemperie,
          emplacement.acces,
          emplacement.ancrage,
          emplacement.services,
          emplacement.velos,
          emplacement.precisions,
        ],
      );
    }

    // Deux invitations par membre, de quoi essayer le parcours d'inscription.
    for (const [email, id] of identifiants) {
      const prefixe = email.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
      for (let numero = 1; numero <= 2; numero += 1) {
        await reserve.query(
          'insert into invitation (code, emise_par) values ($1, $2)',
          [`${prefixe}-000${numero}`, id],
        );
      }
    }

    // Les partenaires et leurs remerciements.
    for (const partenaire of PARTENAIRES) {
      const cree = await reserve.query<{ id: string }>(
        'insert into partenaire (nom, quartier) values ($1, $2) returning id',
        [partenaire.nom, partenaire.quartier],
      );
      for (const offre of partenaire.offres) {
        await reserve.query(
          `insert into offre (partenaire_id, titre, cout_en_maillons, stock_restant)
           values ($1, $2, $3, $4)`,
          [cree.rows[0].id, offre.titre, offre.cout, offre.stock],
        );
      }
    }

    // Des gardes terminées chez Thomas, avec les maillons qu'elles ont valus.
    const chezThomas = await reserve.query<{ id: string }>(
      "select id from emplacement where reference = 'bruxelles-central-thomas'",
    );

    for (const garde of GARDES_PASSEES) {
      const stationnement = await reserve.query<{ id: string }>(
        `insert into stationnement
           (emplacement_id, cycliste_id, debut, fin, type_velo, etat,
            repondu_le, depose_le, repris_le)
         values ($1, $2,
                 now() - ($3 || ' days')::interval,
                 now() - ($3 || ' days')::interval + ($4 || ' days')::interval,
                 $5, 'termine',
                 now() - ($3 || ' days')::interval,
                 now() - ($3 || ' days')::interval,
                 now() - ($3 || ' days')::interval + ($4 || ' days')::interval)
         returning id`,
        [
          chezThomas.rows[0].id,
          identifiants.get(garde.cycliste),
          String(garde.ilYA),
          String(garde.jours),
          garde.velo,
        ],
      );

      // Le calcul suit lib/regles/maillons.ts : un maillon par jour entamé,
      // doublé pour un vélo encombrant.
      const encombrant = ['Cargo', 'Longtail', 'Tandem', 'Avec remorque'].includes(
        garde.velo,
      );
      await reserve.query(
        `insert into maillon (membre_id, stationnement_id, nombre, motif)
         values ($1, $2, $3, 'garde menée à bien')`,
        [
          identifiants.get('thomas@exemple.be'),
          stationnement.rows[0].id,
          garde.jours * (encombrant ? 2 : 1),
        ],
      );
    }

    const codes = await reserve.query<{ code: string }>(
      'select code from invitation order by code',
    );

    console.log(`${MEMBRES.length} membres vérifiés, ${EMPLACEMENTS.length} emplacements publiés.`);
    console.log(`Mot de passe commun : « ${MOT_DE_PASSE_DE_DEMONSTRATION} »`);
    console.log(`Codes d’invitation : ${codes.rows.map((l) => l.code).join(', ')}`);
    console.log('Thomas modère : connectez-vous avec lui pour voir /moderation.');
    console.log(`${PARTENAIRES.length} partenaires, ${GARDES_PASSEES.length} gardes passées chez Thomas.`);
  } finally {
    await reserve.end();
  }
}

semer().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exitCode = 1;
});
