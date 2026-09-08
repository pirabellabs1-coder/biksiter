import 'server-only';

import { dansUneTransaction, interroger, uneLigne } from '@/lib/bd/client';
import { mettreEnFile } from '@/lib/courriel/file';
import {
  demandeAcceptee,
  demandeRecue,
  demandeRefusee,
  desistement,
} from '@/lib/courriel/modeles';
import { creneauEnFrancais } from '@/lib/temps';
import { laPlaceEstLibre, type Creneau } from '@/lib/regles/capacite';
import { estUnDesistementTardif } from '@/lib/regles/annulation';
import { ESSAIS_PAR_CODE, saisirLeCode, type Code } from '@/lib/regles/remise';
import { nouveauCodeDeRemise } from '@/lib/securite/jeton';
import type { TypeVelo } from '@/lib/regles/velos';

export type EtatDuStationnement =
  | 'demande'
  | 'accepte'
  | 'refuse'
  | 'annule'
  | 'en_cours'
  | 'termine';

export type Stationnement = {
  id: string;
  reference: string;
  cyclisteId: string;
  bikeSitterId: string;
  quartier: string;
  prenomDuBikeSitter: string;
  prenomDuCycliste: string;
  etat: EtatDuStationnement;
  debut: Date;
  fin: Date;
  typeVelo: TypeVelo;
  message: string | null;
};

const COLONNES = `
  s.id,
  e.reference,
  s.cycliste_id          as "cyclisteId",
  e.membre_id            as "bikeSitterId",
  e.quartier,
  bs.prenom              as "prenomDuBikeSitter",
  cy.prenom              as "prenomDuCycliste",
  s.etat,
  s.debut,
  s.fin,
  s.type_velo            as "typeVelo",
  s.message
`;

const JOINTURES = `
  from stationnement s
  join emplacement e on e.id = s.emplacement_id
  join membre bs on bs.id = e.membre_id
  join membre cy on cy.id = s.cycliste_id
`;

export class PlaceIndisponible extends Error {
  constructor() {
    super('L’emplacement est déjà pris sur ce créneau.');
    this.name = 'PlaceIndisponible';
  }
}

/**
 * La demande est écrite dans la même transaction que la vérification de
 * disponibilité, avec un verrou sur l'emplacement : sans cela, deux cyclistes
 * qui demandent la dernière place à la même seconde passeraient tous les deux.
 *
 * La règle de disponibilité elle-même vit dans lib/regles/capacite.ts — c'est
 * elle qui connaît la marge de trente minutes, et elle est testée là-bas.
 */
export async function demanderUnStationnement(demande: {
  reference: string;
  cyclisteId: string;
  debut: Date;
  fin: Date;
  typeVelo: TypeVelo;
  message: string | null;
}): Promise<string> {
  return dansUneTransaction(async (client) => {
    const emplacement = await client.query<{ id: string; capacite: number }>(
      'select id, capacite from emplacement where reference = $1 and publie for update',
      [demande.reference],
    );

    if (emplacement.rowCount === 0) {
      throw new Error('Cet emplacement n’existe pas ou n’est pas publié.');
    }

    const { id, capacite } = emplacement.rows[0];

    const acceptes = await client.query<{ debut: Date; fin: Date }>(
      `select debut, fin from stationnement
        where emplacement_id = $1 and etat in ('accepte', 'en_cours')`,
      [id],
    );

    const dejaPris: Creneau[] = acceptes.rows.map((ligne) => ({
      debut: new Date(ligne.debut),
      fin: new Date(ligne.fin),
    }));

    if (!laPlaceEstLibre({ debut: demande.debut, fin: demande.fin }, dejaPris, capacite)) {
      throw new PlaceIndisponible();
    }

    const cree = await client.query<{ id: string }>(
      `insert into stationnement
         (emplacement_id, cycliste_id, debut, fin, type_velo, message)
       values ($1, $2, $3, $4, $5, $6)
       returning id`,
      [
        id,
        demande.cyclisteId,
        demande.debut,
        demande.fin,
        demande.typeVelo,
        demande.message,
      ],
    );

    // Le message part dans la même transaction que la demande : il ne peut
    // donc pas annoncer un stationnement qui n'aurait pas été enregistré.
    const gens = await client.query<{
      emailDuBikeSitter: string;
      prenomDuBikeSitter: string;
      prenomDuCycliste: string;
    }>(
      `select bs.email  as "emailDuBikeSitter",
              bs.prenom as "prenomDuBikeSitter",
              cy.prenom as "prenomDuCycliste"
         from emplacement e
         join membre bs on bs.id = e.membre_id
         join membre cy on cy.id = $2
        where e.id = $1`,
      [id, demande.cyclisteId],
    );

    const { emailDuBikeSitter, prenomDuBikeSitter, prenomDuCycliste } =
      gens.rows[0];

    await mettreEnFile(
      emailDuBikeSitter,
      demandeRecue({
        prenomDuBikeSitter,
        prenomDuCycliste,
        creneau: creneauEnFrancais(demande.debut, demande.fin),
        typeVelo: demande.typeVelo,
        message: demande.message,
      }),
      { client, aPropos: `stationnement ${cree.rows[0].id}` },
    );

    return cree.rows[0].id;
  });
}

