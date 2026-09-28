import type { EtatDeGarde } from '@/lib/regles/garde';

/**
 * Comment chaque état de garde se montre sur une carte.
 *
 * Règle 6 — une couleur, un sens. Le vert dit le déroulement normal, l'ambre
 * ce qui est en cours ou en examen, le corail ce qui est refusé ou annulé. La
 * couleur n'est jamais seule : le texte de la pastille dit l'état en toutes
 * lettres, et il se lit sans voir la couleur.
 */
export type PastilleDEtat = {
  /** La classe de la pastille : `.status`, `.status-attente`, `.status-refus`. */
  pastille: string;
  /** Ce qui s'écrit dans la pastille. */
  texte: string;
  /** La classe ajoutée à `.guard-card`. */
  carte: string;
  /** La classe de la vignette de date. */
  date: string;
};

const VERT: Pick<PastilleDEtat, 'pastille' | 'carte' | 'date'> = {
  pastille: 'status',
  carte: 'guard-card',
  date: 'guard-date',
};

const AMBRE: Pick<PastilleDEtat, 'pastille' | 'carte' | 'date'> = {
  pastille: 'status status-attente',
  carte: 'guard-card attente',
  date: 'guard-date attente-date',
};

const CORAIL: Pick<PastilleDEtat, 'pastille' | 'carte' | 'date'> = {
  pastille: 'status status-refus',
  carte: 'guard-card refus',
  date: 'guard-date gris-date',
};

const TERMINEE: Pick<PastilleDEtat, 'pastille' | 'carte' | 'date'> = {
  pastille: 'status',
  carte: 'guard-card terminee',
  date: 'guard-date gris-date',
};

export const PASTILLE_DE_L_ETAT: Readonly<Record<EtatDeGarde, PastilleDEtat>> = {
  // Une demande envoyée suit le déroulement normal : vert clair (règle 6),
  // comme dans `TON_DE_L_ETAT`. L'ambre est réservé au vélo chez le bike
  // sitter et aux dossiers en examen.
  demande: { ...VERT, texte: 'Demande envoyée' },
  accepte: { ...VERT, texte: 'Garde confirmée' },
  arrivee: { ...VERT, texte: 'Cycliste devant la porte' },
  en_cours: { ...AMBRE, texte: 'Vélo chez le Bike Sitter' },
  reprise_demandee: { ...AMBRE, texte: 'Reprise en cours' },
  litige: { ...AMBRE, texte: 'Signalement en examen' },
  termine: { ...TERMINEE, texte: 'Garde terminée' },
  refuse: { ...CORAIL, texte: 'Demande refusée' },
  annule: { ...CORAIL, texte: 'Garde annulée' },
  expire: { ...CORAIL, texte: 'Demande expirée' },
};
