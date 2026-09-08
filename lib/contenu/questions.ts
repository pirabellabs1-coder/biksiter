/**
 * Les questions fréquentes.
 *
 * Elles vivent hors du composant parce qu’elles servent aussi ailleurs :
 * la page dédiée aujourd’hui, un balisage structuré et les réponses types du
 * support demain. Une réponse ne se recopie pas.
 */

export type Question = {
  question: string;
  reponse: string;
};

export const QUESTIONS: readonly Question[] = [
  {
    question: 'C’est vraiment gratuit ?',
    reponse:
      'Oui, des deux côtés. Les bike sitters ne sont pas rémunérés et aucune commission n’est prélevée. C’est un réseau d’entraide entre cyclistes, porté par une association sans but lucratif — pas un service de stockage.',
  },
  {
    question: 'Mon adresse sera-t-elle visible ?',
    reponse:
      'Non. La carte affiche une zone d’au moins 250 mètres, jamais un point. Vous communiquez l’adresse exacte vous-même, à la personne dont vous avez accepté la demande, et à elle seule.',
  },
  {
    question: 'Pourquoi ne peut-on pas s’inscrire librement ?',
    reponse:
      'Pendant les premiers mois, on entre sur invitation d’un membre. C’est ce qui nous permet de faire grandir le réseau quartier par quartier et de vérifier chaque personne sérieusement. La liste d’attente, elle, est ouverte à tous : c’est elle qui nous dit où ouvrir ensuite.',
  },
  {
    question: 'Faut-il un compte pour demander une place ?',
    reponse:
      'Oui, avec une identité vérifiée. C’est la contrepartie de ce qu’on demande aux bike sitters : ouvrir sa porte à quelqu’un suppose de savoir qui c’est.',
  },
  {
    question: 'Que devient ma pièce d’identité ?',
    reponse:
      'Elle est vérifiée par une personne, puis supprimée — au plus tard après sept jours. Nous ne conservons ni l’image, ni le numéro : seulement le fait que la vérification a eu lieu.',
  },
  {
    question: 'Qui est responsable s’il arrive quelque chose ?',
    reponse:
      'Cette question est traitée dans les conditions générales. Le service met en relation : il n’assure pas le vélo et n’en assure pas la garde.',
  },
  {
    question: 'Quels vélos sont acceptés ?',
    reponse:
      'Chaque bike sitter indique ce qu’il peut accueillir parmi les douze types du réseau. Un cargo, un longtail ou un vélo avec remorque ne passe pas partout : c’est précisé sur chaque emplacement.',
  },
  {
    question: 'Combien de temps puis-je laisser mon vélo ?',
    reponse:
      'Cela se convient directement avec le bike sitter. La plupart des stationnements durent quelques heures, certains quelques jours.',
  },
  {
    question: 'Y a-t-il des notes ou un classement des membres ?',
    reponse:
      'Non, et il n’y en aura pas. Ni palmarès, ni tri par popularité, ni filtre par note. Un classement dans un réseau de bénévoles crée des perdants et pousse à accepter des gardes qu’on aurait dû refuser.',
  },
  {
    question: 'Comment le vélo change-t-il de mains ?',
    reponse:
      'Avec un code à quatre chiffres : celui qui remet le vélo le détient, celui qui le reçoit le saisit. Il vaut six heures et accepte trois essais, puis il est régénéré. Ni QR code ni Bluetooth : un code se dicte à voix haute, dans une cave sans réseau, avec des gants.',
  },
  {
    question: 'Je n’ai pas de vélo, puis-je accueillir ?',
    reponse:
      'Bien sûr. Beaucoup de bike sitters ne font pas de vélo : ils ont simplement un emplacement vide et l’envie de rendre service.',
  },
  {
    question: 'Puis-je proposer le local à vélos de mon immeuble ?',
    reponse:
      'Non. Un emplacement doit être inaccessible au public et aux autres résidents de l’immeuble : c’est ce qui fait la différence entre un abri et un vélo laissé à la vue de tous. Les quatorze types proposés respectent tous cette règle.',
  },
  {
    question: 'Combien d’emplacements puis-je proposer ?',
    reponse:
      'Deux au maximum. Au-delà, on ne parle plus d’un voisin qui rend service mais d’un gestionnaire de parking.',
  },
];
