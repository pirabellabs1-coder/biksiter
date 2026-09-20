import { describe, expect, test } from 'vitest';

import {
  adresseVisible,
  ONGLETS_DES_GARDES,
  ongletDeLEtat,
  codeDuRefus,
  demandeExpiree,
  peutSignalerSonArrivee,
  REFUS_D_UN_GESTE,
  blocageCoupeLaConversation,
  conversationOuverte,
  DETENTEUR_DU_CODE,
  estEnRetardAuDepot,
  estUnDesistementTardif,
  gestesPossibles,
  peutDeclarerLAbsence,
  peutRepartirSansDeposer,
  telephoneVisible,
  transitionPermise,
} from './garde';

const minutes = (n: number) => n * 60 * 1000;
const DEBUT = new Date('2026-09-14T12:00:00Z');

describe('le déroulé d’une garde', () => {
  test('seul le bike sitter accepte ou refuse une demande', () => {
    expect(transitionPermise('demande', 'accepter', 'bike_sitter')?.vers).toBe(
      'accepte',
    );
    expect(transitionPermise('demande', 'accepter', 'cycliste')).toBeNull();
    expect(transitionPermise('demande', 'refuser', 'cycliste')).toBeNull();
  });

  test('le cycliste peut annuler sa demande avant toute réponse', () => {
    expect(transitionPermise('demande', 'annuler', 'cycliste')?.vers).toBe(
      'annule',
    );
  });

  test('le vélo reçu fait passer la garde en cours, et c’est le bike sitter qui le reçoit', () => {
    expect(transitionPermise('arrivee', 'recevoir', 'bike_sitter')?.vers).toBe(
      'en_cours',
    );
    expect(transitionPermise('arrivee', 'recevoir', 'cycliste')).toBeNull();
  });

  test('la restitution clôt la garde, confirmée par le cycliste', () => {
    expect(
      transitionPermise('reprise_demandee', 'restituer', 'cycliste')?.vers,
    ).toBe('termine');
  });

  test('une garde terminée, refusée ou en litige n’offre plus aucun geste', () => {
    for (const etat of [
      'termine',
      'refuse',
      'annule',
      'expire',
      'litige',
    ] as const) {
      expect(gestesPossibles(etat, 'cycliste')).toEqual([]);
      expect(gestesPossibles(etat, 'bike_sitter')).toEqual([]);
    }
  });

  test('règle 5 — celui qui remet le vélo détient le code', () => {
    expect(DETENTEUR_DU_CODE.depot).toBe('cycliste');
    expect(DETENTEUR_DU_CODE.reprise).toBe('bike_sitter');
  });

  test('règle 4 — l’adresse exacte n’existe qu’après acceptation', () => {
    const moment = { reprisLe: null, maintenant: DEBUT };
    expect(adresseVisible('demande', moment)).toBe(false);
    expect(adresseVisible('refuse', moment)).toBe(false);
    expect(adresseVisible('annule', moment)).toBe(false);
    expect(adresseVisible('expire', moment)).toBe(false);
    expect(adresseVisible('accepte', moment)).toBe(true);
    expect(adresseVisible('en_cours', moment)).toBe(true);
  });

  test('règle 4 — l’adresse disparaît deux heures après la reprise', () => {
    const reprisLe = DEBUT;
    const apres = (m: number) => new Date(DEBUT.getTime() + minutes(m));
    expect(adresseVisible('termine', { reprisLe, maintenant: apres(90) })).toBe(true);
    expect(adresseVisible('termine', { reprisLe, maintenant: apres(121) })).toBe(false);
  });

  test('règle 4 — pendant un litige, l’adresse reste lisible tant que le vélo n’est pas repris', () => {
    expect(adresseVisible('litige', { reprisLe: null, maintenant: DEBUT })).toBe(true);
    expect(adresseVisible('litige', { reprisLe: DEBUT, maintenant: DEBUT })).toBe(false);
  });

  test('une conversation se referme quatorze jours après la reprise', () => {
    const jours = (n: number) => new Date(DEBUT.getTime() + n * 24 * 60 * minutes(1));
    expect(conversationOuverte('demande', { reprisLe: null, maintenant: DEBUT })).toBe(true);
    expect(conversationOuverte('termine', { reprisLe: DEBUT, maintenant: jours(13) })).toBe(true);
    expect(conversationOuverte('termine', { reprisLe: DEBUT, maintenant: jours(15) })).toBe(false);
    expect(conversationOuverte('refuse', { reprisLe: null, maintenant: DEBUT })).toBe(false);
  });

  test('un blocage coupe la conversation, sauf quand un vélo est en jeu', () => {
    expect(blocageCoupeLaConversation('demande')).toBe(true);
    expect(blocageCoupeLaConversation('termine')).toBe(true);
    expect(blocageCoupeLaConversation('en_cours')).toBe(false);
    expect(blocageCoupeLaConversation('litige')).toBe(false);
  });

  test('le numéro de l’autre se referme à la clôture, mais reste ouvert pendant un litige', () => {
    expect(telephoneVisible('accepte')).toBe(true);
    expect(telephoneVisible('termine')).toBe(false);
    expect(telephoneVisible('litige')).toBe(true);
  });

  test('une annulation à moins de deux heures du dépôt est un désistement tardif', () => {
    expect(
      estUnDesistementTardif(DEBUT, new Date(DEBUT.getTime() - minutes(90))),
    ).toBe(true);
    expect(
      estUnDesistementTardif(DEBUT, new Date(DEBUT.getTime() - minutes(180))),
    ).toBe(false);
  });

  test('on ne repart sans déposer qu’après vingt minutes d’attente devant la porte', () => {
    expect(
      peutRepartirSansDeposer(DEBUT, new Date(DEBUT.getTime() + minutes(19))),
    ).toBe(false);
    expect(
      peutRepartirSansDeposer(DEBUT, new Date(DEBUT.getTime() + minutes(20))),
    ).toBe(true);
  });

  test('l’absence du cycliste ne se déclare qu’une fois l’heure de dépôt dépassée de trente minutes', () => {
    expect(
      peutDeclarerLAbsence(
        'accepte',
        DEBUT,
        new Date(DEBUT.getTime() + minutes(10)),
      ),
    ).toBe(false);
    expect(
      peutDeclarerLAbsence(
        'accepte',
        DEBUT,
        new Date(DEBUT.getTime() + minutes(31)),
      ),
    ).toBe(true);
    expect(
      estEnRetardAuDepot(
        'accepte',
        DEBUT,
        new Date(DEBUT.getTime() + minutes(31)),
      ),
    ).toBe(true);
  });

  test('une demande expire après vingt-quatre heures, ou quand l’heure du dépôt est passée', () => {
    const demandeLe = new Date(DEBUT.getTime() - minutes(60 * 30));
    expect(demandeExpiree(demandeLe, DEBUT, new Date(demandeLe.getTime() + minutes(60 * 23)))).toBe(false);
    expect(demandeExpiree(demandeLe, DEBUT, new Date(demandeLe.getTime() + minutes(60 * 24)))).toBe(true);
    const recente = new Date(DEBUT.getTime() - minutes(30));
    expect(demandeExpiree(recente, DEBUT, new Date(DEBUT.getTime() + minutes(1)))).toBe(true);
  });

  test('on signale son arrivée au plus tôt une demi-heure avant le dépôt', () => {
    const FIN = new Date(DEBUT.getTime() + minutes(180));
    expect(peutSignalerSonArrivee(DEBUT, FIN, new Date(DEBUT.getTime() - minutes(31)))).toBe(false);
    expect(peutSignalerSonArrivee(DEBUT, FIN, new Date(DEBUT.getTime() - minutes(29)))).toBe(true);
    expect(peutSignalerSonArrivee(DEBUT, FIN, new Date(FIN.getTime() + minutes(1)))).toBe(false);
  });

  test('un refus de geste se retrouve par son code, et seulement pour une phrase connue', () => {
    expect(codeDuRefus(REFUS_D_UN_GESTE.pause)).toBe('pause');
    expect(codeDuRefus('Une phrase venue d’ailleurs')).toBeNull();
  });

  test('chaque état d’une garde tombe dans un seul onglet de « Mes gardes »', () => {
    const etats = [
      'demande', 'accepte', 'arrivee', 'en_cours', 'reprise_demandee',
      'termine', 'refuse', 'annule', 'expire', 'litige',
    ] as const;
    for (const etat of etats) {
      const onglets = ONGLETS_DES_GARDES.filter((o) =>
        (o.etats as readonly string[]).includes(etat),
      );
      expect(onglets).toHaveLength(1);
      expect(ongletDeLEtat(etat)).toBe(onglets[0]!.cle);
    }
  });
});
