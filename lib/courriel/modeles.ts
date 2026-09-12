import { ASSOCIATION } from '@/lib/contenu/association';
import { SEUIL_DESISTEMENT_TARDIF_HEURES } from '@/lib/regles/annulation';
import { VALIDITE_CODE_HEURES } from '@/lib/regles/remise';

/**
 * Les messages que le service envoie.
 *
 * Texte brut, et rien d'autre. Pas de HTML, donc pas de pixel de suivi, pas de
 * mise en page qui casse chez un destinataire sur trois, et un message lisible
 * dans n'importe quel client de messagerie. Une association qui demande à des
 * gens d'ouvrir leur porte n'a pas besoin de savoir qui a ouvert son courrier.
 *
 * Le ton est celui du site : professionnel, pédagogique et doux. Un message
 * dit ce qui s'est passé, ce qui vient ensuite, et remercie quand il y a lieu.
 *
 * Ce sont des fonctions pures : elles n'écrivent rien, ne lisent rien, et se
 * testent donc directement.
 */

export type Message = {
  sujet: string;
  corps: string;
};

const SIGNATURE = [
  '',
  '—',
  `${ASSOCIATION.nom}, ${ASSOCIATION.forme} à ${ASSOCIATION.ville}.`,
  // Sans adresse de contact publique, le message invite simplement à répondre :
  // une ligne « écrivez à null » vaudrait moins que pas de ligne du tout.
  ASSOCIATION.contact === null
    ? 'Une question ? Répondez simplement à ce message.'
    : `Une question ? Répondez à ce message ou écrivez à ${ASSOCIATION.contact}.`,
].join('\n');

function rediger(sujet: string, lignes: readonly string[]): Message {
  return { sujet, corps: `${lignes.join('\n')}\n${SIGNATURE}\n` };
}

export function inscriptionSurLaListe(details: {
  quartier: string;
  peutAccueillir: boolean;
}): Message {
  return rediger('Bienvenue sur la liste d’attente', [
    'Bonjour,',
    '',
    `Merci ! Votre inscription est bien enregistrée pour ${details.quartier}.`,
    '',
    details.peutAccueillir
      ? 'Vous avez indiqué pouvoir accueillir un vélo : merci, c’est précieux.' +
        '\nUn quartier ouvre dès qu’il compte assez de bike sitters pour' +
        '\naccueillir les cyclistes dans de bonnes conditions, et votre' +
        '\ninscription nous en rapproche.'
      : 'Votre quartier ouvrira dès qu’il comptera assez de bike sitters pour' +
        '\naccueillir les cyclistes dans de bonnes conditions. Nous vous' +
        '\npréviendrons à ce moment-là.',
    '',
    'Si vous connaissez un membre du réseau, son invitation vous permet de',
    'rejoindre Bike Sitters dès aujourd’hui.',
  ]);
}

export function candidatureRecue(details: { prenom: string }): Message {
  return rediger('Nous avons bien reçu votre emplacement', [
    `Bonjour ${details.prenom},`,
    '',
    'Merci d’avoir décrit votre emplacement ! Une personne de l’association',
    'va le relire et vérifier votre identité avant la publication. Nous',
    'revenons vers vous par e-mail.',
    '',
    'Votre adresse reste confidentielle : la carte n’affiche qu’une zone',
    'approximative, et l’adresse exacte n’est transmise qu’au cycliste dont',
    'vous acceptez la demande.',
  ]);
}

export function bienvenue(details: {
  prenom: string;
  invitePar: string | null;
}): Message {
  return rediger('Bienvenue sur Bike Sitters', [
    `Bonjour ${details.prenom},`,
    '',
    details.invitePar
      ? `Votre compte est créé, grâce à l’invitation de ${details.invitePar}. Bienvenue !`
      : 'Votre compte est créé. Bienvenue !',
    '',
    'Dernière étape : la vérification de votre identité (e-mail, téléphone et',
    'pièce d’identité). Elle ne prend que quelques minutes et assure la',
    'confiance entre tous les membres du réseau.',
    '',
    'Votre pièce d’identité est supprimée juste après la vérification, et au',
    'plus tard après sept jours.',
  ]);
}

export function identiteVerifiee(details: { prenom: string }): Message {
  return rediger('Votre identité est vérifiée', [
    `Bonjour ${details.prenom},`,
    '',
    'Bonne nouvelle : votre identité est vérifiée et votre compte est actif.',
    'Votre pièce d’identité a été supprimée ; seul le résultat de la',
    'vérification est conservé.',
    '',
    'Vous pouvez dès maintenant demander un stationnement, et proposer un',
    'emplacement si vous le souhaitez.',
  ]);
}

export function identiteRefusee(details: {
  prenom: string;
  motif: string;
}): Message {
  return rediger('Nous n’avons pas pu vérifier votre identité', [
    `Bonjour ${details.prenom},`,
    '',
    'Nous n’avons pas pu valider la pièce d’identité que vous avez envoyée.',
    '',
    `Le motif : ${details.motif}`,
    '',
    'Votre document a été supprimé. Vous pouvez en envoyer un nouveau à tout',
    'moment depuis votre espace, sans limite d’essais.',
  ]);
}

