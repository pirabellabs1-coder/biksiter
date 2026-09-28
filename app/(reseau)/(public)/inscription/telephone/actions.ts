'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { etatDuCompte, renvoyerLaConfirmation } from '@/lib/depot/comptes';
import {
  confirmerLeNumero,
  enregistrerLeNumero,
  envoyerUnCode,
  etatDuTelephone,
} from '@/lib/depot/telephone';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { canauxConfigures } from '@/lib/envois/canaux';
import { texte } from '@/lib/formulaires/etat';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { coordonneesSuffisantes } from '@/lib/regles/comptes';
import {
  CODES_SMS_PAR_HEURE,
  CODES_SMS_PAR_JOUR,
  CODES_SMS_REFUSES_PAR_JOUR,
  COURRIELS_DE_COMPTE,
} from '@/lib/regles/limites';
import {
  CHIFFRES_DU_CODE,
  lireLeNumero,
  VALIDITE_DU_CODE_MINUTES,
} from '@/lib/regles/telephone';
import { exigerUnMembre } from '@/lib/session';

export type EtatDuNumero =
  | { statut: 'vierge' }
  | { statut: 'erreur'; erreur: string; numero: string }
  | { statut: 'envoye'; message: string; numero: string };

async function traducteur() {
  return phraseur(await langueCourante());
}

/**
 * Où aller une fois une coordonnée confirmée : la pièce d'identité si tout ce
 * qui peut être vérifié l'est, sinon cette étape, qui dit ce qui manque.
 */
async function suiteDeLInscription(membreId: string): Promise<string> {
  const [compte, telephone] = await Promise.all([
    etatDuCompte(membreId),
    etatDuTelephone(membreId),
  ]);
  const canaux = canauxConfigures();
  return coordonneesSuffisantes({
    emailVerifie: Boolean(compte?.emailVerifieLe),
    telephoneVerifie: telephone.verifieLe !== null,
    telephoneConnu: telephone.telephone !== null,
    courrielPossible: canaux.courriel,
    smsPossible: canaux.sms,
  })
    ? '/inscription/identite'
    : '/inscription/telephone';
}

/**
 * Sans passerelle SMS, le numéro s'enregistre sans code : personne n'attend
 * un SMS qui ne partirait pas. Il reste non vérifié, et la personne qui
 * examine la pièce d'identité le voit.
 */
export async function enregistrerMonNumero(
  _precedent: EtatDuNumero,
  donnees: FormData,
): Promise<EtatDuNumero> {
  const membre = await exigerUnMembre();
  const p = await traducteur();
  const saisie = texte(donnees, 'telephone').slice(0, 30);
  if (canauxConfigures().sms) {
    return {
      statut: 'erreur',
      numero: saisie,
      erreur: p('Demandez un code par SMS pour confirmer votre numéro.'),
    };
  }
  const lecture = lireLeNumero(saisie);
  if (!lecture.valide) {
    return {
      statut: 'erreur',
      numero: saisie,
      erreur:
        lecture.motif === 'pas_un_mobile'
          ? p(
              'Indiquez un numéro de mobile : c’est lui qui sert à vous joindre le jour de la garde.',
            )
          : p('Ce numéro n’est pas lisible. Exemple : 0470 12 34 56.'),
    };
  }
  await enregistrerLeNumero(membre.id, lecture.numero);
  revalidatePath('/inscription/telephone');
  redirect(await suiteDeLInscription(membre.id));
}

/**
 * Le SMS est le seul usage du téléphone : vérifier qu'on joint bien la
 * personne. Les rappels passent par courriel.
 */
