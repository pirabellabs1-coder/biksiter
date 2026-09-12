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
      'Oui, pour tout le monde. Les bike sitters accueillent bénévolement et aucune commission n’est prélevée. Bike Sitters est un réseau d’entraide porté par une association sans but lucratif.',
  },
  {
    question: 'Mon adresse sera-t-elle visible ?',
    reponse:
      'Non. La carte n’affiche qu’une zone d’au moins 250 mètres. L’adresse exacte n’est transmise qu’au cycliste dont vous avez accepté la demande.',
  },
  {
    question: 'Pourquoi faut-il une invitation ?',
    reponse:
      'Pendant son lancement, le réseau s’ouvre sur invitation d’un membre. Cela nous permet de grandir quartier par quartier et de vérifier chaque personne avec soin. La liste d’attente est ouverte à tous : elle nous indique où ouvrir ensuite.',
  },
  {
    question: 'Faut-il un compte pour demander une place ?',
    reponse:
      'Oui, un compte dont l’identité a été vérifiée. Les bike sitters accueillent ainsi des vélos en toute confiance, et vous savez vous aussi à qui vous confiez le vôtre.',
  },
  {
    question: 'Que devient ma pièce d’identité ?',
    reponse:
      'Elle est vérifiée par une personne de l’association, puis supprimée, au plus tard après sept jours. Nous ne conservons que le résultat de la vérification.',
  },
  {
    question: 'Qui est responsable s’il arrive quelque chose ?',
    reponse:
      'Bike Sitters met en relation des cyclistes et des bike sitters ; le service n’assure ni le vélo ni la garde. Le partage des responsabilités est détaillé dans les conditions générales.',
  },
  {
    question: 'Quels vélos sont acceptés ?',
    reponse:
      'Chaque bike sitter indique les types de vélo qu’il peut accueillir. Les vélos cargo, longtail ou avec remorque demandent plus de place : c’est précisé sur chaque emplacement.',
  },
  {
    question: 'Combien de temps puis-je laisser mon vélo ?',
    reponse:
      'Vous en convenez directement avec le bike sitter. La plupart des stationnements durent quelques heures, certains quelques jours.',
  },
  {
    question: 'Y a-t-il des notes ou un classement des membres ?',
    reponse:
      'Non. Les membres ne sont ni notés ni classés : chacun accueille selon ses disponibilités, sans pression. Après un stationnement, le cycliste peut simplement partager quelques mots sur son expérience.',
  },
  {
    question: 'Comment le vélo change-t-il de mains ?',
    reponse:
      'Avec un code à quatre chiffres. La personne qui remet le vélo le communique, celle qui le reçoit le saisit. Le code reste valable six heures et accepte trois essais. Il se dicte facilement, même dans une cave sans réseau.',
  },
  {
    question: 'Je n’ai pas de vélo, puis-je accueillir ?',
    reponse:
      'Bien sûr. Beaucoup de bike sitters n’ont pas de vélo : ils disposent simplement d’un emplacement libre et ont envie de rendre service.',
  },
  {
    question: 'Puis-je proposer le local à vélos de mon immeuble ?',
    reponse:
      'Non. L’emplacement doit être fermé et réservé à votre usage, sans accès pour le public ni pour les autres résidents. C’est ce qui garantit la sécurité des vélos accueillis.',
  },
  {
    question: 'Combien d’emplacements puis-je proposer ?',
    reponse:
      'Jusqu’à deux par membre. Bike Sitters reste ainsi un réseau d’entraide entre particuliers.',
  },
];