export function demandeRecue(details: {
  prenomDuBikeSitter: string;
  prenomDuCycliste: string;
  creneau: string;
  typeVelo: string;
  message: string | null;
}): Message {
  return rediger(
    `${details.prenomDuCycliste} demande à déposer son vélo chez vous`,
    [
      `Bonjour ${details.prenomDuBikeSitter},`,
      '',
      `${details.prenomDuCycliste} souhaite déposer un vélo (${details.typeVelo.toLowerCase()}) chez vous`,
      `${details.creneau}.`,
      ...(details.message ? ['', `Son message : « ${details.message} »`] : []),
      '',
      'Son identité a été vérifiée par l’association. Vous êtes libre',
      'd’accepter ou non cette demande, depuis votre espace, rubrique',
      '« Mes stationnements ».',
      '',
      'Votre adresse ne lui sera communiquée que si vous acceptez.',
    ],
  );
}

export function demandeAcceptee(details: {
  prenomDuCycliste: string;
  prenomDuBikeSitter: string;
  creneau: string;
  adresse: string;
}): Message {
  // C'est le seul message qui contient une adresse exacte, et c'est le moment
  // prévu par la règle 4 : la demande est acceptée.
  return rediger(
    `${details.prenomDuBikeSitter} accepte d’accueillir votre vélo`,
    [
      `Bonjour ${details.prenomDuCycliste},`,
      '',
      `Bonne nouvelle : ${details.prenomDuBikeSitter} vous attend ${details.creneau}.`,
      '',
      `L’adresse : ${details.adresse}`,
      '',
      'Merci de la garder pour vous : elle n’est communiquée qu’aux cyclistes',
      'dont la demande a été acceptée.',
      '',
      `Au moment du dépôt, vous communiquerez un code à quatre chiffres à ${details.prenomDuBikeSitter},`,
      `qui le saisira de son côté. Il reste valable ${VALIDITE_CODE_HEURES} heures et fonctionne même`,
      'sans réseau.',
    ],
  );
}

export function demandeRefusee(details: {
  prenomDuCycliste: string;
  prenomDuBikeSitter: string;
  creneau: string;
}): Message {
  return rediger('Votre demande n’a pas pu être acceptée', [
    `Bonjour ${details.prenomDuCycliste},`,
    '',
    `${details.prenomDuBikeSitter} n’est pas disponible pour vous accueillir ${details.creneau}.`,
    '',
    'Les bike sitters accueillent selon leurs disponibilités : d’autres',
    'emplacements sont sûrement libres près de votre destination.',
  ]);
}

export function messageRecu(details: {
  prenomDuDestinataire: string;
  prenomDeLAuteur: string;
  quartier: string;
  corps: string;
}): Message {
  return rediger(`${details.prenomDeLAuteur} vous a écrit`, [
    `Bonjour ${details.prenomDuDestinataire},`,
    '',
    `À propos du stationnement à ${details.quartier} :`,
    '',
    details.corps,
    '',
    'Vous pouvez répondre depuis la page du stationnement, quand cela vous',
    'convient.',
  ]);
}

/**
 * L'IBAN est passé en paramètre plutôt que lu ici : ce message ne s'écrit
 * qu'après `lesDonsSontOuverts`, et le type oblige l'appelant à l'avoir
 * vérifié. Aucun chemin ne peut donc écrire « IBAN : null » à quelqu'un.
 */
export function donAnnonce(details: {
  prenom: string | null;
  montant: number | null;
  communication: string;
  iban: string;
}): Message {
  return rediger('Les coordonnées pour votre don', [
    details.prenom ? `Bonjour ${details.prenom},` : 'Bonjour,',
    '',
    'Merci pour votre soutien ! Voici les informations pour votre virement :',
    '',
    `  Bénéficiaire   : ${ASSOCIATION.nom}`,
    `  IBAN           : ${details.iban}`,
    ...(details.montant ? [`  Montant        : ${details.montant} €`] : []),
    `  Communication  : ${details.communication}`,
    '',
    'La communication structurée nous permet de reconnaître votre virement :',
    'merci de la recopier telle quelle.',
    '',
    'Nous privilégions le virement : il ne coûte rien, ni à vous ni à',
    'l’association, contrairement à un paiement par carte.',
    '',
    'Tous les membres bénéficient du même service, qu’ils fassent un don ou',
    'non. Merci de contribuer à le garder gratuit.',
  ]);
}

export function desistement(details: {
  prenomDuDestinataire: string;
  prenomDeCeluiQuiSeDesiste: string;
  creneau: string;
  tardif: boolean;
}): Message {
  return rediger('Un stationnement a été annulé', [
    `Bonjour ${details.prenomDuDestinataire},`,
    '',
    `${details.prenomDeCeluiQuiSeDesiste} a annulé le stationnement prévu ${details.creneau}.`,
    ...(details.tardif
      ? [
          '',
          `L’annulation intervient moins de ${SEUIL_DESISTEMENT_TARDIF_HEURES} heures avant le dépôt : nous sommes`,
          'désolés pour l’organisation que vous aviez prévue. Cette annulation',
          'n’entraîne aucune pénalité.',
        ]
      : []),
    '',
    'La place est de nouveau libre sur ce créneau.',
  ]);
}
