'use server';

import { baseConfiguree } from '@/lib/bd/client';
import { enregistrerUnMessageDeContact } from '@/lib/depot/contact';
import { texte } from '@/lib/formulaires/etat';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import {
  type ErreursDeContact,
  estUnSujetDeContact,
  verifierUnMessageDeContact,
} from '@/lib/regles/contact';

export type SaisieDuContact = { email: string; sujet: string; message: string };

export type EtatDuContact =
  | { statut: 'vierge' }
  | {
      statut: 'erreur';
      erreurs: ErreursDeContact;
      general?: string;
      /** Renvoyée pour que le formulaire se remplisse à nouveau : personne ne
       *  doit réécrire son message parce qu'une adresse avait une faute. */
      saisie: SaisieDuContact;
    }
  | { statut: 'envoye'; message: string };

export async function envoyerUnMessage(
  _precedent: EtatDuContact,
  donnees: FormData,
): Promise<EtatDuContact> {
  const langue = await langueCourante();
  const p = phraseur(langue);
  const envoye: EtatDuContact = {
    statut: 'envoye',
    message: p('Message envoyé. Réponse sous 48 heures.'),
  };

  // Un champ invisible pour une personne, que remplissent les robots : on
  // leur répond comme à tout le monde, sans rien enregistrer.
  if (texte(donnees, 'site_web') !== '') {
    return envoye;
  }

  const saisie = {
    email: texte(donnees, 'email'),
    sujet: texte(donnees, 'sujet'),
    message: texte(donnees, 'message'),
  };

  const erreurs = verifierUnMessageDeContact(saisie);
  if (Object.keys(erreurs).length > 0 || !estUnSujetDeContact(saisie.sujet)) {
    return {
      statut: 'erreur',
      erreurs: Object.fromEntries(
        Object.entries(erreurs).map(([champ, erreur]) => [champ, p(erreur)]),
      ),
      saisie,
    };
  }

  const indisponible: EtatDuContact = {
    statut: 'erreur',
    erreurs: {},
    general: p(
      'L’envoi est momentanément indisponible. Votre message n’a pas été transmis : vous pouvez réessayer un peu plus tard.',
    ),
    saisie,
  };

  if (!baseConfiguree()) {
    return indisponible;
  }

  let resultat: Awaited<ReturnType<typeof enregistrerUnMessageDeContact>>;
  try {
    resultat = await enregistrerUnMessageDeContact({
      email: saisie.email,
      sujet: saisie.sujet,
      message: saisie.message,
    });
  } catch {
    // La personne garde son message à l'écran ; le détail de l'erreur ne lui
    // apprendrait rien d'utile.
    return indisponible;
  }

  if (resultat === 'trop_de_messages') {
    return {
      statut: 'erreur',
      erreurs: {},
      general: p(
        'Nous avons bien reçu vos messages d’aujourd’hui. Nous vous répondons dès que possible ; vous pourrez nous écrire à nouveau demain.',
      ),
      saisie,
    };
  }

  return envoye;
}