export async function demandesRecues(
  bikeSitterId: string,
): Promise<Stationnement[]> {
  return interroger<Stationnement>(
    `select ${COLONNES} ${JOINTURES}
      where e.membre_id = $1
      order by case s.etat when 'demande' then 0 else 1 end, s.debut`,
    [bikeSitterId],
  );
}

export async function mesStationnements(
  cyclisteId: string,
): Promise<Stationnement[]> {
  return interroger<Stationnement>(
    `select ${COLONNES} ${JOINTURES}
      where s.cycliste_id = $1
      order by s.debut desc`,
    [cyclisteId],
  );
}

export async function stationnementParId(
  id: string,
  membreId: string,
): Promise<Stationnement | null> {
  // Un membre ne lit que les stationnements qui le concernent, d'un côté ou de
  // l'autre. Le filtre est dans la requête, pas dans la page.
  return uneLigne<Stationnement>(
    `select ${COLONNES} ${JOINTURES}
      where s.id = $1 and (s.cycliste_id = $2 or e.membre_id = $2)`,
    [id, membreId],
  );
}

/**
 * Accepter ou refuser. Le `where` porte l'autorisation : seul le bike sitter
 * de cet emplacement peut répondre, et seulement à une demande en attente.
 */
export async function repondreALaDemande(
  stationnementId: string,
  bikeSitterId: string,
  reponse: 'accepte' | 'refuse',
): Promise<boolean> {
  return dansUneTransaction(async (client) => {
    const modifie = await client.query<{
      id: string;
      debut: Date;
      fin: Date;
      emailDuCycliste: string;
      prenomDuCycliste: string;
      prenomDuBikeSitter: string;
      adresseExacte: string;
    }>(
      `update stationnement s
          set etat = $3, repondu_le = now()
         from emplacement e, membre cy, membre bs
        where s.id = $1
          and s.emplacement_id = e.id
          and e.membre_id = $2
          and cy.id = s.cycliste_id
          and bs.id = e.membre_id
          and s.etat = 'demande'
        returning s.id, s.debut, s.fin,
                  cy.email  as "emailDuCycliste",
                  cy.prenom as "prenomDuCycliste",
                  bs.prenom as "prenomDuBikeSitter",
                  e.adresse_exacte as "adresseExacte"`,
      [stationnementId, bikeSitterId, reponse],
    );

    if (modifie.rowCount === 0) {
      return false;
    }

    const ligne = modifie.rows[0];
    const creneau = creneauEnFrancais(new Date(ligne.debut), new Date(ligne.fin));

    // Règle 4 : l'adresse ne part qu'ici, dans le message d'acceptation, et
    // nulle part ailleurs. Un refus n'en dit rien.
    const message =
      reponse === 'accepte'
        ? demandeAcceptee({
            prenomDuCycliste: ligne.prenomDuCycliste,
            prenomDuBikeSitter: ligne.prenomDuBikeSitter,
            creneau,
            adresse: ligne.adresseExacte,
          })
        : demandeRefusee({
            prenomDuCycliste: ligne.prenomDuCycliste,
            prenomDuBikeSitter: ligne.prenomDuBikeSitter,
            creneau,
          });

    await mettreEnFile(ligne.emailDuCycliste, message, {
      client,
      aPropos: `stationnement ${stationnementId}`,
    });

    return true;
  });
}

export type Desistement = { annule: boolean; tardif: boolean };

export async function annulerLeStationnement(
  stationnementId: string,
  membreId: string,
): Promise<Desistement> {
  return dansUneTransaction(async (client) => {
    const trouve = await client.query<{
      debut: Date;
      fin: Date;
      cyclisteId: string;
      bikeSitterId: string;
      emailDuCycliste: string;
      prenomDuCycliste: string;
      emailDuBikeSitter: string;
      prenomDuBikeSitter: string;
    }>(
      `select s.debut, s.fin,
              cy.id     as "cyclisteId",
              bs.id     as "bikeSitterId",
              cy.email  as "emailDuCycliste",
              cy.prenom as "prenomDuCycliste",
              bs.email  as "emailDuBikeSitter",
              bs.prenom as "prenomDuBikeSitter"
         from stationnement s
         join emplacement e on e.id = s.emplacement_id
         join membre cy on cy.id = s.cycliste_id
         join membre bs on bs.id = e.membre_id
        where s.id = $1
          and (s.cycliste_id = $2 or e.membre_id = $2)
          and s.etat in ('demande', 'accepte')
        for update of s`,
      [stationnementId, membreId],
    );

    if (trouve.rowCount === 0) {
      return { annule: false, tardif: false };
    }

    await client.query(
      `update stationnement set etat = 'annule', annule_le = now() where id = $1`,
      [stationnementId],
    );

    const ligne = trouve.rows[0];

    // Le caractère tardif ne déclenche aucune pénalité : il ne sert qu'à
    // choisir le message. La règle 3 interdit tout score entre membres.
    const tardif = estUnDesistementTardif(new Date(ligne.debut), new Date());

    // Le message va à l'autre : celui qui annule sait déjà qu'il a annulé.
    const cestLeCycliste = membreId === ligne.cyclisteId;

    await mettreEnFile(
      cestLeCycliste ? ligne.emailDuBikeSitter : ligne.emailDuCycliste,
      desistement({
        prenomDuDestinataire: cestLeCycliste
          ? ligne.prenomDuBikeSitter
          : ligne.prenomDuCycliste,
        prenomDeCeluiQuiSeDesiste: cestLeCycliste
          ? ligne.prenomDuCycliste
          : ligne.prenomDuBikeSitter,
        creneau: creneauEnFrancais(new Date(ligne.debut), new Date(ligne.fin)),
        tardif,
      }),
      { client, aPropos: `stationnement ${stationnementId}` },
    );

    return { annule: true, tardif };
  });
}

