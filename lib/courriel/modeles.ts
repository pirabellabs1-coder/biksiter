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
  `Une question ? Répondez à ce message ou écrivez à ${ASSOCIATION.contact}.`,
].join('\n');

function rediger(sujet: string, lignes: readonly string[]): Message {
  return { sujet, corps: `${lignes.join('\n')}\n${SIGNATURE}\n` };
}

export function inscriptionSurLaListe(details: {
  quartier: string;
  peutAccueillir: boolean;
}): Message {
  return rediger('Vous êtes sur la liste d’attente', [
    'Bonjour,',
    '',
    `Votre inscription est enregistrée pour ${details.quartier}.`,
    '',
    details.peutAccueillir
      ? 'Vous avez indiqué pouvoir accueillir un vélo : c’est ce qui compte le'
        + '\nplus. Un quartier ouvre quand il compte assez de bike sitters pour'
        + '\nqu’un cycliste y trouve une place à chaque fois — pas avant, parce'
        + '\nqu’ouvrir trop tôt revient à promettre une place qui n’existe pas.'
      : 'Nous ouvrirons votre quartier quand il comptera assez de bike sitters'
        + '\npour qu’une place s’y trouve à chaque fois. Vous serez prévenu.',
    '',
    'Si vous connaissez quelqu’un du réseau, son invitation vous fait entrer',
    'tout de suite : l’attente devient inutile.',
  ]);
}

export function candidatureRecue(details: { prenom: string }): Message {
  return rediger('Nous avons bien reçu votre emplacement', [
    `Bonjour ${details.prenom},`,
    '',
    'Merci d’avoir décrit votre emplacement. Une personne va le relire et',
    'vérifier votre identité avant toute publication : personne n’apparaît sur',
    'la carte sans être passé par là, et c’est ce qui rend acceptable, pour un',
    'cycliste, de confier son vélo à quelqu’un qu’il ne connaît pas.',
    '',
    'Votre adresse ne sera jamais publiée. La carte affiche une zone, et vous',
    'seul communiquez l’adresse exacte, à la personne dont vous avez accepté',
    'la demande.',
  ]);
}

export function bienvenue(details: {
  prenom: string;
  invitePar: string | null;
}): Message {
  return rediger('Votre compte Bike Sitters est créé', [
    `Bonjour ${details.prenom},`,
    '',
    details.invitePar
      ? `Votre compte est créé, avec l’invitation de ${details.invitePar}.`
      : 'Votre compte est créé.',
    '',
    'Il reste la vérification de votre identité : e-mail, téléphone et pièce',
    'd’identité. Elle vaut autant pour vous que pour la personne qui vous',
    'ouvrira sa porte — vous saurez, vous aussi, à qui vous confiez votre vélo.',
    '',
    'Votre pièce n’est pas conservée : elle est supprimée dès la vérification,',
    'et au plus tard après sept jours.',
  ]);
}

export function identiteVerifiee(details: { prenom: string }): Message {
  return rediger('Votre identité est vérifiée', [
    `Bonjour ${details.prenom},`,
    '',
    'Une personne a relu votre pièce d’identité : votre compte est actif.',
    'Le document a été supprimé dans la foulée, comme annoncé — nous ne',
    'gardons ni l’image, ni le numéro, seulement le fait que la vérification a',
    'eu lieu.',
    '',
    'Vous pouvez maintenant demander un stationnement, et proposer un',
    'emplacement si vous en avez un.',
  ]);
}

