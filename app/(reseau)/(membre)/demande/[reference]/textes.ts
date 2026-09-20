import type { Textes } from '@/lib/i18n/langue';

import type { TextesDuFormulaire } from './formulaire';

/** Les libellés du formulaire de demande, partagés par l'envoi et la modification. */
export function textesDuFormulaireDeDemande(
  p: Textes['p'],
  prenomDuBikeSitter: string,
): TextesDuFormulaire {
  return {
    creneau: p('Choisir le créneau'),
    date: p('Date du dépôt'),
    debut: p('Début'),
    fin: p('Fin'),
    jourDeRecuperation: p('Jour de la récupération'),
    memeJour: p('Le même jour'),
    duree: p('Durée'),
    heures: p('{n} h'),
    nombreDeJours: p('{n} jours'),
    plusieursJours: p(
      'Garde de {jours} jours : votre vélo reste chez {prenom} pendant {nuits} nuit(s).',
      { prenom: prenomDuBikeSitter },
    ),
    velo: p('Votre vélo'),
    aucunVelo: p(
      'Ajoutez d’abord le vélo que vous souhaitez confier : le Bike Sitter saura ce qu’il accueille.',
    ),
    ajouterUnVelo: p('Ajouter un vélo'),
    message: p('Message (facultatif)'),
    placeholder: p('Bonjour {prenom}, je passe la journée en centre-ville…', {
      prenom: prenomDuBikeSitter,
    }),
    recapitulatif: p('Récapitulatif'),
    votreBikeSitter: p('Votre Bike Sitter'),
    verifie: p('Vérifié'),
    lieu: p('Lieu de garde'),
    adresseApresAcceptation: p('Adresse exacte communiquée après acceptation.'),
    votreVelo: p('Votre vélo'),
    dateEtHoraires: p('Date et horaires'),
    dureeAcceptee: p('Durée acceptée'),
    disponibilites: p('Disponibilités'),
    placesRestantes: p('Places restantes'),
    gratuit: p('La garde est entièrement gratuite : aucun paiement entre les membres.'),
    envoyer: p('Envoyer la demande'),
    envoi: p('Envoi…'),
    sur: p('sur'),
  };
}