// --- Règle 5 : la remise par code -------------------------------------------

export type SensDeLaRemise = 'depot' | 'reprise';

/**
 * Émet le code, ou rend celui qui est encore vivant. Celui qui remet le vélo
 * est le seul à le voir : c'est l'appelant qui vérifie de quel côté il est.
 */
export async function codeVivant(
  stationnementId: string,
  sens: SensDeLaRemise,
): Promise<string> {
  return dansUneTransaction(async (client) => {
    const existant = await client.query<{ chiffres: string }>(
      `select chiffres from code_de_remise
        where stationnement_id = $1 and sens = $2 and consomme_le is null
        for update`,
      [stationnementId, sens],
    );

    if (existant.rowCount && existant.rowCount > 0) {
      return existant.rows[0].chiffres;
    }

    const chiffres = nouveauCodeDeRemise();
    await client.query(
      `insert into code_de_remise (stationnement_id, sens, chiffres)
       values ($1, $2, $3)`,
      [stationnementId, sens, chiffres],
    );
    return chiffres;
  });
}

export type ResultatDeLaRemise =
  | { accepte: true; nouvelEtat: 'en_cours' | 'termine' }
  | { accepte: false; motif: 'expire' | 'epuise' | 'incorrect' | 'inexistant'; essaisRestants: number };

/**
 * La saisie du code. La décision (bon code ? expiré ? combien d'essais reste-t-il ?)
 * est prise par lib/regles/remise.ts ; ici on ne fait que lire, appliquer et écrire.
 */
export async function saisirLeCodeDeRemise(
  stationnementId: string,
  sens: SensDeLaRemise,
  saisie: string,
): Promise<ResultatDeLaRemise> {
  return dansUneTransaction(async (client) => {
    const trouve = await client.query<{
      id: string;
      chiffres: string;
      emis_le: Date;
      essais_utilises: number;
    }>(
      `select id, chiffres, emis_le, essais_utilises
         from code_de_remise
        where stationnement_id = $1 and sens = $2 and consomme_le is null
        for update`,
      [stationnementId, sens],
    );

    if (trouve.rowCount === 0) {
      return { accepte: false, motif: 'inexistant', essaisRestants: 0 };
    }

    const ligne = trouve.rows[0];
    const code: Code = {
      chiffres: ligne.chiffres,
      emisLe: new Date(ligne.emis_le),
      essaisUtilises: ligne.essais_utilises,
    };

    const resultat = saisirLeCode(code, saisie, new Date());

    if (resultat.accepte) {
      const nouvelEtat = sens === 'depot' ? 'en_cours' : 'termine';
      await client.query(
        'update code_de_remise set consomme_le = now() where id = $1',
        [ligne.id],
      );
      await client.query(
        `update stationnement
            set etat = $2,
                depose_le = case when $2 = 'en_cours' then now() else depose_le end,
                repris_le = case when $2 = 'termine' then now() else repris_le end
          where id = $1`,
        [stationnementId, nouvelEtat],
      );
      return { accepte: true, nouvelEtat };
    }

    if (resultat.motif === 'incorrect') {
      if (resultat.aRegenerer) {
        // Trois essais épuisés : le code est remplacé, et le nouveau repart
        // vers celui qui remet le vélo.
        await client.query(
          'update code_de_remise set consomme_le = now() where id = $1',
          [ligne.id],
        );
        await client.query(
          `insert into code_de_remise (stationnement_id, sens, chiffres)
           values ($1, $2, $3)`,
          [stationnementId, sens, nouveauCodeDeRemise()],
        );
      } else {
        await client.query(
          'update code_de_remise set essais_utilises = essais_utilises + 1 where id = $1',
          [ligne.id],
        );
      }
      return {
        accepte: false,
        motif: 'incorrect',
        essaisRestants: resultat.essaisRestants,
      };
    }

    return {
      accepte: false,
      motif: resultat.motif,
      essaisRestants: resultat.motif === 'epuise' ? 0 : ESSAIS_PAR_CODE,
    };
  });
}