export async function demanderUnCode(
  _precedent: EtatDuNumero,
  donnees: FormData,
): Promise<EtatDuNumero> {
  const membre = await exigerUnMembre();
  const p = await traducteur();
  const saisie = texte(donnees, 'telephone').slice(0, 30);
  // Sans passerelle, un code ne partirait jamais : il attendrait dans la
  // file et partirait d'un coup le jour où une passerelle serait branchée.
  if (!canauxConfigures().sms) {
    return {
      statut: 'erreur',
      numero: saisie,
      erreur: p(
        'La confirmation par SMS n’est pas encore disponible : enregistrez simplement votre numéro.',
      ),
    };
  }
  const lecture = lireLeNumero(saisie);

  if (!lecture.valide) {
    return {
      statut: 'erreur',
      numero: saisie,
      erreur:
        lecture.motif === 'pas_un_mobile'
          ? p(
              'Indiquez un numéro de mobile : un SMS ne peut pas être reçu sur une ligne fixe.',
            )
          : p('Ce numéro n’est pas lisible. Exemple : 0470 12 34 56.'),
    };
  }

  const [parHeure, parJour, auNumero, refuses] = await Promise.all([
    limiteDejaAtteinte(CODES_SMS_PAR_HEURE, membre.id),
    limiteDejaAtteinte(CODES_SMS_PAR_JOUR, membre.id),
    limiteDejaAtteinte(CODES_SMS_PAR_JOUR, lecture.numero),
    limiteDejaAtteinte(CODES_SMS_REFUSES_PAR_JOUR, membre.id),
  ]);
  if (parJour || auNumero || refuses) {
    return {
      statut: 'erreur',
      numero: saisie,
      erreur: p(
        'Plusieurs codes ont déjà été envoyés aujourd’hui. Vous pourrez en demander un nouveau demain ; si le SMS n’arrive pas, écrivez-nous depuis la page Contact.',
      ),
    };
  }
  if (parHeure) {
    return {
      statut: 'erreur',
      numero: saisie,
      erreur: p(
        'Trois codes ont été envoyés dans l’heure. Le dernier reste valable dix minutes ; vous pourrez en demander un autre un peu plus tard.',
      ),
    };
  }

  await envoyerUnCode(membre.id, lecture.numero);
  await Promise.all([
    noterUneTentative('code_sms_envoye', membre.id),
    noterUneTentative('code_sms_envoye', lecture.numero),
  ]);
  revalidatePath('/inscription/telephone');

  return {
    statut: 'envoye',
    numero: lecture.numero,
    message: p(
      'Un code à {chiffres} chiffres vient d’être envoyé au {numero}. Il reste valable {minutes} minutes.',
      {
        chiffres: CHIFFRES_DU_CODE,
        numero: lecture.numero,
        minutes: VALIDITE_DU_CODE_MINUTES,
      },
    ),
  };
}

export type EtatDuCode =
  { statut: 'vierge' } | { statut: 'erreur'; erreur: string };

export async function confirmerLeCode(
  _precedent: EtatDuCode,
  donnees: FormData,
): Promise<EtatDuCode> {
  const membre = await exigerUnMembre();
  const p = await traducteur();

  const saisie = Array.from({ length: CHIFFRES_DU_CODE }, (_, rang) =>
    texte(donnees, `c${rang}`),
  ).join('');

  if (!new RegExp(`^[0-9]{${CHIFFRES_DU_CODE}}$`).test(saisie)) {
    return {
      statut: 'erreur',
      erreur: p('Entrez les quatre chiffres reçus par SMS.'),
    };
  }

  if (await limiteDejaAtteinte(CODES_SMS_REFUSES_PAR_JOUR, membre.id)) {
    return {
      statut: 'erreur',
      erreur: p(
        'Trop de codes incorrects aujourd’hui. Par sécurité, la vérification reprendra demain.',
      ),
    };
  }

  const confirmation = await confirmerLeNumero(membre.id, saisie);

  if (confirmation.confirme) {
    // La pièce d'identité vient après l'adresse confirmée : tant qu'elle ne
    // l'est pas, on reste sur cette étape, qui dit ce qui manque.
    redirect(await suiteDeLInscription(membre.id));
  }

  if (confirmation.resultat === null) {
    return {
      statut: 'erreur',
      erreur: p('Aucun code en attente : demandez-en un nouveau.'),
    };
  }

  const { resultat } = confirmation;
  if (resultat.motif === 'incorrect') {
    await noterUneTentative('code_sms_refuse', membre.id);
    return {
      statut: 'erreur',
      erreur:
        resultat.essaisRestants > 1
          ? p('Code incorrect. Il vous reste {essais} essais.', {
              essais: resultat.essaisRestants,
            })
          : resultat.essaisRestants === 1
            ? p('Code incorrect. Il vous reste un essai.')
            : p(
                'Code incorrect. Les trois essais sont utilisés : demandez un nouveau code.',
              ),
    };
  }
  return {
    statut: 'erreur',
    erreur:
      resultat.motif === 'expire'
        ? p('Ce code n’est plus valable : demandez-en un nouveau.')
        : p('Les trois essais sont utilisés. Demandez un nouveau code.'),
  };
}

export async function renvoyerLeLien(): Promise<void> {
  const membre = await exigerUnMembre();
  // Au-delà de la limite, rien ne part, et l'écran répond la même chose : le
  // lien envoyé juste avant reste valable.
  if (!(await limiteDejaAtteinte(COURRIELS_DE_COMPTE, membre.email))) {
    await renvoyerLaConfirmation(membre.id);
    await noterUneTentative('courriel_de_compte', membre.email);
  }
  redirect('/inscription/telephone?lien=renvoye');
}