export function identiteRefusee(details: {
  prenom: string;
  motif: string;
}): Message {
  return rediger('Nous n’avons pas pu vérifier votre identité', [
    `Bonjour ${details.prenom},`,
    '',
    'Nous n’avons pas pu valider la pièce que vous avez envoyée.',
    '',
    `La raison : ${details.motif}`,
    '',
    'Votre document a été supprimé. Vous pouvez en déposer un autre quand vous',
    'voulez — il n’y a pas de limite au nombre d’essais, et un refus n’est pas',
    'un jugement sur vous.',
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
      `${details.prenomDuCycliste} voudrait déposer un vélo (${details.typeVelo.toLowerCase()})`,
      `${details.creneau}.`,
      ...(details.message ? ['', `Son mot : « ${details.message} »`] : []),
      '',
      'Son identité a été vérifiée par nos soins. Vous acceptez ou vous refusez,',
      'sans avoir à vous justifier et sans que cela ne vous coûte quoi que ce',
      'soit : il n’y a ni note, ni classement, ni score dans ce réseau.',
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
  return rediger(`${details.prenomDuBikeSitter} accepte d’accueillir votre vélo`, [
    `Bonjour ${details.prenomDuCycliste},`,
    '',
    `${details.prenomDuBikeSitter} vous attend ${details.creneau}.`,
    '',
    `L’adresse : ${details.adresse}`,
    '',
    'Gardez-la pour vous : elle n’est publiée nulle part et n’est communiquée',
    'qu’aux personnes dont la demande a été acceptée.',
    '',
    `Au dépôt, vous dicterez un code à quatre chiffres à ${details.prenomDuBikeSitter},`,
    `qui le saisira de son côté. Il vaut ${VALIDITE_CODE_HEURES} heures et se lit à voix haute :`,
    'pas besoin de réseau dans une cave, ni d’enlever ses gants.',
  ]);
}

export function demandeRefusee(details: {
  prenomDuCycliste: string;
  prenomDuBikeSitter: string;
  creneau: string;
}): Message {
  return rediger('Votre demande n’a pas été retenue', [
    `Bonjour ${details.prenomDuCycliste},`,
    '',
    `${details.prenomDuBikeSitter} ne peut pas vous accueillir ${details.creneau}.`,
    '',
    'Un refus n’est pas un jugement : les bike sitters sont des bénévoles et',
    'refusent quand cela ne leur convient pas, ce qui est exactement ce qu’on',
    'leur demande de faire plutôt que d’accepter à contrecœur.',
    '',
    'D’autres emplacements sont ouverts près de votre destination.',
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
    'Répondez depuis la page du stationnement. Rien ne presse : personne ici',
    'ne compte le temps que vous mettez à répondre, et personne ne sait si',
    'vous avez lu ce message.',
  ]);
}

export function donAnnonce(details: {
  prenom: string | null;
  montant: number | null;
  communication: string;
}): Message {
  return rediger('Les coordonnées pour votre don', [
    details.prenom ? `Bonjour ${details.prenom},` : 'Bonjour,',
    '',
    'Merci. Voici de quoi faire le virement :',
    '',
    `  Bénéficiaire   : ${ASSOCIATION.nom}`,
    `  IBAN           : ${ASSOCIATION.iban}`,
    ...(details.montant ? [`  Montant        : ${details.montant} €`] : []),
    `  Communication  : ${details.communication}`,
    '',
    'La communication structurée est ce qui nous permet de reconnaître votre',
    'virement : recopiez-la telle quelle, votre banque saura la lire.',
    '',
    'Nous ne passons pas par un prestataire de paiement : sa commission prend',
    'deux à trois pour cent de chaque don, et un virement n’en prend rien.',
    'Sur de petits montants, c’est un mois de fonctionnement par an.',
    '',
    'Un don ne donne aucun avantage sur le service. Un membre qui donne et un',
    'membre qui ne donne pas sont traités exactement pareil.',
  ]);
}

export function desistement(details: {
  prenomDuDestinataire: string;
  prenomDeCeluiQuiSeDesiste: string;
  creneau: string;
  tardif: boolean;
}): Message {
  return rediger('Un stationnement est annulé', [
    `Bonjour ${details.prenomDuDestinataire},`,
    '',
    `${details.prenomDeCeluiQuiSeDesiste} a annulé le stationnement prévu ${details.creneau}.`,
    ...(details.tardif
      ? [
          '',
          `L’annulation arrive à moins de ${SEUIL_DESISTEMENT_TARDIF_HEURES} heures du dépôt, et nous en sommes`,
          'désolés pour l’organisation que vous aviez prise. Cela n’entraîne',
          'aucune pénalité pour personne : il n’y a pas de score ici.',
        ]
      : []),
    '',
    'La place est de nouveau libre sur ce créneau.',
  ]);
}
