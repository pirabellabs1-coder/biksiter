import { describe, expect, test } from 'vitest';

import {
  bienvenue,
  candidatureRecue,
  demandeAcceptee,
  demandeRecue,
  demandeRefusee,
  desistement,
  inscriptionSurLaListe,
} from './modeles';

const CRENEAU = 'le mardi 8 septembre 2026, de 09:00 à 18:00';
const ADRESSE = 'rue Malibran 12, 1050 Ixelles';

describe('règle 4 — l’adresse n’apparaît que dans le message d’acceptation', () => {
  test('le message d’acceptation contient l’adresse exacte', () => {
    const message = demandeAcceptee({
      prenomDuCycliste: 'Lucas',
      prenomDuBikeSitter: 'Manoelle',
      creneau: CRENEAU,
      adresse: ADRESSE,
    });

    expect(message.corps).toContain(ADRESSE);
  });

  test('le message envoyé au bike sitter à la réception d’une demande ne contient aucune adresse', () => {
    const message = demandeRecue({
      prenomDuBikeSitter: 'Manoelle',
      prenomDuCycliste: 'Lucas',
      creneau: CRENEAU,
      typeVelo: 'Ville',
      message: null,
    });

    expect(message.corps).not.toContain(ADRESSE);
    expect(message.corps).toContain('que si vous acceptez');
  });

  test('le message de refus ne contient aucune adresse', () => {
    const message = demandeRefusee({
      prenomDuCycliste: 'Lucas',
      prenomDuBikeSitter: 'Manoelle',
      creneau: CRENEAU,
    });

    expect(message.corps).not.toContain(ADRESSE);
  });
});

describe('règle 3 — aucun message ne parle de note ni de classement', () => {
  const tous = [
    inscriptionSurLaListe({ quartier: 'Ixelles', peutAccueillir: true }),
    candidatureRecue({ prenom: 'Thomas' }),
    bienvenue({ prenom: 'Lucas', invitePar: 'Manoelle' }),
    demandeRecue({
      prenomDuBikeSitter: 'Manoelle',
      prenomDuCycliste: 'Lucas',
      creneau: CRENEAU,
      typeVelo: 'Cargo',
      message: 'Bonjour, je passe la journée en centre-ville.',
    }),
    demandeAcceptee({
      prenomDuCycliste: 'Lucas',
      prenomDuBikeSitter: 'Manoelle',
      creneau: CRENEAU,
      adresse: ADRESSE,
    }),
    demandeRefusee({
      prenomDuCycliste: 'Lucas',
      prenomDuBikeSitter: 'Manoelle',
      creneau: CRENEAU,
    }),
    desistement({
      prenomDuDestinataire: 'Manoelle',
      prenomDeCeluiQuiSeDesiste: 'Lucas',
      creneau: CRENEAU,
      tardif: true,
    }),
  ];

  test('aucun message ne demande d’évaluer, de noter ou de donner un avis', () => {
    // Le mot « note » n'est pas interdit en soi : un message dit justement
    // qu'il n'y a ni note ni classement, et c'est ce qu'on veut lire. Ce qui
    // est interdit, c'est de solliciter une évaluation.
    const sollicitation =
      /notez |évaluez |donnez une note|attribuez|laissez un avis|votre avis sur|combien d’étoiles/;

    for (const message of tous) {
      const texte = `${message.sujet} ${message.corps}`.toLowerCase();
      expect(texte).not.toMatch(sollicitation);
    }
  });

  test('chaque message a un sujet et un corps non vides, et signe l’association', () => {
    for (const message of tous) {
      expect(message.sujet.trim().length).toBeGreaterThan(0);
      expect(message.corps.trim().length).toBeGreaterThan(0);
      expect(message.corps).toContain('Bike Sitters');
    }
  });

  test('aucun message n’est en HTML : il n’y a pas de balise', () => {
    for (const message of tous) {
      expect(message.corps).not.toMatch(/<[a-z][^>]*>/i);
    }
  });
});

describe('le désistement tardif s’excuse sans punir', () => {
  test('un désistement tardif présente des excuses et dit qu’il n’y a pas de pénalité', () => {
    const message = desistement({
      prenomDuDestinataire: 'Manoelle',
      prenomDeCeluiQuiSeDesiste: 'Lucas',
      creneau: CRENEAU,
      tardif: true,
    });

    expect(message.corps).toContain('désolés');
    expect(message.corps).toContain('aucune pénalité');
  });

  test('un désistement à temps ne parle ni d’excuses ni de pénalité', () => {
    const message = desistement({
      prenomDuDestinataire: 'Manoelle',
      prenomDeCeluiQuiSeDesiste: 'Lucas',
      creneau: CRENEAU,
      tardif: false,
    });

    expect(message.corps).not.toContain('pénalité');
    expect(message.corps).toContain('de nouveau libre');
  });
});

describe('la liste d’attente dit au bike sitter que c’est lui qui compte', () => {
  test('un inscrit qui peut accueillir lit que ce sont les bike sitters qui font ouvrir un quartier', () => {
    const message = inscriptionSurLaListe({
      quartier: 'Saint-Gilles',
      peutAccueillir: true,
    });

    expect(message.corps).toContain('bike sitters');
    expect(message.corps).toContain('Saint-Gilles');
  });
});
