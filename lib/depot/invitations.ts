import 'server-only';

import { randomBytes } from 'node:crypto';

import { dansUneTransaction } from '@/lib/bd/client';
import {
  CARACTERES_ALEATOIRES_D_UN_CODE,
  codesAEmettre,
  formerUnCode,
  VALIDITE_D_UNE_INVITATION_JOURS,
} from '@/lib/regles/invitations';

/** Un code est valable trente jours ; au-delà, il s'éteint. */
export const INVITATION_VALABLE = `i.creee_le > now() - make_interval(days => ${VALIDITE_D_UNE_INVITATION_JOURS})`;

export type CodeDisponible = { code: string; expireLe: Date };

export type PersonneInvitee = {
  prenom: string;
  initiale: string;
  inscriteLe: Date;
  /** Vrai quand elle a mené une première garde : l'invitation est rendue. */
  premiereGarde: boolean;
};

export type MesInvitations = {
  /** Les codes s'ouvrent une fois l'identité vérifiée par l'association. */
  identiteVerifiee: boolean;
  codes: CodeDisponible[];
  invitees: PersonneInvitee[];
};

/**
 * Les invitations d'un membre, et l'émission de celles qui lui reviennent.
 *
 * On répond un peu de la personne qu'on fait entrer : les codes ne s'ouvrent
 * qu'une fois sa propre identité vérifiée, et le quota se reconstitue quand
 * un invité a mené sa première garde (voir `codesAEmettre`).
 */
export async function mesInvitations(membreId: string): Promise<MesInvitations> {
  return dansUneTransaction(async (client) => {
    // Le verrou sur le membre évite que deux onglets n'émettent chacun leurs
    // codes en même temps.
    const { rows: membres } = await client.query<{
      prenom: string;
      verifie: boolean;
    }>(
      `select prenom, verification = 'verifiee' as verifie
         from membre where id = $1 for update`,
      [membreId],
    );
    const membre = membres[0];
    if (!membre) return { identiteVerifiee: false, codes: [], invitees: [] };

    const { rows: invitees } = await client.query<PersonneInvitee>(
      `select m.prenom, upper(left(m.nom, 1)) as initiale,
              i.utilisee_le as "inscriteLe",
              exists (
                select 1 from stationnement s
                  join emplacement e on e.id = s.emplacement_id
                 where s.etat = 'termine'
                   and (s.cycliste_id = m.id or e.membre_id = m.id)
              ) as "premiereGarde"
         from invitation i
         join membre m on m.id = i.utilisee_par
        where i.emise_par = $1
        order by i.utilisee_le desc`,
      [membreId],
    );

    if (!membre.verifie) {
      return { identiteVerifiee: false, codes: [], invitees };
    }

    const disponibles = async () =>
      (
        await client.query<{ code: string; expireLe: Date }>(
          `select i.code,
                  i.creee_le + make_interval(days => ${VALIDITE_D_UNE_INVITATION_JOURS}) as "expireLe"
             from invitation i
            where i.emise_par = $1 and i.utilisee_par is null and ${INVITATION_VALABLE}
            order by i.creee_le`,
          [membreId],
        )
      ).rows;

    let codes = await disponibles();
    const aEmettre = codesAEmettre({
      disponibles: codes.length,
      invitesSansPremiereGarde: invitees.filter((i) => !i.premiereGarde).length,
    });
    for (let rang = 0; rang < aEmettre; rang += 1) {
      // Un code déjà pris (très improbable) est simplement retenté.
      for (let essai = 0; essai < 5; essai += 1) {
        const code = formerUnCode(membre.prenom, randomBytes(CARACTERES_ALEATOIRES_D_UN_CODE));
        const { rowCount } = await client.query(
          `insert into invitation (code, emise_par) values ($1, $2)
           on conflict (code) do nothing`,
          [code, membreId],
        );
        if (rowCount) break;
      }
    }
    if (aEmettre > 0) codes = await disponibles();

    return { identiteVerifiee: true, codes, invitees };
  });
}
